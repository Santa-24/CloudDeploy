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

        @Size(max = 32, message = "Region cannot exceed 32 characters")
        private String region;
    }

    @Data
    @NoArgsConstructor
    public static class SiteResponse {
        private String id;
        private String ownerId;
        private String name;
        private String slug;
        private String description;
        private String region;
        private String currentDeploymentId;
        private String liveUrl;
        private DeploymentStatus latestStatus;
        private Integer deploymentCount;
        private Long storageBytes;
        private Instant createdAt;
        private Instant updatedAt;

        public SiteResponse(String id, String ownerId, String name, String slug, String description,
                            String region, String currentDeploymentId, String liveUrl,
                            DeploymentStatus latestStatus, Integer deploymentCount, Long storageBytes,
                            Instant createdAt, Instant updatedAt) {
            this.id = id;
            this.ownerId = ownerId;
            this.name = name;
            this.slug = slug;
            this.description = description;
            this.region = region;
            this.currentDeploymentId = currentDeploymentId;
            this.liveUrl = liveUrl;
            this.latestStatus = latestStatus;
            this.deploymentCount = deploymentCount;
            this.storageBytes = storageBytes;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        // Legacy 12-argument constructor for seamless backwards compatibility
        public SiteResponse(String id, String ownerId, String name, String slug, String description,
                            String currentDeploymentId, String liveUrl,
                            DeploymentStatus latestStatus, Integer deploymentCount, Long storageBytes,
                            Instant createdAt, Instant updatedAt) {
            this(id, ownerId, name, slug, description, "ap-south-1", currentDeploymentId, liveUrl,
                 latestStatus, deploymentCount, storageBytes, createdAt, updatedAt);
        }

        public static SiteResponseBuilder builder() {
            return new SiteResponseBuilder();
        }

        public static class SiteResponseBuilder {
            private String id;
            private String ownerId;
            private String name;
            private String slug;
            private String description;
            private String region;
            private String currentDeploymentId;
            private String liveUrl;
            private DeploymentStatus latestStatus;
            private Integer deploymentCount;
            private Long storageBytes;
            private Instant createdAt;
            private Instant updatedAt;

            public SiteResponseBuilder id(String id) { this.id = id; return this; }
            public SiteResponseBuilder ownerId(String ownerId) { this.ownerId = ownerId; return this; }
            public SiteResponseBuilder name(String name) { this.name = name; return this; }
            public SiteResponseBuilder slug(String slug) { this.slug = slug; return this; }
            public SiteResponseBuilder description(String description) { this.description = description; return this; }
            public SiteResponseBuilder region(String region) { this.region = region; return this; }
            public SiteResponseBuilder currentDeploymentId(String currentDeploymentId) { this.currentDeploymentId = currentDeploymentId; return this; }
            public SiteResponseBuilder liveUrl(String liveUrl) { this.liveUrl = liveUrl; return this; }
            public SiteResponseBuilder latestStatus(DeploymentStatus latestStatus) { this.latestStatus = latestStatus; return this; }
            public SiteResponseBuilder deploymentCount(Integer deploymentCount) { this.deploymentCount = deploymentCount; return this; }
            public SiteResponseBuilder storageBytes(Long storageBytes) { this.storageBytes = storageBytes; return this; }
            public SiteResponseBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
            public SiteResponseBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

            public SiteResponse build() {
                SiteResponse response = new SiteResponse();
                response.setId(this.id);
                response.setOwnerId(this.ownerId);
                response.setName(this.name);
                response.setSlug(this.slug);
                response.setDescription(this.description);
                response.setRegion(this.region != null ? this.region : "ap-south-1");
                response.setCurrentDeploymentId(this.currentDeploymentId);
                response.setLiveUrl(this.liveUrl);
                response.setLatestStatus(this.latestStatus);
                response.setDeploymentCount(this.deploymentCount);
                response.setStorageBytes(this.storageBytes);
                response.setCreatedAt(this.createdAt);
                response.setUpdatedAt(this.updatedAt);
                return response;
            }
        }
    }
}
