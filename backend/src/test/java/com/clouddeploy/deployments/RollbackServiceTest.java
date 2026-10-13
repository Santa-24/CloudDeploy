package com.clouddeploy.deployments;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.delivery.CloudFrontDeliveryService;
import com.clouddeploy.delivery.UrlGenerationService;
import com.clouddeploy.sites.Site;
import com.clouddeploy.sites.SiteRepository;
import com.clouddeploy.sites.SiteService;
import com.clouddeploy.users.AccountStatus;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RollbackServiceTest {

    @Mock
    private SiteService siteService;
    @Mock
    private SiteRepository siteRepository;
    @Mock
    private DeploymentRepository deploymentRepository;
    @Mock
    private DeploymentEventRepository eventRepository;
    @Mock
    private CloudFrontDeliveryService cloudFrontDeliveryService;
    @Mock
    private UrlGenerationService urlGenerationService;
    @Mock
    private AuditService auditService;

    private RollbackService rollbackService;

    private User user;
    private Site site;
    private Deployment successfulV1;
    private Deployment failedV2;

    @BeforeEach
    void setUp() {
        rollbackService = new RollbackService(
                siteService, siteRepository, deploymentRepository,
                eventRepository, cloudFrontDeliveryService, urlGenerationService, auditService
        );

        user = User.builder()
                .id("usr-tenant-1")
                .email("tenant@studio.internal")
                .role(UserRole.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        site = Site.builder()
                .id("site-8888")
                .ownerId(user.getId())
                .name("Demo Site")
                .slug("demo-site")
                .currentDeploymentId("dep-v2")
                .build();

        successfulV1 = Deployment.builder()
                .id("dep-v1")
                .siteId("site-8888")
                .version(1)
                .status(DeploymentStatus.SUCCEEDED)
                .s3Prefix("sites/site-8888/deployments/dep-v1/")
                .fileCount(12)
                .totalBytes(5000000L)
                .build();

        failedV2 = Deployment.builder()
                .id("dep-v2")
                .siteId("site-8888")
                .version(2)
                .status(DeploymentStatus.FAILED)
                .s3Prefix("sites/site-8888/deployments/dep-v2/")
                .build();
    }

    @Test
    void testRollbackToSuccessfulVersion_Success() {
        when(siteService.verifyOwnership(user, "site-8888")).thenReturn(site);
        when(deploymentRepository.findById("dep-v1")).thenReturn(Optional.of(successfulV1));
        when(deploymentRepository.findTopBySiteIdOrderByVersionDesc("site-8888")).thenReturn(Optional.of(failedV2));
        when(urlGenerationService.generateLiveUrl("site-8888")).thenReturn("https://sites.clouddeploy.internal/s/site-8888/");
        when(deploymentRepository.save(any(Deployment.class))).thenAnswer(inv -> inv.getArgument(0));

        Deployment result = rollbackService.executeRollback(user, "site-8888", "dep-v1");

        assertNotNull(result);
        assertEquals(3, result.getVersion()); // New version v3 created
        assertEquals(DeploymentStatus.SUCCEEDED, result.getStatus());
        assertEquals("sites/site-8888/deployments/dep-v1/", result.getS3Prefix());

        // Verify active pointer updated in site
        assertEquals(result.getId(), site.getCurrentDeploymentId());
        verify(siteRepository).save(site);
        verify(cloudFrontDeliveryService).invalidateSiteCache("site-8888");
    }

    @Test
    void testRollbackToFailedVersion_ThrowsException() {
        when(siteService.verifyOwnership(user, "site-8888")).thenReturn(site);
        when(deploymentRepository.findById("dep-v2")).thenReturn(Optional.of(failedV2));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                rollbackService.executeRollback(user, "site-8888", "dep-v2")
        );

        assertTrue(ex.getMessage().contains("Cannot roll back to unverified or failed deployment"));
    }
}
