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
        if (cloudFrontDomain != null && !cloudFrontDomain.isBlank() 
                && !cloudFrontDomain.contains("example") 
                && !cloudFrontDomain.contains("d11111")
                && !cloudFrontDomain.contains("placeholder")) {
            return String.format("https://%s/sites/%s/index.html", cloudFrontDomain.trim(), siteId);
        }
        return String.format("/sites/%s/index.html", siteId);
    }
}

