package com.clouddeploy.audit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "audit_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String actor;

    @Column(length = 64, nullable = false)
    private String action;

    @Column(nullable = false)
    private String resource;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
