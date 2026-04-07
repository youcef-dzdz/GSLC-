import './bootstrap';
import '../css/app.css';
import './i18n';

import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

import LandingPage from './LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';

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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/audit" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Journal d'audit</h1><p className="text-[#6B7280] mt-2">Cette page sera disponible prochainement.</p></div>} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/registrations" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Demandes d'inscription</h1><p className="text-[#6B7280] mt-2">Cette page sera disponible prochainement.</p></div>} />
                  <Route path="/admin/config" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Configuration système</h1><p className="text-[#6B7280] mt-2">Cette page sera disponible prochainement.</p></div>} />
                  <Route path="/admin/departments" element={<div className="p-6"><h1 className="text-2xl font-bold text-[#0D1F3C]">Services &amp; Départements</h1><p className="text-[#6B7280] mt-2">Cette page sera disponible prochainement.</p></div>} />
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

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
