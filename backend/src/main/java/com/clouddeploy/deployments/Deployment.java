package com.clouddeploy.deployments;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "deployments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Deployment {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "site_id", length = 36, nullable = false)
    private String siteId;

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(length = 32, nullable = false)
    private DeploymentStatus status;

    @Column(length = 32, nullable = false)
    @Builder.Default
    private String region = "ap-south-1";

    @Column(name = "s3_prefix", length = 512, nullable = false)
    private String s3Prefix;

    @Column(name = "live_url", length = 512)
    private String liveUrl;

    @Column(name = "file_count", nullable = false)
    @Builder.Default
    private Integer fileCount = 0;

    @Column(name = "total_bytes", nullable = false)
    @Builder.Default
    private Long totalBytes = 0L;

    @Column(name = "error_code", length = 64)
    private String errorCode;

    @Column(name = "error_summary", length = 1024)
    private String errorSummary;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
