package com.clouddeploy.storage;

import com.clouddeploy.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.List;

@Service
@ConditionalOnProperty(name = "app.storage-mode", havingValue = "local", matchIfMissing = true)
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);
    private final StorageProperties storageProperties;

    private Path getBasePath() {
        return Paths.get(storageProperties.getLocalStoragePath()).toAbsolutePath().normalize();
    }

    @Override
    public String uploadStagingZip(String userId, String siteId, String uploadId, InputStream inputStream, long sizeBytes) {
        try {
            Path target = getBasePath().resolve(String.format("uploads/%s/%s/%s.zip", userId, siteId, uploadId));
            Files.createDirectories(target.getParent());
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            log.info("[LOCAL STORAGE] Staged archive to: {}", target);
            return target.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store staging upload locally", e);
        }
    }

    @Override
    public void publishDeploymentFiles(String siteId, String deploymentId, Path localExtractedDir, List<String> relativePaths) {
        try {
            Path targetBase = getBasePath().resolve(String.format("sites/%s/deployments/%s", siteId, deploymentId));
            Files.createDirectories(targetBase);

            for (String relativePath : relativePaths) {
                Path source = localExtractedDir.resolve(relativePath);
                Path dest = targetBase.resolve(relativePath);
                Files.createDirectories(dest.getParent());
                Files.copy(source, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("[LOCAL STORAGE] Published {} assets for site {} version {}", relativePaths.size(), siteId, deploymentId);
        } catch (IOException e) {
            throw new RuntimeException("Failed to publish static deployment files locally", e);
        }
    }

    @Override
    public void deleteDeploymentFiles(String siteId, String deploymentId) {
        try {
            Path targetBase = getBasePath().resolve(String.format("sites/%s/deployments/%s", siteId, deploymentId));
            if (Files.exists(targetBase)) {
                Files.walk(targetBase)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(p -> {
                            try { Files.deleteIfExists(p); } catch (Exception ignored) {}
                        });
            }
        } catch (Exception e) {
            log.warn("Error deleting local deployment files", e);
        }
    }

    @Override
    public long calculateSiteStorageBytes(String siteId) {
        try {
            Path siteBase = getBasePath().resolve(String.format("sites/%s", siteId));
            if (!Files.exists(siteBase)) return 0L;
            return Files.walk(siteBase)
                    .filter(Files::isRegularFile)
                    .mapToLong(p -> {
                        try { return Files.size(p); } catch (Exception e) { return 0L; }
                    })
                    .sum();
        } catch (Exception e) {
            return 0L;
        }
    }
}
