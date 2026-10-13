import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Deployment } from '../types';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { deploymentService } from '../services/deploymentService';
import { useToast } from '../components/Toast';

interface RollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  targetDeployment: Deployment | null;
  onRollbackComplete: (newDeployment: Deployment) => void;
}

export const RollbackModal: React.FC<RollbackModalProps> = ({
  isOpen,
  onClose,
  siteId,
  targetDeployment,
  onRollbackComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  if (!targetDeployment) return null;

  const handleRollback = async () => {
    setIsLoading(true);
    try {
      const result = await deploymentService.rollback(siteId, targetDeployment.id);
      toast.success('Rollback Executed', `Version ${targetDeployment.version} is now active.`);
      onRollbackComplete(result);
      onClose();
    } catch (err: any) {
      toast.error('Rollback Failed', err?.message || 'Failed to switch active deployment version.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Version Rollback" maxWidth="md">
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-600 flex items-start gap-2.5 text-xs text-amber-900 font-sans">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
          <p>
            Rolling back switches the current CloudFront distribution pointer to historical release{' '}
            <strong className="font-mono">v{targetDeployment.version}</strong>. Existing S3 assets are retained, and an edge invalidation request is submitted.
          </p>
        </div>

        <div className="bg-paper p-3 border border-ink text-xs font-mono space-y-1.5">
          <div className="flex justify-between">
            <span className="text-ink-faint">Target Version:</span>
            <span className="font-bold text-ink">v{targetDeployment.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Target Deployment ID:</span>
            <span className="text-ink">{targetDeployment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Files:</span>
            <span className="text-ink">{targetDeployment.fileCount} static assets</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Published At:</span>
            <span className="text-ink">{new Date(targetDeployment.startedAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-ink flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="vermilion"
            size="sm"
            onClick={handleRollback}
            isLoading={isLoading}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Confirm & Roll Back
          </Button>
        </div>
      </div>
    </Modal>
  );
};
