package com.clouddeploy.audit;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditEventRepository auditEventRepository;

    @Transactional
    public void record(String actor, String action, String resource, String metadata) {
        log.info("[AUDIT] actor={} action={} resource={} metadata={}", actor, action, resource, metadata);
        AuditEvent event = AuditEvent.builder()
                .id("aud-" + UUID.randomUUID().toString().substring(0, 8))
                .actor(actor)
                .action(action)
                .resource(resource)
                .metadata(metadata)
                .build();
        auditEventRepository.save(event);
    }
}
