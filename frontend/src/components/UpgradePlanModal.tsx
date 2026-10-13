import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { useToast } from './Toast';
import { useAuth } from '../hooks/useAuth';
import { planService } from '../services/planService';
import { PlanTier, PricingPlan } from '../types';
import { Check, Zap, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier?: PlanTier;
  onUpgraded?: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  targetTier = 'PRO',
  onUpgraded,
}) => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [selectedTier, setSelectedTier] = useState<PlanTier>(targetTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep targetTier in sync if passed
  React.useEffect(() => {
    if (targetTier) {
      setSelectedTier(targetTier);
    }
  }, [targetTier]);

  const plans = planService.getPlans();
  const currentTier = user?.planTier || 'FREE';
  const selectedPlan = planService.getPlanById(selectedTier);

  const price = billingCycle === 'annual' ? selectedPlan.priceAnnual : selectedPlan.priceMonthly;

  const handleUpgrade = async () => {
    if (selectedTier === currentTier) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await planService.upgradePlan(selectedTier);
      updateUser(updatedUser);
      toast.success(
        'Subscription Activated!',
        `Your workspace has been successfully updated to the ${selectedPlan.name} tier. You can now deploy up to ${selectedPlan.maxSites} projects!`
      );
      if (onUpgraded) {
        onUpgraded();
      }
      onClose();
    } catch (err: any) {
      toast.error('Upgrade Failed', err?.message || 'Could not process plan update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade Workspace Plan" maxWidth="lg">
      <div className="space-y-6 font-sans">
        <p className="text-xs text-ink-muted">
          Select an infrastructure plan tier to immediately expand project allowances, increase S3 storage quotas, and unlock custom domain routing.
        </p>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-3 p-1.5 bg-paper border border-ink">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-ink text-paper font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-3 py-1 text-xs font-mono transition-colors flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-ink text-paper font-bold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] px-1 py-0.2 bg-lime text-ink font-bold">SAVE 20%</span>
          </button>
        </div>

        {/* Plan selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map(plan => {
            const isCurrent = plan.id === currentTier;
            const isSelected = plan.id === selectedTier;
            const planPrice = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedTier(plan.id)}
                className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-vermilion bg-paper-light shadow-editorial-vermilion'
                    : 'border-ink bg-paper hover:bg-stone-faint'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-editorial text-base font-bold text-ink">
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-ink text-paper uppercase">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2 font-mono">
                    <span className="font-editorial text-2xl font-bold text-ink">
                      ${planPrice}
                    </span>
                    <span className="text-xs text-ink-muted">/mo</span>
                  </div>

                  <div className="text-[11px] font-mono text-vermilion font-bold mb-3">
                    Up to {plan.maxSites} projects • {plan.storageMb >= 1000 ? `${plan.storageMb / 1000} GB` : `${plan.storageMb} MB`}
                  </div>

                  <ul className="space-y-1.5 text-xs text-ink-muted">
                    {plan.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <Check className="w-3 h-3 text-vermilion shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-subtle text-center">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isSelected ? 'text-vermilion' : 'text-ink-muted'
                    }`}
                  >
                    {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tier Summary */}
        <div className="p-4 bg-paper border border-ink space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-ink">
              Selected: {selectedPlan.name} Tier
            </span>
            <span className="font-editorial text-lg font-bold text-ink">
              ${price} <span className="text-xs font-mono text-ink-muted font-normal">/ month</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            {selectedPlan.tagline} Your quota will be immediately updated to{' '}
            <strong className="text-ink">{selectedPlan.maxSites} websites</strong> and{' '}
            <strong className="text-ink">
              {selectedPlan.storageMb >= 1000 ? `${selectedPlan.storageMb / 1000} GB` : `${selectedPlan.storageMb} MB`} S3 storage
            </strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-ink">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="vermilion"
            size="md"
            isLoading={isSubmitting}
            onClick={handleUpgrade}
            disabled={selectedTier === currentTier}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            {selectedTier === currentTier ? 'Current Active Plan' : `Confirm Upgrade to ${selectedPlan.name}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
