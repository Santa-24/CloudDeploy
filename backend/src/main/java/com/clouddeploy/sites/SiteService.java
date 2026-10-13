package com.clouddeploy.sites;

import com.clouddeploy.audit.AuditService;
import com.clouddeploy.common.exceptions.QuotaExceededException;
import com.clouddeploy.common.exceptions.ResourceNotFoundException;
import com.clouddeploy.common.exceptions.UnauthorizedException;
import com.clouddeploy.delivery.UrlGenerationService;
import com.clouddeploy.deployments.Deployment;
import com.clouddeploy.deployments.DeploymentRepository;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRole;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteService {

    private static final Logger log = LoggerFactory.getLogger(SiteService.class);
    private final SiteRepository siteRepository;
    private final DeploymentRepository deploymentRepository;
    private final UrlGenerationService urlGenerationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<SiteDtos.SiteResponse> getSitesForUser(User user) {
        List<Site> sites = siteRepository.findByOwnerIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId());
        return sites.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SiteDtos.SiteResponse getSiteForUser(User user, String siteId) {
        Site site = verifyOwnership(user, siteId);
        return toResponse(site);
    }

    @Transactional
    public SiteDtos.SiteResponse createSite(User user, SiteDtos.CreateSiteRequest request) {
        log.info("Creating new site '{}' for tenant {}", request.getName(), user.getEmail());

        long activeSiteCount = siteRepository.countByOwnerIdAndDeletedAtIsNull(user.getId());
        if (activeSiteCount >= user.getMaxSites()) {
            String tierName = user.getPlanTier() != null ? user.getPlanTier().name() : "FREE";
            throw new QuotaExceededException("Account has reached maximum project limit of " + user.getMaxSites() + 
                    " websites on the " + tierName + " tier. Please upgrade your plan to deploy more projects.");
        }

        if (siteRepository.findBySlugAndDeletedAtIsNull(request.getSlug()).isPresent()) {
            throw new IllegalArgumentException("The URL slug '" + request.getSlug() + "' is already in use.");
        }

        String siteId = "site-" + UUID.randomUUID().toString().substring(0, 8);
        Site site = Site.builder()
                .id(siteId)
                .ownerId(user.getId())
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .build();

        Site saved = siteRepository.save(site);
        auditService.record(user.getEmail(), "SITE_CREATE", saved.getId(), "Site registered: " + saved.getName());

        return toResponse(saved);
    }

    @Transactional
    public void deleteSite(User user, String siteId) {
        Site site = verifyOwnership(user, siteId);
        site.setDeletedAt(Instant.now());
        siteRepository.save(site);
        auditService.record(user.getEmail(), "SITE_DELETE", site.getId(), "Site deleted: " + site.getName());
    }

    public Site verifyOwnership(User user, String siteId) {
        Site site = siteRepository.findByIdAndDeletedAtIsNull(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Website project " + siteId + " not found."));

        if (!site.getOwnerId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Access denied: You do not own website project " + siteId);
        }
        return site;
    }

    public SiteDtos.SiteResponse toResponse(Site site) {
        List<Deployment> deps = deploymentRepository.findBySiteIdOrderByVersionDesc(site.getId());
        Deployment latest = deps.isEmpty() ? null : deps.get(0);
        long totalStorage = deps.stream().mapToLong(Deployment::getTotalBytes).sum();

        return SiteDtos.SiteResponse.builder()
                .id(site.getId())
                .ownerId(site.getOwnerId())
                .name(site.getName())
                .slug(site.getSlug())
                .description(site.getDescription())
                .currentDeploymentId(site.getCurrentDeploymentId())
                .liveUrl(urlGenerationService.generateLiveUrl(site.getId()))
                .latestStatus(latest != null ? latest.getStatus() : null)
                .deploymentCount(deps.size())
                .storageBytes(totalStorage)
                .createdAt(site.getCreatedAt())
                .updatedAt(site.getUpdatedAt())
                .build();
    }
}
