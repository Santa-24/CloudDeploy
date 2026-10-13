package com.clouddeploy.storage;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
@ConditionalOnProperty(name = "app.storage-mode", havingValue = "s3")
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);
    private final S3Client s3Client;

    @Value("${aws.s3.upload-bucket:clouddeploy-uploads-staging}")
    private String uploadBucket;

    @Value("${aws.s3.site-bucket:clouddeploy-sites-published}")
    private String siteBucket;

    @Override
    public String uploadStagingZip(String userId, String siteId, String uploadId, InputStream inputStream, long sizeBytes) {
        String s3Key = String.format("uploads/%s/%s/%s.zip", userId, siteId, uploadId);
        log.info("[S3 STORAGE] Uploading staging archive to s3://{}/{}", uploadBucket, s3Key);

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(uploadBucket)
                .key(s3Key)
                .serverSideEncryption(ServerSideEncryption.AES256)
                .contentType("application/zip")
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, sizeBytes));
        return s3Key;
    }

    @Override
    public void publishDeploymentFiles(String siteId, String deploymentId, Path localExtractedDir, List<String> relativePaths) {
        log.info("[S3 STORAGE] Publishing {} assets to s3://{}/sites/{}/deployments/{}/ and root s3://{}/sites/{}/",
                relativePaths.size(), siteBucket, siteId, deploymentId, siteBucket, siteId);

        for (String relativePath : relativePaths) {
            Path filePath = localExtractedDir.resolve(relativePath);
            if (!Files.isRegularFile(filePath)) continue;

            String normalizedRel = relativePath.replace('\\', '/');
            String s3Key = String.format("sites/%s/deployments/%s/%s", siteId, deploymentId, normalizedRel);
            String rootKey = String.format("sites/%s/%s", siteId, normalizedRel);
            String contentType = determineContentType(relativePath);
            String cacheControl = relativePath.endsWith("index.html") || relativePath.endsWith("index.htm")
                    ? "public, max-age=0, must-revalidate"
                    : "public, max-age=31536000, immutable";

            // Upload to versioned deployment prefix
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(siteBucket)
                    .key(s3Key)
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .contentType(contentType)
                    .cacheControl(cacheControl)
                    .build();
            s3Client.putObject(putRequest, RequestBody.fromFile(filePath));

            // Upload to active site root prefix
            PutObjectRequest rootPutRequest = PutObjectRequest.builder()
                    .bucket(siteBucket)
                    .key(rootKey)
                    .serverSideEncryption(ServerSideEncryption.AES256)
                    .contentType(contentType)
                    .cacheControl(cacheControl)
                    .build();
            s3Client.putObject(rootPutRequest, RequestBody.fromFile(filePath));
        }
    }

    @Override
    public void deleteDeploymentFiles(String siteId, String deploymentId) {
        String prefix = String.format("sites/%s/deployments/%s/", siteId, deploymentId);
        log.info("[S3 STORAGE] Deleting prefix s3://{}/{}", siteBucket, prefix);

        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(siteBucket)
                .prefix(prefix)
                .build();

        ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
        for (S3Object s3Object : listResponse.contents()) {
            s3Client.deleteObject(DeleteObjectRequest.builder().bucket(siteBucket).key(s3Object.key()).build());
        }
    }

    @Override
    public long calculateSiteStorageBytes(String siteId) {
        String prefix = String.format("sites/%s/", siteId);
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(siteBucket)
                .prefix(prefix)
                .build();

        ListObjectsV2Response listResponse = s3Client.listObjectsV2(listRequest);
        return listResponse.contents().stream().mapToLong(S3Object::size).sum();
    }

    private String determineContentType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html; charset=utf-8";
        if (lower.endsWith(".css")) return "text/css; charset=utf-8";
        if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript; charset=utf-8";
        if (lower.endsWith(".json")) return "application/json; charset=utf-8";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".ico")) return "image/x-icon";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".woff")) return "font/woff";
        if (lower.endsWith(".ttf")) return "font/ttf";
        if (lower.endsWith(".txt")) return "text/plain; charset=utf-8";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
    }
}
