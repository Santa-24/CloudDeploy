package com.clouddeploy.users;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPlanResponse {
    private String userId;
    private String email;
    private PlanTier planTier;
    private int maxSites;
    private long storageQuotaBytes;
    private long storageQuotaMb;
    private int priceMonthlyUsd;

    public static UserPlanResponse from(User user) {
        PlanTier tier = user.getPlanTier() != null ? user.getPlanTier() : PlanTier.FREE;
        return UserPlanResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .planTier(tier)
                .maxSites(user.getMaxSites())
                .storageQuotaBytes(user.getStorageQuotaBytes())
                .storageQuotaMb(user.getStorageQuotaBytes() / (1024 * 1024))
                .priceMonthlyUsd(tier.getMonthlyPriceUsd())
                .build();
    }
}
