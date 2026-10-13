package com.clouddeploy.deployments;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "deployment_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeploymentEvent {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "deployment_id", length = 36, nullable = false)
    private String deploymentId;

    @Column(name = "event_type", length = 64, nullable = false)
    private String eventType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column(length = 1024, nullable = false)
    private String message;
}
