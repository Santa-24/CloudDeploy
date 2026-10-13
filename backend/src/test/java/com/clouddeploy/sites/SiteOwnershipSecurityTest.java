package com.clouddeploy.sites;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.UnauthorizedException;
import com.clouddeploy.delivery.UrlGenerationService;
import com.clouddeploy.deployments.DeploymentRepository;
import com.clouddeploy.users.AccountStatus;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SiteOwnershipSecurityTest {

    @Mock
    private SiteRepository siteRepository;
    @Mock
    private DeploymentRepository deploymentRepository;
    @Mock
    private UrlGenerationService urlGenerationService;
    @Mock
    private AuditService auditService;

    private SiteService siteService;

    private User tenantA;
    private User tenantB;
    private User admin;
    private Site siteOfTenantA;

    @BeforeEach
    void setUp() {
        siteService = new SiteService(siteRepository, deploymentRepository, urlGenerationService, auditService);

        tenantA = User.builder()
                .id("usr-tenant-a")
                .email("tenant.a@studio.internal")
                .role(UserRole.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .maxSites(10)
                .build();

        tenantB = User.builder()
                .id("usr-tenant-b")
                .email("tenant.b@studio.internal")
                .role(UserRole.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .maxSites(10)
                .build();

        admin = User.builder()
                .id("usr-admin")
                .email("admin@clouddeploy.internal")
                .role(UserRole.ADMIN)
                .accountStatus(AccountStatus.ACTIVE)
                .maxSites(100)
                .build();

        siteOfTenantA = Site.builder()
                .id("site-12345")
                .ownerId(tenantA.getId())
                .name("Tenant A Portfolio")
                .slug("tenant-a-portfolio")
                .build();
    }

    @Test
    void testTenantCannotAccessAnotherTenantsProject() {
        when(siteRepository.findByIdAndDeletedAtIsNull("site-12345"))
                .thenReturn(Optional.of(siteOfTenantA));

        // Tenant B attempts to access Tenant A's project
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                siteService.verifyOwnership(tenantB, "site-12345")
        );

        assertTrue(ex.getMessage().contains("Access denied"));
    }

    @Test
    void testTenantCanAccessOwnProject() {
        when(siteRepository.findByIdAndDeletedAtIsNull("site-12345"))
                .thenReturn(Optional.of(siteOfTenantA));

        Site result = siteService.verifyOwnership(tenantA, "site-12345");
        assertNotNull(result);
        assertEquals("site-12345", result.getId());
    }

    @Test
    void testAdminCanAccessAnyProject() {
        when(siteRepository.findByIdAndDeletedAtIsNull("site-12345"))
                .thenReturn(Optional.of(siteOfTenantA));

        Site result = siteService.verifyOwnership(admin, "site-12345");
        assertNotNull(result);
        assertEquals("site-12345", result.getId());
    }
}
