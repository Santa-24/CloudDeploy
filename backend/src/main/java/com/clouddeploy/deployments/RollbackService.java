package com.clouddeploy.deployments;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.ResourceNotFoundException;
import com.clouddeploy.delivery.CloudFrontDeliveryService;
import com.clouddeploy.delivery.UrlGenerationService;
import com.clouddeploy.sites.Site;
import com.clouddeploy.sites.SiteRepository;
import com.clouddeploy.sites.SiteService;
import com.clouddeploy.users.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RollbackService {

    private static final Logger log = LoggerFactory.getLogger(RollbackService.class);
    private final SiteService siteService;
    private final SiteRepository siteRepository;
    private final DeploymentRepository deploymentRepository;
    private final DeploymentEventRepository eventRepository;
    private final CloudFrontDeliveryService cloudFrontDeliveryService;
    private final UrlGenerationService urlGenerationService;
    private final AuditService auditService;

    @Transactional
    public Deployment executeRollback(User user, String siteId, String targetDeploymentId) {
        log.info("Executing version rollback for site {} to deployment {} by {}", siteId, targetDeploymentId, user.getEmail());

        // 1. Verify project ownership
        Site site = siteService.verifyOwnership(user, siteId);

        // 2. Verify target version exists and was successfully published
        Deployment target = deploymentRepository.findById(targetDeploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Target rollback deployment " + targetDeploymentId + " does not exist."));

        if (!target.getSiteId().equals(siteId)) {
            throw new IllegalArgumentException("Target deployment " + targetDeploymentId + " does not belong to site " + siteId);
        }

        if (target.getStatus() != DeploymentStatus.SUCCEEDED) {
            throw new IllegalStateException("Cannot roll back to unverified or failed deployment version v" + target.getVersion());
        }

        // 3. Increment version sequence to preserve immutable release history
        int nextVersion = deploymentRepository.findTopBySiteIdOrderByVersionDesc(siteId)
                .map(d -> d.getVersion() + 1)
                .orElse(1);

        String rollbackDeploymentId = "dep-rb-" + UUID.randomUUID().toString().substring(0, 8) + "-v" + nextVersion;
        String liveUrl = urlGenerationService.generateLiveUrl(site.getId());

        Deployment rollbackRecord = Deployment.builder()
                .id(rollbackDeploymentId)
                .siteId(siteId)
                .version(nextVersion)
                .status(DeploymentStatus.SUCCEEDED)
                .s3Prefix(target.getS3Prefix()) // Re-points to immutable target release prefix
                .liveUrl(liveUrl)
                .fileCount(target.getFileCount())
                .totalBytes(target.getTotalBytes())
                .startedAt(Instant.now())
                .completedAt(Instant.now())
                .build();

        rollbackRecord = deploymentRepository.save(rollbackRecord);

        // 4. Update current deployment reference in RDS
        site.setCurrentDeploymentId(rollbackDeploymentId);
        siteRepository.save(site);

        // 5. Apply CloudFront cache invalidation
        cloudFrontDeliveryService.invalidateSiteCache(site.getId());

        // 6. Record rollback events
        DeploymentEvent event = DeploymentEvent.builder()
                .id("ev-" + UUID.randomUUID().toString().substring(0, 8))
                .deploymentId(rollbackDeploymentId)
                .eventType("ROLLBACK_APPLIED")
                .message(String.format("Rolled back to assets of version v%d (%s). Edge caches refreshed.",
                        target.getVersion(), target.getId()))
                .timestamp(Instant.now())
                .build();
        eventRepository.save(event);

        auditService.record(user.getEmail(), "DEPLOYMENT_ROLLBACK", siteId,
                String.format("Reverted to release v%d, now live as v%d", target.getVersion(), nextVersion));

        return rollbackRecord;
    }
}
