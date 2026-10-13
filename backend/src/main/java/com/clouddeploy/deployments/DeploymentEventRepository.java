package com.clouddeploy.deployments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentEventRepository extends JpaRepository<DeploymentEvent, String> {
    List<DeploymentEvent> findByDeploymentIdOrderByTimestampAsc(String deploymentId);
}
