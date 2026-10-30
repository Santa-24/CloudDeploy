package com.clouddeploy.deployments;

import com.clouddeploy.users.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentService deploymentService;
    private final RollbackService rollbackService;

    @PostMapping("/sites/{siteId}/deployments")
    public ResponseEntity<Deployment> deployArchive(
            @AuthenticationPrincipal User user,
            @PathVariable String siteId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "region", required = false) String region) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deploymentService.deployArchive(user, siteId, file, region));
    }

    @GetMapping("/sites/{siteId}/deployments")
    public ResponseEntity<List<Deployment>> getDeployments(
            @AuthenticationPrincipal User user,
            @PathVariable String siteId) {
        return ResponseEntity.ok(deploymentService.getDeploymentsForSite(user, siteId));
    }

    @GetMapping("/deployments/{deploymentId}")
    public ResponseEntity<Deployment> getDeployment(
            @AuthenticationPrincipal User user,
            @PathVariable String deploymentId) {
        return ResponseEntity.ok(deploymentService.getDeployment(user, deploymentId));
    }

    @GetMapping("/deployments/{deploymentId}/events")
    public ResponseEntity<List<DeploymentEvent>> getDeploymentEvents(
            @AuthenticationPrincipal User user,
            @PathVariable String deploymentId) {
        return ResponseEntity.ok(deploymentService.getDeploymentEvents(user, deploymentId));
    }

    @PostMapping("/sites/{siteId}/rollback")
    public ResponseEntity<Deployment> rollback(
            @AuthenticationPrincipal User user,
            @PathVariable String siteId,
            @Valid @RequestBody RollbackRequestDto request) {
        return ResponseEntity.ok(rollbackService.executeRollback(user, siteId, request.getTargetDeploymentId()));
    }
}
