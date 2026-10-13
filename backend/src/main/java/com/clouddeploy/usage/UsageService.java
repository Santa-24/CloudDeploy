package com.clouddeploy.usage;

import com.clouddeploy.deployments.Deployment;
import com.clouddeploy.deployments.DeploymentRepository;
import com.clouddeploy.sites.Site;
import com.clouddeploy.sites.SiteRepository;
import com.clouddeploy.storage.StorageService;
import com.clouddeploy.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsageService {

    private final SiteRepository siteRepository;
    private final DeploymentRepository deploymentRepository;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public UsageDtos.UsageQuotaResponse getUsageForUser(User user) {
        List<Site> userSites = siteRepository.findByOwnerIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId());
        int projectCount = userSites.size();

        long totalStorageBytes = 0L;
        int totalDeployments = 0;

        for (Site site : userSites) {
            List<Deployment> deps = deploymentRepository.findBySiteIdOrderByVersionDesc(site.getId());
            totalDeployments += deps.size();
            totalStorageBytes += deps.stream().mapToLong(Deployment::getTotalBytes).sum();
        }

        long quota = user.getStorageQuotaBytes() != null && user.getStorageQuotaBytes() > 0
                ? user.getStorageQuotaBytes()
                : 104857600L;
        int maxSites = user.getMaxSites() != null && user.getMaxSites() > 0
                ? user.getMaxSites()
                : 10;

        double storagePercent = Math.min(100.0, Math.round(((double) totalStorageBytes / quota) * 1000.0) / 10.0);
        double projectPercent = Math.min(100.0, Math.round(((double) projectCount / maxSites) * 1000.0) / 10.0);

        return UsageDtos.UsageQuotaResponse.builder()
                .ownerId(user.getId())
                .storageBytes(totalStorageBytes)
                .storageQuotaBytes(quota)
                .projectCount(projectCount)
                .maxSites(maxSites)
                .deploymentCount(totalDeployments)
                .storagePercent(storagePercent)
                .projectPercent(projectPercent)
                .build();
    }
}
