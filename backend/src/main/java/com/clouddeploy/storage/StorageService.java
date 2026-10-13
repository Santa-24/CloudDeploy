package com.clouddeploy.storage;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;

public interface StorageService {
    String uploadStagingZip(String userId, String siteId, String uploadId, InputStream inputStream, long sizeBytes);
    void publishDeploymentFiles(String siteId, String deploymentId, Path localExtractedDir, List<String> relativePaths);
    void deleteDeploymentFiles(String siteId, String deploymentId);
    long calculateSiteStorageBytes(String siteId);
}
