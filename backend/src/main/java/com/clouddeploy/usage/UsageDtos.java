package com.clouddeploy.usage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UsageDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsageQuotaResponse {
        private String ownerId;
        private Long storageBytes;
        private Long storageQuotaBytes;
        private Integer projectCount;
        private Integer maxSites;
        private Integer deploymentCount;
        private Double storagePercent;
        private Double projectPercent;
    }
}
