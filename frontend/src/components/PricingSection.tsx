import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { UpgradePlanModal } from './UpgradePlanModal';
import { useAuth } from '../hooks/useAuth';
import { planService } from '../services/planService';
import { PlanTier } from '../types';
import {
  Check,
  X,
  Zap,
  Sparkles,
  ShieldCheck,
  Globe,
  HardDrive,
  FolderKanban,
  RotateCcw,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface PricingSectionProps {
  showTitle?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ showTitle = true }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [modalOpen, setModalOpen] = useState(false);
  const [targetTier, setTargetTier] = useState<PlanTier>('PRO');

  const plans = planService.getPlans();
  const currentTier = user?.planTier || 'FREE';

  const handleAction = (tier: PlanTier) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    setTargetTier(tier);
    setModalOpen(true);
  };

  return (
    <div className="space-y-16">
      {/* Header and Toggle */}
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-paper text-xs font-mono tracking-wider uppercase border border-ink shadow-[2px_2px_0px_0px_#C65336]">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            Transparent Cloud Pricing
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-ink">
            Start Free. Scale to Millions of Requests.
          </h2>
          <p className="text-base text-ink-muted leading-relaxed">
            Every project begins on our generous <strong className="text-ink">Free Tier</strong>, allowing you to deploy up to 3 static websites directly to AWS without a credit card. Upgrade whenever you need higher capacity and custom domain routing.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 bg-paper-dark border-2 border-ink shadow-editorial-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-mono font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-ink text-paper font-bold shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'annual'
                    ? 'bg-ink text-paper font-bold shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-lime text-ink font-bold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map(plan => {
          const isCurrent = isAuthenticated && plan.id === currentTier;
          const isPopular = plan.popular;
          const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`flex flex-col justify-between p-8 border-2 transition-all ${
                isPopular
                  ? 'bg-paper-light border-ink shadow-[8px_8px_0px_0px_#C65336] relative md:-translate-y-2'
                  : 'bg-paper-light border-ink shadow-editorial'
              }`}
            >
              <div>
                {/* Popular or Tier Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-vermilion font-bold">
                    // {plan.badge || plan.id}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 bg-ink text-paper text-xs font-mono font-bold uppercase">
                      Current Plan
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-2xl font-bold text-ink">
                  {plan.name}
                </h3>
                <p className="text-xs text-ink-muted mt-1.5 mb-6 min-h-[32px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="p-4 bg-paper border border-stone-subtle mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-editorial text-4xl sm:text-5xl font-bold text-ink">
                      ${price}
                    </span>
                    <span className="text-xs font-mono text-ink-muted">
                      / month {billingCycle === 'annual' && '(billed annually)'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-ink-faint mt-1">
                    {plan.id === 'FREE' ? 'Free forever • No credit card required' : 'Full AWS origin performance included'}
                  </div>
                </div>

                {/* Quota Highlights */}
                <div className="space-y-2 pb-6 mb-6 border-b border-stone-subtle font-mono text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-paper-dark">
                    <span className="text-ink-muted">Project Allowance</span>
                    <span className="font-bold text-ink">
                      {plan.maxSites} Websites
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-paper-dark">
                    <span className="text-ink-muted">S3 Object Storage</span>
                    <span className="font-bold text-ink">
                      {plan.storageMb >= 1000 ? `${plan.storageMb / 1000} GB` : `${plan.storageMb} MB`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-ink-muted">CloudFront CDN</span>
                    <span className="text-green-700 font-bold">Global Edge</span>
                  </div>
                </div>

                {/* Detailed Features List */}
                <ul className="space-y-3 text-xs text-ink-muted mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-none bg-paper border border-ink flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-vermilion" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                <Button
                  variant={isPopular ? 'vermilion' : isCurrent ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => handleAction(plan.id)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isCurrent
                    ? 'Active Workspace Plan'
                    : isAuthenticated
                    ? plan.ctaLabel
                    : plan.id === 'FREE'
                    ? 'Start Free (3 Sites)'
                    : `Upgrade to ${plan.name}`}
                </Button>
                {plan.id === 'FREE' && (
                  <p className="text-[11px] font-mono text-center text-ink-faint mt-2">
                    Free tier deploys up to 3 projects without charge.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="space-y-6 pt-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
            // DETAILED COMPARISON
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-ink mt-1">
            Compare Plan Capabilities
          </h3>
        </div>

        <div className="border-2 border-ink overflow-x-auto bg-paper-light shadow-editorial">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-paper-dark border-b-2 border-ink uppercase tracking-wider text-ink">
              <tr>
                <th className="p-4 w-1/3">Capability</th>
                <th className="p-4 text-center">Starter (Free)</th>
                <th className="p-4 text-center bg-vermilion/10 text-vermilion font-bold">
                  Pro Developer
                </th>
                <th className="p-4 text-center">Team & Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-subtle text-ink">
              <tr>
                <td className="p-4 font-bold">Free Website Projects</td>
                <td className="p-4 text-center font-bold text-vermilion">Up to 3</td>
                <td className="p-4 text-center font-bold bg-vermilion/5">Up to 25</td>
                <td className="p-4 text-center font-bold">100+ Projects</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Amazon S3 Storage</td>
                <td className="p-4 text-center">50 MB</td>
                <td className="p-4 text-center bg-vermilion/5 font-semibold">5 GB</td>
                <td className="p-4 text-center font-semibold">50 GB</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Max File Size per Upload</td>
                <td className="p-4 text-center">25 MB</td>
                <td className="p-4 text-center bg-vermilion/5 font-semibold">100 MB</td>
                <td className="p-4 text-center font-semibold">250 MB</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Global CloudFront CDN</td>
                <td className="p-4 text-center text-green-700">✓ Included</td>
                <td className="p-4 text-center bg-vermilion/5 text-green-700">✓ Included</td>
                <td className="p-4 text-center text-green-700">✓ Included + SLA</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Automated Rollback History</td>
                <td className="p-4 text-center">Last 3 Releases</td>
                <td className="p-4 text-center bg-vermilion/5 font-semibold">Unlimited</td>
                <td className="p-4 text-center font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Custom Domains & SSL</td>
                <td className="p-4 text-center text-stone">CloudDeploy Subdomain</td>
                <td className="p-4 text-center bg-vermilion/5 text-green-700">✓ Custom + Auto SSL</td>
                <td className="p-4 text-center text-green-700">✓ Wildcard SSL</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Edge Cache Invalidation</td>
                <td className="p-4 text-center">Standard Queue</td>
                <td className="p-4 text-center bg-vermilion/5 font-semibold">Sub-second Instant</td>
                <td className="p-4 text-center font-semibold">Sub-second Instant</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">CloudWatch Edge Analytics</td>
                <td className="p-4 text-center text-stone">Basic Status</td>
                <td className="p-4 text-center bg-vermilion/5 text-green-700">✓ Telemetry Gauges</td>
                <td className="p-4 text-center text-green-700">✓ Full Metrics & Alarms</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Dedicated S3 Bucket Isolation</td>
                <td className="p-4 text-center text-stone">—</td>
                <td className="p-4 text-center bg-vermilion/5 text-stone">—</td>
                <td className="p-4 text-center text-green-700">✓ Dedicated Buckets</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Support Tier</td>
                <td className="p-4 text-center">Community & Docs</td>
                <td className="p-4 text-center bg-vermilion/5 font-semibold">Priority Email</td>
                <td className="p-4 text-center font-semibold">24/7 Architecture Lead</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing FAQ Grid */}
      <div className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-vermilion font-bold">
            // FREQUENTLY ASKED QUESTIONS
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-ink mt-1">
            Common Questions About Plans
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="flat" className="bg-paper-light">
            <h4 className="font-editorial text-lg font-bold text-ink mb-2">
              How does the Free Tier work?
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Every newly registered account receives our Free Tier immediately. You can register and deploy up to 3 separate website projects with 50 MB of S3 storage completely free of charge. Once you attempt to create a 4th project, you'll be asked to upgrade to Pro.
            </p>
          </Card>

          <Card variant="flat" className="bg-paper-light">
            <h4 className="font-editorial text-lg font-bold text-ink mb-2">
              What happens when I reach the project limit?
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              When your account hits 3 active projects, existing sites continue serving traffic globally on CloudFront without interruption. To deploy additional websites, simply upgrade to Pro for 25 projects or Team for unlimited scale.
            </p>
          </Card>

          <Card variant="flat" className="bg-paper-light">
            <h4 className="font-editorial text-lg font-bold text-ink mb-2">
              Can I upgrade or downgrade anytime?
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Yes! You can switch your plan with 1-click in the console anytime. Upgrades take effect immediately, raising your project limit and S3 storage quota without any downtime or redeployments.
            </p>
          </Card>

          <Card variant="flat" className="bg-paper-light">
            <h4 className="font-editorial text-lg font-bold text-ink mb-2">
              Are there any hidden bandwidth or edge fees?
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              No hidden fees. Every plan includes global CloudFront CDN distribution with SSL encryption and DDoS protection backed by AWS Shield standard.
            </p>
          </Card>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetTier={targetTier}
      />
    </div>
  );
};
