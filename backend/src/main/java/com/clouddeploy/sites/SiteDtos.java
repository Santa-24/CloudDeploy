package com.clouddeploy.sites;

import com.clouddeploy.deployments.DeploymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class SiteDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSiteRequest {
        @NotBlank(message = "Site name is required")
        @Size(max = 100, message = "Site name cannot exceed 100 characters")
        private String name;

        @NotBlank(message = "Site slug is required")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase alphanumeric characters and dashes")
        @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters")
        private String slug;

        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SiteResponse {
        private String id;
        private String ownerId;
        private String name;
        private String slug;
        private String description;
        private String currentDeploymentId;
        private String liveUrl;
        private DeploymentStatus latestStatus;
        private Integer deploymentCount;
        private Long storageBytes;
        private Instant createdAt;
        private Instant updatedAt;
    }
}
