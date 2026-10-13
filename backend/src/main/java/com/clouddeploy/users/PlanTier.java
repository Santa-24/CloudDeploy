package com.clouddeploy.users;

public enum PlanTier {
    FREE(3, 52428800L, 0),             // 3 sites, 50 MB, $0
    PRO(25, 5368709120L, 19),          // 25 sites, 5 GB, $19/mo
    TEAM(100, 53687091200L, 79);       // 100 sites, 50 GB, $79/mo

    private final int maxSites;
    private final long storageQuotaBytes;
    private final int monthlyPriceUsd;

    PlanTier(int maxSites, long storageQuotaBytes, int monthlyPriceUsd) {
        this.maxSites = maxSites;
        this.storageQuotaBytes = storageQuotaBytes;
        this.monthlyPriceUsd = monthlyPriceUsd;
    }

    public int getMaxSites() {
        return maxSites;
    }

    public long getStorageQuotaBytes() {
        return storageQuotaBytes;
    }

    public int getMonthlyPriceUsd() {
        return monthlyPriceUsd;
    }
}
