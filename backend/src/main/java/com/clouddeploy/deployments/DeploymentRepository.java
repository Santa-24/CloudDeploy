package com.clouddeploy.deployments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, String> {
    List<Deployment> findBySiteIdOrderByVersionDesc(String siteId);
    Optional<Deployment> findTopBySiteIdOrderByVersionDesc(String siteId);
    Optional<Deployment> findByIdAndSiteId(String id, String siteId);
    List<Deployment> findByStatusOrderByStartedAtDesc(DeploymentStatus status);
    List<Deployment> findTop10ByOrderByStartedAtDesc();
    long countByStatus(DeploymentStatus status);
}
