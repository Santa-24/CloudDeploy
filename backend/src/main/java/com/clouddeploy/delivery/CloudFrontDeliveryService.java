package com.clouddeploy.delivery;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cloudfront.CloudFrontClient;
import software.amazon.awssdk.services.cloudfront.model.*;

import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudFrontDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(CloudFrontDeliveryService.class);
    private final CloudFrontClient cloudFrontClient;

    @Value("${aws.cloudfront.distribution-id:}")
    private String distributionId;

    @Value("${app.storage-mode:local}")
    private String storageMode;

    public void invalidateSiteCache(String siteId) {
        String invalidationPath = String.format("/sites/%s/*", siteId);
        log.info("[CLOUDFRONT] Invalidating edge cache for path: {}", invalidationPath);

        if ("local".equalsIgnoreCase(storageMode) || distributionId == null || distributionId.isBlank()) {
            log.info("[CLOUDFRONT] Local profile active: simulated edge invalidation for path {}", invalidationPath);
            return;
        }

        try {
            CreateInvalidationRequest invalidationRequest = CreateInvalidationRequest.builder()
                    .distributionId(distributionId)
                    .invalidationBatch(InvalidationBatch.builder()
                            .callerReference("cd-inv-" + UUID.randomUUID())
                            .paths(Paths.builder()
                                    .quantity(1)
                                    .items(Collections.singletonList(invalidationPath))
                                    .build())
                            .build())
                    .build();

            CreateInvalidationResponse response = cloudFrontClient.createInvalidation(invalidationRequest);
            log.info("[CLOUDFRONT] Invalidation dispatched. Invalidation ID: {}", response.invalidation().id());
        } catch (Exception e) {
            log.warn("[CLOUDFRONT] Non-fatal edge invalidation error: {}", e.getMessage());
        }
    }
}
