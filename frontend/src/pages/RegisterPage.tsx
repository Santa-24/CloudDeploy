import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Validation Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, password, role });
      toast.success('Workspace Created', `Registered ${email} successfully`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Registration Failed', err?.message || 'Could not register user account');
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
                SIGN UP
              </span>
            </div>
            <p className="text-[11px] font-mono text-ink-faint uppercase tracking-wider mt-0.5">
              AWS Static Website Platform
            </p>
          </div>

          <div className="pt-1">
            <h2 className="font-editorial text-3xl font-bold tracking-tight text-ink">
              Create User Workspace
            </h2>
            <p className="mt-1 text-xs font-mono text-ink-muted">
              Multi-Tenant Isolation • Free Plan (Up to 3 Sites)
            </p>
          </div>
        </div>

        <div className="card-editorial p-8 bg-paper-light">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="lead.engineer@company.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              helperText="Min. 8 characters, alphanumeric + symbol"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5 font-medium">
                Initial Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-2.5 text-xs font-mono border text-center transition-all ${
                    role === 'USER'
                      ? 'border-ink bg-ink text-paper font-bold shadow-[2px_2px_0px_0px_#C65336]'
                      : 'border-stone-subtle bg-paper text-ink hover:border-ink'
                  }`}
                >
                  STANDARD USER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2.5 text-xs font-mono border text-center transition-all ${
                    role === 'ADMIN'
                      ? 'border-ink bg-lime text-ink font-bold shadow-[2px_2px_0px_0px_#1D1C19]'
                      : 'border-stone-subtle bg-paper text-ink hover:border-ink'
                  }`}
                >
                  SYSTEM ADMIN
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="vermilion"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Initialize Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-muted">
            Already registered?{' '}
            <Link to="/login" className="text-vermilion font-semibold hover:underline">
              Sign in to console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
