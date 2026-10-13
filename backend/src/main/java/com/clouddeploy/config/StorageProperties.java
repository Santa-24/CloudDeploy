package com.clouddeploy.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class StorageProperties {
    private String baseDomain = "sites.clouddeploy.internal";
    private long uploadMaxBytes = 52428800L; // 50 MB
    private int maxFilesPerDeployment = 1000;
    private long maxExtractedBytes = 262144000L; // 250 MB
    private int maxProjectsPerUser = 3;
    private String storageMode = "local"; // "local" or "s3"
    private String localStoragePath = "./storage";
    private boolean demoAuthEnabled = true;
    private String jwtSecret = "clouddeploy-secure-jwt-signing-key-production-change-me-32chars";
}
