import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import type { RoleLabel } from '../../types/auth';

const ROLE_HOME: Record<string, string> = {
  admin:      '/admin/dashboard',
  directeur:  '/director/dashboard',
  commercial: '/commercial/dashboard',
  logistique: '/logistics/dashboard',
  financier:  '/finance/dashboard',
  client:     '/client/dashboard',
  it_agent:   '/admin/dashboard',
  it_backup:  '/admin/dashboard',
};

const STAFF_PREFIXES = ['/admin', '/director', '/commercial', '/logistics', '/finance'];

interface ProtectedRouteProps {
  allowedRoles?: RoleLabel[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading } = useAuth();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8]">
        <div className="flex flex-col items-center gap-5">
          <Logo size="lg" />
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-[#0D1F3C] animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-semibold text-[#475569] tracking-wide uppercase">
              {t('access.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not authenticated ─────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    const path = window.location.pathname;
    const isStaffRoute = STAFF_PREFIXES.some(prefix => path.startsWith(prefix));
    return <Navigate to={isStaffRoute ? '/staff/login' : '/login'} replace />;
  }

  // ── Account inactive / blocked ────────────────────────────────────────────
  if (user.statut !== 'ACTIF') {
    const isBlocked = user.statut === 'BLOQUE';
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F4F8] p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8 text-center">
          <div className="w-14 h-14 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7 text-[#92400E]" />
          </div>
          <h2 className="text-xl font-bold text-[#0D1F3C] mb-2">
            {isBlocked ? t('access.blocked_title') : t('access.inactive_title')}
          </h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            {isBlocked ? t('access.blocked_msg') : t('access.inactive_msg')}
          </p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="px-6 py-2.5 bg-[#0D1F3C] text-white rounded-lg text-sm font-semibold hover:bg-[#1A4A8C] transition-colors duration-200"
          >
            {t('access.inactive_back')}
          </button>
        </div>
      </div>
    );
  }

  // ── Wrong role — bounce to own dashboard ──────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role.label as RoleLabel;
    const isKnownRole = userRole in ROLE_HOME;
    const isAdminLike = !isKnownRole && allowedRoles.includes('admin' as RoleLabel);
    
    if (!allowedRoles.includes(userRole) && !isAdminLike) {
      const bouncePath = ROLE_HOME[userRole] ?? '/admin/dashboard';
      return <Navigate to={bouncePath} replace />;
    }
  }

  return <Outlet />;
};
