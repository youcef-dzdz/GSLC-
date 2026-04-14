import './app.css';
import './i18n';

import React, { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

import LandingPage from './LandingPage';
import ClientLogin from './pages/auth/ClientLogin';
import StaffLogin from './pages/auth/StaffLogin';
import ForcePasswordChange from './pages/staff/ForcePasswordChange';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminPositions from './pages/admin/AdminPositions';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AuditPage from './pages/admin/AuditPage';
import ConfigPage from './pages/admin/ConfigPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import AdminRoles       from './pages/admin/AdminRoles';
import AdminPermissions from './pages/admin/AdminPermissions';

import CommercialDashboard from './pages/commercial/CommercialDashboard';
import CommercialDemands from './pages/commercial/CommercialDemands';
import CommercialClients from './pages/commercial/CommercialClients';

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
          <h2 style={{ color: '#ff6b6b' }}>React Crash — Runtime Error</h2>
          <pre style={{ background: '#0d0d1a', padding: 20, borderRadius: 8, overflow: 'auto', color: '#ffd700' }}>
            {this.state.error.message}
          </pre>
          <pre style={{ background: '#0d0d1a', padding: 20, borderRadius: 8, overflow: 'auto', color: '#aaa', fontSize: 12 }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<ClientLogin />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/staff/change-password" element={<ForcePasswordChange />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/staff/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Routes admin — accès contrôlé par permissions granulaires */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'it_agent']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin/dashboard"      element={<AdminDashboard />} />
                  <Route path="/admin/users"          element={<AdminUsers />} />
                  <Route path="/admin/audit"          element={<AuditPage />} />
                  <Route path="/admin/registrations"  element={<AdminRegistrations />} />
                  <Route path="/admin/config"         element={<ConfigPage />} />
                  <Route path="/admin/departments"    element={<DepartmentsPage />} />
                  <Route path="/admin/positions"      element={<AdminPositions />} />
                  <Route path="/admin/notifications"  element={<NotificationsPage />} />
                  <Route path="/admin/roles"          element={<AdminRoles />} />
                  <Route path="/admin/permissions"    element={<AdminPermissions />} />
                </Route>
              </Route>

              {/* Commercial routes */}
              <Route element={<ProtectedRoute allowedRoles={['commercial']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/commercial/dashboard" element={<CommercialDashboard />} />
                  <Route path="/commercial/demands"   element={<CommercialDemands />} />
                  <Route path="/commercial/clients"   element={<CommercialClients />} />
                  <Route path="/commercial/quotes"    element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Devis</h1><p className="text-[#6B7280] mt-2">Prochainement disponible.</p></div>} />
                  <Route path="/commercial/contracts" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Contrats</h1><p className="text-[#6B7280] mt-2">Prochainement disponible.</p></div>} />
                  <Route path="/commercial/vessels"   element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Navires</h1><p className="text-[#6B7280] mt-2">Prochainement disponible.</p></div>} />
                </Route>
              </Route>

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="p-20 text-center text-gray-500">
                    404 - Page Non Trouvée
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Catch any uncaught errors and display them
window.addEventListener('error', (event) => {
  const appEl = document.getElementById('app');
  if (appEl && !appEl.innerHTML) {
    appEl.innerHTML = `<div style="padding:40px;font-family:monospace;color:#fff;background:#1a1a2e;min-height:100vh">
      <h2 style="color:#ff6b6b">JS Error (module load)</h2>
      <pre style="background:#0d0d1a;padding:20px;border-radius:8px;color:#ffd700;overflow:auto">${event.message}</pre>
      <pre style="background:#0d0d1a;padding:20px;border-radius:8px;color:#aaa;font-size:12px;overflow:auto">${event.filename}:${event.lineno}</pre>
    </div>`;
  }
});

const rootElement = document.getElementById('app');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err: any) {
    rootElement.innerHTML = `<div style="padding:40px;font-family:monospace;color:#fff;background:#1a1a2e;min-height:100vh">
      <h2 style="color:#ff6b6b">React Mount Error</h2>
      <pre style="background:#0d0d1a;padding:20px;border-radius:8px;color:#ffd700;overflow:auto">${err?.message}</pre>
      <pre style="background:#0d0d1a;padding:20px;border-radius:8px;color:#aaa;font-size:12px;overflow:auto">${err?.stack}</pre>
    </div>`;
  }
}
