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
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-block w-10 h-10 bg-vermilion border border-ink shadow-editorial mb-3 text-paper font-bold flex items-center justify-center font-mono text-base">
            CD
          </div>
          <h2 className="font-editorial text-3xl font-bold tracking-tight text-ink">
            Sign In to Console
          </h2>
          <p className="mt-2 text-xs font-mono text-ink-muted">
            Amazon Cognito Multi-Tenant Authentication
          </p>
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
