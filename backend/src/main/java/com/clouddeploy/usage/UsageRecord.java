package com.clouddeploy.usage;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "usage_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageRecord {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "owner_id", length = 36, nullable = false)
    private String ownerId;

    @Column(name = "storage_bytes", nullable = false)
    @Builder.Default
    private Long storageBytes = 0L;

    @Column(name = "deployment_count", nullable = false)
    @Builder.Default
    private Integer deploymentCount = 0;

    @Column(name = "project_count", nullable = false)
    @Builder.Default
    private Integer projectCount = 0;

    @CreationTimestamp
    @Column(name = "measured_at", nullable = false, updatable = false)
    private Instant measuredAt;
}
