package com.clouddeploy.delivery;

import com.clouddeploy.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UrlGenerationService {

    private final StorageProperties storageProperties;

    @Value("${aws.cloudfront.domain:}")
    private String cloudFrontDomain;

    public String generateLiveUrl(String siteId) {
        if (cloudFrontDomain != null && !cloudFrontDomain.isBlank() && !cloudFrontDomain.contains("example")) {
            return String.format("https://%s/sites/%s/index.html", cloudFrontDomain.trim(), siteId);
        }
        String baseDomain = storageProperties.getBaseDomain();
        if (baseDomain.startsWith("http://") || baseDomain.startsWith("https://")) {
            return String.format("%s/sites/%s/index.html", baseDomain, siteId);
        }
        return String.format("https://%s/sites/%s/index.html", baseDomain, siteId);
    }
}

