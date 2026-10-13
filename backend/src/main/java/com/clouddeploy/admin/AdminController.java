package com.clouddeploy.admin;

import com.clouddeploy.deployments.Deployment;
import com.clouddeploy.deployments.DeploymentRepository;
import com.clouddeploy.deployments.DeploymentStatus;
import com.clouddeploy.sites.SiteRepository;
import com.clouddeploy.users.User;
import com.clouddeploy.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final DeploymentRepository deploymentRepository;

    @GetMapping("/overview")
    public ResponseEntity<AdminDtos.AdminOverviewResponse> getOverview() {
        long totalUsers = userRepository.count();
        long totalSites = siteRepository.count();
        long activeSites = siteRepository.countByDeletedAtIsNull();
        long totalDeployments = deploymentRepository.count();
        long failedDeployments = deploymentRepository.countByStatus(DeploymentStatus.FAILED);

        List<Deployment> recent = deploymentRepository.findTop10ByOrderByStartedAtDesc();
        List<Deployment> failedList = deploymentRepository.findByStatusOrderByStartedAtDesc(DeploymentStatus.FAILED);

        long totalStorage = deploymentRepository.findAll().stream()
                .mapToLong(Deployment::getTotalBytes)
                .sum();

        String formatted = totalStorage > 1073741824L
                ? String.format("%.2f GB", totalStorage / 1073741824.0)
                : String.format("%.1f MB", totalStorage / 1048576.0);

        AdminDtos.AdminOverviewResponse response = AdminDtos.AdminOverviewResponse.builder()
                .totalUsers(totalUsers)
                .totalSites(totalSites)
                .activeSites(activeSites)
                .totalDeployments(totalDeployments)
                .failedDeployments(failedDeployments)
                .totalStorageBytes(totalStorage)
                .storageFormatted(formatted)
                .recentDeployments(recent)
                .failedList(failedList)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/deployments")
    public ResponseEntity<List<Deployment>> getDeployments() {
        return ResponseEntity.ok(deploymentRepository.findTop10ByOrderByStartedAtDesc());
    }

    @GetMapping("/deployments/failed")
    public ResponseEntity<List<Deployment>> getFailedDeployments() {
        return ResponseEntity.ok(deploymentRepository.findByStatusOrderByStartedAtDesc(DeploymentStatus.FAILED));
    }
}
