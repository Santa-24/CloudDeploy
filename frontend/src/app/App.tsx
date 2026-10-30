import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ToastProvider } from '../components/Toast';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { FeaturesPage } from '../pages/FeaturesPage';
import { TemplatesPage } from '../pages/TemplatesPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DocsPage } from '../pages/DocsPage';
import { PricingPage } from '../pages/PricingPage';

// Authenticated Pages
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsListPage } from '../pages/ProjectsListPage';
import { CreateProjectPage } from '../pages/CreateProjectPage';
import { ProjectDetailsPage } from '../pages/ProjectDetailsPage';
import { UploadDeployPage } from '../pages/UploadDeployPage';
import { DeploymentHistoryPage } from '../pages/DeploymentHistoryPage';
import { DeploymentDetailsPage } from '../pages/DeploymentDetailsPage';
import { UsageQuotasPage } from '../pages/UsageQuotasPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';
import { AccountSettingsPage } from '../pages/AccountSettingsPage';

// Admin Pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminDeploymentsPage } from '../pages/admin/AdminDeploymentsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isLoading, user, demoMode } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-ink animate-pulse">
        Initializing CloudDeploy Security Context...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN' && !demoMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Showcase & Auth */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/docs" element={<DocsPage />} />
            </Route>

            {/* Authenticated Tenant Console */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:siteId" element={<ProjectDetailsPage />} />
              <Route path="/projects/:siteId/deploy" element={<UploadDeployPage />} />
              <Route path="/projects/:siteId/history" element={<DeploymentHistoryPage />} />
              <Route path="/deployments/:deploymentId" element={<DeploymentDetailsPage />} />
              <Route path="/usage" element={<UsageQuotasPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="/account" element={<AccountSettingsPage />} />

              {/* Administrative Sub-Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOverviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/deployments"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDeploymentsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
