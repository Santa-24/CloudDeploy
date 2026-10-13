import { apiClient } from './apiClient';
import { PlanTier, PricingPlan, User, UserPlanResponse } from '../types';
import { MOCK_USER } from './mockData';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'FREE',
    name: 'Starter Hobby',
    tagline: 'Ideal for personal portfolios, documentation, and prototyping.',
    priceMonthly: 0,
    priceAnnual: 0,
    maxSites: 3,
    storageMb: 50,
    badge: 'FREE TIER',
    features: [
      'Deploy up to 3 static website projects',
      '50 MB Amazon S3 encrypted storage',
      'Global Amazon CloudFront edge CDN',
      '3-version automated rollback history',
      'Zip Slip sandboxing & file verification',
      'Sub-second live URL generation',
      'Community documentation & guides',
    ],
    ctaLabel: 'Start for Free',
  },
  {
    id: 'PRO',
    name: 'Pro Developer',
    tagline: 'For indie hackers, freelancers, and production web apps.',
    priceMonthly: 19,
    priceAnnual: 15,
    maxSites: 25,
    storageMb: 5000,
    popular: true,
    badge: 'MOST POPULAR',
    features: [
      'Deploy up to 25 website projects',
      '5 GB Amazon S3 encrypted object storage',
      'Custom domains with automated edge SSL',
      'Unlimited deployment version rollbacks',
      'Instant edge CDN cache invalidations',
      'CloudWatch real-time pipeline telemetry',
      'Priority decompression & upload queue',
      'Priority email & developer support',
    ],
    ctaLabel: 'Upgrade to Pro',
  },
  {
    id: 'TEAM',
    name: 'Team & Agency',
    tagline: 'For design studios, high-traffic SaaS, and enterprise workloads.',
    priceMonthly: 79,
    priceAnnual: 65,
    maxSites: 100,
    storageMb: 50000,
    badge: 'ENTERPRISE SCALE',
    features: [
      'Deploy up to 100+ website projects',
      '50 GB Amazon S3 isolated object storage',
      'Multi-tenant team roles & RBAC access',
      'Dedicated AWS S3 bucket prefix isolation',
      'Audit log compliance & export history',
      '99.99% CloudFront edge uptime SLA',
      'Custom edge redirect rules & response headers',
      '24/7 dedicated engineering support',
    ],
    ctaLabel: 'Upgrade to Team',
  },
];

export const planService = {
  getPlans(): PricingPlan[] {
    return PRICING_PLANS;
  },

  getPlanById(tier: PlanTier): PricingPlan {
    return PRICING_PLANS.find(p => p.id === tier) || PRICING_PLANS[0];
  },

  async getUserPlan(): Promise<UserPlanResponse> {
    if (apiClient.isDemoMode()) {
      return {
        userId: MOCK_USER.id,
        email: MOCK_USER.email,
        planTier: 'FREE',
        maxSites: 3,
        storageQuotaBytes: 52428800,
        storageQuotaMb: 50,
        priceMonthlyUsd: 0,
      };
    }
    return await apiClient.request<UserPlanResponse>('/users/plan');
  },

  async upgradePlan(tier: PlanTier): Promise<User> {
    if (apiClient.isDemoMode()) {
      await new Promise(r => setTimeout(r, 600));
      const plan = this.getPlanById(tier);
      const updatedUser: User = {
        ...MOCK_USER,
        planTier: tier,
        maxSites: plan.maxSites,
        storageQuotaBytes: plan.storageMb * 1024 * 1024,
      };
      return updatedUser;
    }

    return await apiClient.request<User>('/users/plan', {
      method: 'PUT',
      body: JSON.stringify({ planTier: tier }),
    });
  },
};
