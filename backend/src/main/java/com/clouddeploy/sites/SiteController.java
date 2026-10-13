package com.clouddeploy.sites;

import com.clouddeploy.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    public ResponseEntity<List<SiteDtos.SiteResponse>> getSites(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(siteService.getSitesForUser(user));
    }

    @GetMapping("/{siteId}")
    public ResponseEntity<SiteDtos.SiteResponse> getSite(@AuthenticationPrincipal User user, @PathVariable String siteId) {
        return ResponseEntity.ok(siteService.getSiteForUser(user, siteId));
    }

    @PostMapping
    public ResponseEntity<SiteDtos.SiteResponse> createSite(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SiteDtos.CreateSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.createSite(user, request));
    }

    @DeleteMapping("/{siteId}")
    public ResponseEntity<Void> deleteSite(@AuthenticationPrincipal User user, @PathVariable String siteId) {
        siteService.deleteSite(user, siteId);
        return ResponseEntity.noContent().build();
    }
}
