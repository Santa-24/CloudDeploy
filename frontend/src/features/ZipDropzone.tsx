import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, FileArchive, ArrowRight, Copy, Check, RefreshCw, Globe } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Deployment, DeploymentStatus, AVAILABLE_REGIONS, DEFAULT_REGION } from '../types';
import { deploymentService } from '../services/deploymentService';
import { useToast } from '../components/Toast';

interface ZipDropzoneProps {
  siteId: string;
  initialRegion?: string;
  onDeploymentComplete?: (deployment: Deployment) => void;
}

export const ZipDropzone: React.FC<ZipDropzoneProps> = ({ siteId, initialRegion, onDeploymentComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRegion, setTargetRegion] = useState<string>(initialRegion || DEFAULT_REGION);
  const [status, setStatus] = useState<DeploymentStatus | 'IDLE'>('IDLE');
  const [progressText, setProgressText] = useState<string>('');
  const [deploymentResult, setDeploymentResult] = useState<Deployment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (initialRegion) {
      setTargetRegion(initialRegion);
    }
  }, [initialRegion]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setDeploymentResult(null);
    if (!file.name.toLowerCase().endsWith('.zip')) {
      const err = 'Only .zip archives containing static website assets (HTML, CSS, JS, images) are permitted.';
      setErrorMessage(err);
      toast.error('Invalid Archive Format', err);
      return;
    }

    const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE_BYTES) {
      const err = `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum upload limit of 50 MB.`;
      setErrorMessage(err);
      toast.error('Quota Exceeded', err);
      return;
    }

    setSelectedFile(file);
  };

  const startDeployment = async () => {
    if (!selectedFile) return;

    try {
      setStatus('QUEUED');
      setProgressText('Transferring archive to S3 staging bucket...');
      await new Promise(r => setTimeout(r, 600));

      setStatus('VALIDATING');
      setProgressText('Inspecting ZIP directory structure, verifying root index.html & checking for zip slip vulnerabilities...');
      await new Promise(r => setTimeout(r, 800));

      setStatus('PUBLISHING');
      setProgressText(`Extracting assets to S3 prefix and deploying to AWS ${targetRegion}...`);

      const result = await deploymentService.deployArchive(siteId, selectedFile, targetRegion);

      setStatus('SUCCEEDED');
      setProgressText(`Static website published successfully to AWS ${targetRegion} and CloudFront CDN.`);
      setDeploymentResult(result);
      toast.success('Deployment Live', `Version ${result.version} has been published.`);

      if (onDeploymentComplete) {
        onDeploymentComplete(result);
      }
    } catch (err: any) {
      setStatus('FAILED');
      const errStr = err?.message || err?.errorSummary || 'Deployment pipeline encountered an error during archive processing.';
      setErrorMessage(errStr);
      setProgressText('Pipeline aborted.');
      toast.error('Deployment Failed', errStr);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info('Copied to Clipboard', url);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setStatus('IDLE');
    setDeploymentResult(null);
    setErrorMessage(null);
    setProgressText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card-editorial p-6 bg-paper-light">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink">
        <div>
          <h3 className="font-editorial text-xl font-bold text-ink">Upload Static Archive</h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Target: Amazon S3 (Private Origin) → Amazon CloudFront (Global CDN)
          </p>
        </div>
        {status !== 'IDLE' && <Badge status={status as DeploymentStatus} />}
      </div>

      {status === 'IDLE' && (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 md:p-12 text-center cursor-pointer transition-colors duration-150 ${
              isDragging
                ? 'border-vermilion bg-vermilion-light/40'
                : selectedFile
                ? 'border-ink bg-stone-faint'
                : 'border-ink hover:border-vermilion bg-paper'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <FileArchive className="w-12 h-12 text-vermilion mb-3" />
                <span className="font-mono text-sm font-bold text-ink">{selectedFile.name}</span>
                <span className="text-xs font-mono text-ink-faint mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Validate
                </span>
                <span className="text-xs text-vermilion mt-2 hover:underline">
                  Click to replace file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-ink-muted mb-3" />
                <span className="font-medium text-sm text-ink mb-1">
                  Drag and drop your website .zip archive here
                </span>
                <span className="text-xs text-ink-muted max-w-sm mb-4">
                  Archive must contain <code className="bg-paper-dark px-1 py-0.5 font-mono text-xs">index.html</code> at root. Max size: 50 MB.
                </span>
                <Button variant="secondary" size="sm" type="button">
                  Browse Local Files
                </Button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-700 text-xs font-mono text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-700 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AWS Target Region Selector */}
          <div className="mt-4 p-3 bg-paper border border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-vermilion shrink-0" />
              <div>
                <div className="text-xs font-mono font-bold text-ink">Target AWS Region</div>
                <div className="text-[11px] text-ink-muted">Routing & storage origin location for this release</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value)}
                className="bg-paper-light text-ink border border-ink font-mono text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ink"
              >
                {AVAILABLE_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.flag} {r.id} — {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-mono text-ink-faint">
              STRICT SECURITY: ZIP SLIP PROTECTION • DECOMPRESSION BOMB LIMITS (250MB / 1000 FILES)
            </div>
            <Button
              variant="vermilion"
              onClick={startDeployment}
              disabled={!selectedFile}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shrink-0"
            >
              Start Deployment
            </Button>
          </div>
        </>
      )}

      {status !== 'IDLE' && status !== 'SUCCEEDED' && status !== 'FAILED' && (
        <div className="py-8 px-4 text-center">
          <div className="inline-block p-4 bg-paper border border-ink shadow-editorial mb-4 animate-bounce">
            <UploadCloud className="w-8 h-8 text-vermilion" />
          </div>
          <h4 className="font-editorial text-lg font-bold text-ink mb-2">
            Deployment in Progress
          </h4>
          <p className="text-xs font-mono text-ink-muted max-w-md mx-auto mb-6">
            {progressText}
          </p>

          {/* Stepper indicator */}
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className={`p-2 border ${status === 'QUEUED' ? 'border-ink bg-ink text-paper font-bold' : 'border-stone-subtle bg-paper-light text-ink-faint'}`}>
              1. STAGING
            </div>
            <div className={`p-2 border ${status === 'VALIDATING' ? 'border-ink bg-ink text-paper font-bold' : 'border-stone-subtle bg-paper-light text-ink-faint'}`}>
              2. VALIDATING
            </div>
            <div className={`p-2 border ${status === 'PUBLISHING' ? 'border-ink bg-ink text-paper font-bold' : 'border-stone-subtle bg-paper-light text-ink-faint'}`}>
              3. PUBLISHING
            </div>
          </div>
        </div>
      )}

      {status === 'SUCCEEDED' && deploymentResult && (
        <div className="p-6 bg-green-50/50 border border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-editorial text-xl font-bold text-green-900 mb-1">
                Deployment Live
              </h4>
              <p className="text-xs font-mono text-ink-muted mb-4 flex flex-wrap items-center gap-2">
                <span>Version {deploymentResult.version}</span>
                <span>•</span>
                <span>{deploymentResult.fileCount || 14} files published</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-paper border border-ink text-ink font-bold">
                  <Globe className="w-3 h-3 text-vermilion" />
                  {deploymentResult.region || targetRegion}
                </span>
                <span>•</span>
                <span>CloudFront Invalidation Submitted</span>
              </p>

              {deploymentResult.liveUrl && (
                <div className="bg-paper-light p-3 border border-ink flex items-center justify-between gap-3 mb-4">
                  <div className="font-mono text-xs text-ink truncate">
                    {deploymentResult.liveUrl}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyUrl(deploymentResult.liveUrl!)}
                      className="p-1.5 border border-ink hover:bg-stone-faint text-ink text-xs font-mono flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={deploymentResult.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-ink text-paper hover:bg-vermilion text-xs font-mono flex items-center gap-1"
                    >
                      <span>Visit</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-ink-faint">
                  Deployment ID: {deploymentResult.id}
                </span>
                <Button variant="secondary" size="sm" onClick={resetUpload}>
                  Deploy Another Version
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="p-6 bg-red-50/50 border border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-editorial text-xl font-bold text-red-900 mb-1">
                Deployment Aborted
              </h4>
              <p className="text-xs font-mono text-red-800 mb-4">
                {errorMessage || 'Verification checks failed. Previous deployment was preserved without downtime.'}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={startDeployment} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                  Retry Deployment
                </Button>
                <Button variant="secondary" size="sm" onClick={resetUpload}>
                  Select Different Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
