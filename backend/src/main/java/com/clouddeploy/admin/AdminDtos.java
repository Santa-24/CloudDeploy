package com.clouddeploy.admin;

import com.clouddeploy.deployments.Deployment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AdminDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminOverviewResponse {
        private long totalUsers;
        private long totalSites;
        private long totalDeployments;
        private long activeSites;
        private long failedDeployments;
        private long totalStorageBytes;
        private String storageFormatted;
        private List<Deployment> recentDeployments;
        private List<Deployment> failedList;
    }
}
