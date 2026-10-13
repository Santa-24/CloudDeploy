package com.clouddeploy.deployments;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.ArchiveValidationException;
import com.clouddeploy.common.exceptions.QuotaExceededException;
import com.clouddeploy.common.exceptions.ResourceNotFoundException;
import com.clouddeploy.delivery.CloudFrontDeliveryService;
import com.clouddeploy.delivery.UrlGenerationService;
import com.clouddeploy.sites.Site;
import com.clouddeploy.sites.SiteRepository;
import com.clouddeploy.sites.SiteService;
import com.clouddeploy.storage.StorageService;
import com.clouddeploy.users.User;
import com.clouddeploy.validation.ArchiveValidator;
import com.clouddeploy.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeploymentService {

    private static final Logger log = LoggerFactory.getLogger(DeploymentService.class);

    private final SiteRepository siteRepository;
    private final SiteService siteService;
    private final DeploymentRepository deploymentRepository;
    private final DeploymentEventRepository eventRepository;
    private final ArchiveValidator archiveValidator;
    private final StorageService storageService;
    private final CloudFrontDeliveryService cloudFrontDeliveryService;
    private final UrlGenerationService urlGenerationService;
    private final AuditService auditService;

    @Transactional
    public Deployment deployArchive(User user, String siteId, MultipartFile file) {
        log.info("Initiating static deployment pipeline for site {} by user {}", siteId, user.getEmail());

        // Step 1 & 2: Ownership verification
        Site site = siteService.verifyOwnership(user, siteId);

        // Step 3: Quota verification
        long currentStorage = storageService.calculateSiteStorageBytes(siteId);
        if (currentStorage + file.getSize() > user.getStorageQuotaBytes()) {
            throw new QuotaExceededException("Deployment exceeds user storage quota of " +
                    (user.getStorageQuotaBytes() / (1024 * 1024)) + " MB.");
        }

        // Determine next version number
        int nextVersion = deploymentRepository.findTopBySiteIdOrderByVersionDesc(siteId)
                .map(d -> d.getVersion() + 1)
                .orElse(1);

        String deploymentId = "dep-" + UUID.randomUUID().toString().substring(0, 8) + "-v" + nextVersion;
        String s3Prefix = String.format("sites/%s/deployments/%s/", siteId, deploymentId);
        String liveUrl = urlGenerationService.generateLiveUrl(site.getId());

        Deployment deployment = Deployment.builder()
                .id(deploymentId)
                .siteId(siteId)
                .version(nextVersion)
                .status(DeploymentStatus.QUEUED)
                .s3Prefix(s3Prefix)
                .liveUrl(liveUrl)
                .startedAt(Instant.now())
                .build();

        deployment = deploymentRepository.save(deployment);
        recordEvent(deploymentId, "ARCHIVE_RECEIVED", "ZIP archive received (" + file.getSize() + " bytes). Enqueued for validation.");

        Path tempDir = null;
        try {
            // Step 4 & 5: Upload staging
            storageService.uploadStagingZip(user.getId(), siteId, deploymentId, file.getInputStream(), file.getSize());

            // Step 6, 7 & 8: Validate Archive & Sandboxed Extraction
            updateStatus(deployment, DeploymentStatus.VALIDATING);
            recordEvent(deploymentId, "VALIDATION_STARTED", "Starting Zip Slip inspection, bomb caps, and index.html check.");

            tempDir = Files.createTempDirectory("clouddeploy-" + deploymentId);
            ValidationResult valResult = archiveValidator.validateAndExtract(file.getInputStream(), tempDir);

            recordEvent(deploymentId, "VALIDATION_PASSED",
                    String.format("Verified %d static files (%d uncompressed bytes). All safety checks passed.",
                            valResult.getFileCount(), valResult.getTotalUncompressedBytes()));

            // Step 9: S3 Publishing
            updateStatus(deployment, DeploymentStatus.PUBLISHING);
            recordEvent(deploymentId, "PUBLISHING_STARTED", "Publishing assets to S3 origin prefix: " + s3Prefix);

            storageService.publishDeploymentFiles(siteId, deploymentId, tempDir, valResult.getExtractedFiles());
            recordEvent(deploymentId, "S3_PUBLISHED", "Assets uploaded to private S3 bucket.");

            // Step 10: CloudFront Edge Invalidation
            cloudFrontDeliveryService.invalidateSiteCache(site.getId());
            recordEvent(deploymentId, "CLOUDFRONT_INVALIDATED", "Wildcard cache invalidation submitted to edge CDN.");

            // Step 11: Update Active Site Pointer
            site.setCurrentDeploymentId(deploymentId);
            siteRepository.save(site);

            // Step 12: Mark Success
            deployment.setStatus(DeploymentStatus.SUCCEEDED);
            deployment.setFileCount(valResult.getFileCount());
            deployment.setTotalBytes(valResult.getTotalUncompressedBytes());
            deployment.setCompletedAt(Instant.now());
            deployment = deploymentRepository.save(deployment);

            recordEvent(deploymentId, "SUCCEEDED", "Deployment is live globally at " + liveUrl);
            auditService.record(user.getEmail(), "DEPLOYMENT_SUCCESS", deploymentId, "Published version v" + nextVersion);

            return deployment;

        } catch (ArchiveValidationException ave) {
            log.warn("Deployment aborted for site {}: {}", siteId, ave.getMessage());
            markFailed(deployment, ave.getErrorCode(), ave.getMessage());
            throw ave;
        } catch (Exception ex) {
            log.error("Unexpected deployment failure for site " + siteId, ex);
            markFailed(deployment, "INTERNAL_PIPELINE_ERROR", ex.getMessage());
            throw new RuntimeException("Deployment failed: " + ex.getMessage(), ex);
        } finally {
            // Step 14: Safe cleanup of temporary directories
            if (tempDir != null) {
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (IOException ignored) {}
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Deployment> getDeploymentsForSite(User user, String siteId) {
        siteService.verifyOwnership(user, siteId);
        return deploymentRepository.findBySiteIdOrderByVersionDesc(siteId);
    }

    @Transactional(readOnly = true)
    public Deployment getDeployment(User user, String deploymentId) {
        Deployment dep = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment " + deploymentId + " not found."));
        siteService.verifyOwnership(user, dep.getSiteId());
        return dep;
    }

    @Transactional(readOnly = true)
    public List<DeploymentEvent> getDeploymentEvents(User user, String deploymentId) {
        getDeployment(user, deploymentId); // ownership check
        return eventRepository.findByDeploymentIdOrderByTimestampAsc(deploymentId);
    }

    private void updateStatus(Deployment deployment, DeploymentStatus status) {
        deployment.setStatus(status);
        deploymentRepository.save(deployment);
    }

    private void markFailed(Deployment deployment, String code, String message) {
        deployment.setStatus(DeploymentStatus.FAILED);
        deployment.setErrorCode(code);
        deployment.setErrorSummary(message);
        deployment.setCompletedAt(Instant.now());
        deploymentRepository.save(deployment);
        recordEvent(deployment.getId(), "FAILED", "[" + code + "] " + message);
    }

    private void recordEvent(String deploymentId, String eventType, String message) {
        DeploymentEvent event = DeploymentEvent.builder()
                .id("ev-" + UUID.randomUUID().toString().substring(0, 8))
                .deploymentId(deploymentId)
                .eventType(eventType)
                .message(message)
                .timestamp(Instant.now())
                .build();
        eventRepository.save(event);
    }
}
