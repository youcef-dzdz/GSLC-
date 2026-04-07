import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, UserX, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SystemHealth {
  total_users: number;
  active_users: number;
  suspended: number;
  pending_clients: number;
}

interface AuditEntry {
  id: number;
  utilisateur: string;
  action: string;
  table_cible: string;
  resultat: string;
  date_action: string;
}

interface DashboardData {
  users_by_role: Record<string, number>;
  pending_registrations: number;
  recent_audit: AuditEntry[];
  system_health: SystemHealth;
}

interface ClientUser {
  nom: string;
  prenom: string;
  email: string;
}

interface Registration {
  id: number;
  raison_sociale: string;
  created_at: string;
  user: ClientUser;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label, value, icon: Icon, borderColor, iconBg, iconColor,
}) => (
  <div
    className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5"
    style={{ borderLeftColor: borderColor, borderLeftWidth: 4 }}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{label}</p>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
    </div>
    <p className="text-4xl font-black text-[#0D1F3C]">{value}</p>
  </div>
);

// ─── Action Badge ─────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: '#f0fdf4', text: '#166534' },
  UPDATE: { bg: '#eff6ff', text: '#1e40af' },
  DELETE: { bg: '#fef2f2', text: '#991b1b' },
  LOGIN:  { bg: '#f1f5f9', text: '#475569' },
  LOGOUT: { bg: '#f1f5f9', text: '#475569' },
};

const ActionBadge: React.FC<{ action: string }> = ({ action }) => {
  const style = ACTION_STYLES[action] ?? { bg: '#f1f5f9', text: '#475569' };
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {action}
    </span>
  );
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC<{ size?: number }> = ({ size = 5 }) => (
  <svg
    className={`w-${size} h-${size} animate-spin text-[#0D1F3C]`}
    fill="none" viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [motif, setMotif] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
    refetch: refetchDash,
  } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminService.getDashboard();
      return res.data;
    },
  });

  const {
    data: regsData,
    isLoading: regsLoading,
    refetch: refetchRegs,
  } = useQuery<{ data: Registration[] }>({
    queryKey: ['admin-registrations'],
    queryFn: async () => {
      const res = await adminService.getRegistrations('EN_ATTENTE_VALIDATION');
      return res.data;
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminService.approveRegistration(id),
    onSuccess: () => {
      toast('success', t('common.success'), `${t('admin.dashboard.approve')} ✓`);
      refetchDash();
      refetchRegs();
    },
    onError: () => toast('error', t('common.error')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) =>
      adminService.rejectRegistration(id, motif),
    onSuccess: () => {
      toast('success', t('common.success'), `${t('admin.dashboard.reject')} ✓`);
      setRejectingId(null);
      setMotif('');
      refetchDash();
      refetchRegs();
    },
    onError: () => toast('error', t('common.error')),
  });

  // ── Chart data ────────────────────────────────────────────────────────────

  const chartData = dashData
    ? Object.entries(dashData.users_by_role).map(([role, count]) => ({ role, count }))
    : [];

  // ── Loading state ─────────────────────────────────────────────────────────

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <Spinner />
        <span className="text-sm font-semibold text-[#475569]">{t('common.loading')}</span>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (dashError || !dashData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-[#6B7280]">{t('common.error')}</p>
        <button
          onClick={() => refetchDash()}
          className="px-4 py-2 bg-[#0D1F3C] text-white rounded-lg text-sm font-semibold hover:bg-[#1A4A8C] transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const { system_health, recent_audit } = dashData;
  const registrations: Registration[] = regsData?.data ?? [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">{t('admin.dashboard.title')}</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Vue d'ensemble du système GSLC</p>
        </div>
        <img src="/images/nashco_logo Company.jpg" alt="NASHCO" className="h-12 w-auto rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin.dashboard.total_users')}
          value={system_health.total_users}
          icon={Users}
          borderColor="#0D1F3C"
          iconBg="#EBF4FF"
          iconColor="#1A4A8C"
        />
        <KpiCard
          label={t('admin.dashboard.active_users')}
          value={system_health.active_users}
          icon={UserCheck}
          borderColor="#10B981"
          iconBg="#f0fdf4"
          iconColor="#10B981"
        />
        <KpiCard
          label={t('admin.dashboard.suspended')}
          value={system_health.suspended}
          icon={UserX}
          borderColor="#EF4444"
          iconBg="#fef2f2"
          iconColor="#EF4444"
        />
        <KpiCard
          label={t('admin.dashboard.pending')}
          value={system_health.pending_clients}
          icon={Clock}
          borderColor="#F59E0B"
          iconBg="#fffbeb"
          iconColor="#F59E0B"
        />
      </div>

      {/* Users by role — bar chart */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#0D1F3C] mb-5 flex items-center gap-2">
          <Users size={15} className="text-[#CFA030]" />
          {t('admin.dashboard.users_by_role')}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="role"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 13,
                boxShadow: '0 4px 16px rgba(0,0,0,.08)',
              }}
              cursor={{ fill: '#F0F4F8' }}
            />
            <Bar dataKey="count" fill="#0D1F3C" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pending registrations */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-semibold text-[#0D1F3C] flex items-center gap-2">
            <Clock size={15} className="text-[#CFA030]" />
            {t('admin.dashboard.pending_registrations')}
          </h3>
          {registrations.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {registrations.length}
            </span>
          )}
        </div>

        {regsLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size={5} />
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2 text-[#94A3B8]">
            <CheckCircle size={36} />
            <p className="text-sm font-medium">{t('admin.dashboard.no_pending')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="border border-[#E2E8F0] rounded-xl p-4 hover:bg-[#F8FAFC] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Client info */}
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#0D1F3C]">
                      {reg.user?.prenom} {reg.user?.nom}
                    </p>
                    <p className="text-xs text-[#6B7280]">{reg.user?.email}</p>
                    <p className="text-xs font-medium text-[#1A4A8C]">{reg.raison_sociale}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {reg.created_at
                        ? format(new Date(reg.created_at), 'dd/MM/yyyy HH:mm')
                        : '—'}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveMutation.mutate(reg.id)}
                      disabled={approveMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {t('admin.dashboard.approve')}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(rejectingId === reg.id ? null : reg.id);
                        setMotif('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                    >
                      {t('admin.dashboard.reject')}
                    </button>
                  </div>
                </div>

                {/* Inline reject form */}
                {rejectingId === reg.id && (
                  <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex gap-2 items-center">
                    <input
                      type="text"
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder={t('admin.dashboard.rejection_reason')}
                      className="flex-1 border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                    />
                    <button
                      onClick={() => {
                        if (motif.trim()) {
                          rejectMutation.mutate({ id: reg.id, motif: motif.trim() });
                        }
                      }}
                      disabled={!motif.trim() || rejectMutation.isPending}
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 flex-shrink-0"
                    >
                      {t('common.confirm')}
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setMotif(''); }}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors flex-shrink-0"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent audit log */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
          <Clock size={15} className="text-[#CFA030]" />
          {t('admin.dashboard.recent_activity')}
        </h3>

        {recent_audit.length === 0 ? (
          <p className="text-sm text-[#94A3B8] text-center py-6">{t('common.empty_state')}</p>
        ) : (
          <div className="space-y-1">
            {recent_audit.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Result dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: entry.resultat === 'SUCCES' ? '#10B981' : '#EF4444',
                  }}
                />
                {/* User */}
                <p className="text-sm font-semibold text-[#0D1F3C] w-36 truncate flex-shrink-0">
                  {entry.utilisateur}
                </p>
                {/* Action badge */}
                <ActionBadge action={entry.action} />
                {/* Table */}
                <p className="text-xs text-[#6B7280] font-mono flex-1 truncate">
                  {entry.table_cible}
                </p>
                {/* Date */}
                <p className="text-xs text-[#94A3B8] flex-shrink-0">
                  {entry.date_action
                    ? format(new Date(entry.date_action), 'dd/MM/yyyy HH:mm')
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
