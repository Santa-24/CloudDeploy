import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('architect@clouddeploy.internal');
  const [password, setPassword] = useState('SuperSecretAWS#2026');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Authenticated', `Welcome back, ${email}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Authentication Failed', err?.message || 'Invalid credentials or Cognito error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full">
        {/* Card Header with Brand Logo */}
        <div className="text-center mb-8 space-y-3">
          <Link to="/" className="inline-block group focus:outline-none" title="Return to CloudDeploy Home">
            <div className="relative mx-auto w-20 h-20 bg-paper-light border-2 border-ink shadow-[4px_4px_0px_0px_#C65336] p-1.5 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
              <img
                src="/logo.png"
                alt="CloudDeploy Logo"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-ink text-lime border border-ink flex items-center justify-center font-mono text-[9px] font-bold shadow-[1px_1px_0px_0px_#1D1C19]">
                AWS
              </div>
            </div>
          </Link>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-editorial text-2xl font-bold tracking-tight text-ink">
                CloudDeploy
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-ink text-lime border border-ink font-bold">
                CONSOLE
              </span>
            </div>
            <p className="text-[11px] font-mono text-ink-faint uppercase tracking-wider mt-0.5">
              AWS Static Website Platform
            </p>
          </div>

          <div className="pt-1">
            <h2 className="font-editorial text-3xl font-bold tracking-tight text-ink">
              Sign In to Console
            </h2>
            <p className="mt-1 text-xs font-mono text-ink-muted">
              Amazon Cognito Multi-Tenant Authentication
            </p>
          </div>
        </div>

        <div className="card-editorial p-8 bg-paper-light">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="developer@studio.internal"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-mono text-vermilion hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-vermilion font-semibold hover:underline">
              Register new workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
