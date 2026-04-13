import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Users, Clock, Building2, TrendingUp,
  LogIn, Plus, Edit2, Trash2, Shield, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Inbox,
  Database, Mail, Wrench, Server, Pencil,
} from 'lucide-react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SystemHealth {
  total_users:    number;
  active_users:   number;
  suspended:      number;
  pending_clients: number;
}

interface AuditEntry {
  id:           number;
  action:       string;
  table_cible:  string;
  utilisateur:  string;
  adresse_ip:   string;
  resultat:     string;
  date_action:  string;
}

interface DashboardData {
  users_by_role:        Record<string, number>;
  pending_registrations: number;
  recent_audit:         AuditEntry[];
  system_health:        SystemHealth;
}

interface Registration {
  id:            number;
  raison_sociale: string;
  ville?:        string;
  statut?:       string;
  created_at:    string;
  user?: { nom: string; prenom: string; email: string };
}

interface Devise {
  code:              string;
  nom:               string;
  symbole:           string;
  taux_actuel:       number;
  taux_base:         number;
  date_derniere_maj: string | null;
  source:            string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admin:      '#0B1D3A',
  directeur:  '#CFA030',
  commercial: '#3B82F6',
  logistique: '#10B981',
  financier:  '#F59E0B',
  client:     '#94A3B8',
  agent:      '#8B5CF6',
};

const FLAG: Record<string, string> = {
  EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', CNY: '🇨🇳',
};

const MONTHLY_DATA = [
  { mois: 'Nov', approuvees: 45, rejetees: 12 },
  { mois: 'Déc', approuvees: 52, rejetees: 8  },
  { mois: 'Jan', approuvees: 38, rejetees: 15 },
  { mois: 'Fév', approuvees: 61, rejetees: 6  },
  { mois: 'Mar', approuvees: 55, rejetees: 10 },
  { mois: 'Avr', approuvees: 70, rejetees: 4  },
];

const AUDIT_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  LOGIN:  { icon: LogIn,   color: '#3B82F6', bg: '#EFF6FF' },
  LOGOUT: { icon: LogIn,   color: '#64748B', bg: '#F1F5F9' },
  CREATE: { icon: Plus,    color: '#10B981', bg: '#F0FDF4' },
  UPDATE: { icon: Edit2,   color: '#F59E0B', bg: '#FFFBEB' },
  DELETE: { icon: Trash2,  color: '#EF4444', bg: '#FEF2F2' },
  BLOCK:  { icon: Shield,  color: '#8B5CF6', bg: '#F5F3FF' },
};

const REG_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  en_attente:              { bg: '#FEF3C7', text: '#92400E', label: 'En attente'  },
  approuve:                { bg: '#D1FAE5', text: '#065F46', label: 'Approuvé'    },
  rejete:                  { bg: '#FEE2E2', text: '#991B1B', label: 'Rejeté'      },
  EN_ATTENTE_VALIDATION:   { bg: '#FEF3C7', text: '#92400E', label: 'En attente'  },
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'À l\'instant';
  if (mins  < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}

function avatarBg(name: string): string {
  const p = ['#0B1D3A','#CFA030','#3B82F6','#10B981','#8B5CF6','#EF4444','#F59E0B'];
  let h = 0;
  for (const c of name) h = ((h * 31) + c.charCodeAt(0)) >>> 0;
  return p[h % p.length];
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

function currVariation(actuel: number, base: number): { pct: string; up: boolean } {
  if (!base) return { pct: '0.00', up: true };
  const pct = (actuel - base) / base * 100;
  return { pct: Math.abs(pct).toFixed(2), up: pct >= 0 };
}

// ── useCountUp ────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let cur = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(id); }
      else               { setCount(Math.floor(cur)); }
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return count;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = ({ size = 6 }: { size?: number }) => (
  <svg className={`w-${size} h-${size} animate-spin text-[#0B1D3A]`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skel = ({ h = 'h-28', className = '' }: { h?: string; className?: string }) => (
  <div className={`bg-[#E2E8F0] rounded-2xl ${h} animate-pulse ${className}`} />
);

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiProps {
  label:   string;
  target:  number;
  suffix?: string;
  icon:    React.ElementType;
  accent:  string;
  delay?:  number;
}

const KpiCard: React.FC<KpiProps> = ({ label, target, suffix, icon: Icon, accent, delay = 0 }) => {
  const count = useCountUp(target);
  return (
    <div
      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 p-5 cursor-default"
      style={{ borderTop: `3px solid ${accent}`, animation: 'fadeSlideUp 450ms ease both', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{label}</p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-[28px] font-black text-[#1A2332] tabular-nums leading-none">
        {count.toLocaleString('fr-FR')}
        {suffix && <span className="text-sm font-semibold text-[#64748B] ml-1">{suffix}</span>}
      </p>
    </div>
  );
};

// ── Custom Tooltip (LineChart) ────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 text-xs">
      <p className="font-bold text-[#1A2332] mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          <span className="text-[#64748B]">{p.name} :</span>
          <strong style={{ color: p.color }}>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── SectionCard ───────────────────────────────────────────────────────────────

const SectionCard = ({
  children, className = '', delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) => (
  <div
    className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden ${className}`}
    style={{ animation: 'fadeSlideUp 450ms ease both', animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

const CardHeader = ({
  icon, title, badge, action,
}: { icon: React.ReactNode; title: string; badge?: React.ReactNode; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
    <div className="flex items-center gap-2.5">
      {icon}
      <h3 className="text-sm font-black text-[#0B1D3A]">{title}</h3>
      {badge}
    </div>
    {action}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: dash, isLoading: dashLoading, isError: dashError, refetch: refetchDash,
  } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn:  () => adminService.getDashboard().then(r => r.data),
  });

  const {
    data: deptsRaw,
  } = useQuery({
    queryKey: ['admin-departments'],
    queryFn:  () => adminService.getDepartments().then(r => r.data),
  });

  const {
    data: currRaw, refetch: refetchCurr,
  } = useQuery<{ devises: Devise[] }>({
    queryKey: ['admin-currencies'],
    queryFn:  () => adminService.getCurrencies().then(r => r.data),
  });

  const {
    data: regsRaw, isLoading: regsLoading,
  } = useQuery<{ data: Registration[] }>({
    queryKey: ['admin-registrations'],
    queryFn:  () => adminService.getRegistrations('EN_ATTENTE_VALIDATION').then(r => r.data),
  });

  const {
    data: sysConfig,
  } = useQuery<Record<string, string>>({
    queryKey: ['system-config'],
    queryFn:  () => adminService.getSystemConfig().then((r: { data: Record<string, string> }) => r.data),
  });

  // ── Sync mutation ──────────────────────────────────────────────────────────

  const syncMut = useMutation({
    mutationFn: () => adminService.syncCurrencies(),
    onSuccess:  (res) => {
      toast('success', 'Synchronisation', res.data?.message ?? 'Taux synchronisés.');
      refetchCurr();
    },
    onError: () => toast('error', 'Erreur', 'Impossible de contacter l\'API de taux.'),
  });

  // ── Manual rate edit ───────────────────────────────────────────────────────

  const [editingCode,  setEditingCode]  = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const updateRateMut = useMutation({
    mutationFn: ({ code, taux }: { code: string; taux: number }) =>
      adminService.updateCurrencyRate(code, taux),
    onSuccess: (_, { code, taux }) => {
      toast('success', 'Taux mis à jour', `${code}/DZD → ${taux.toFixed(4)}`);
      setEditingCode(null);
      refetchCurr();
    },
    onError: () => {
      toast('error', 'Erreur', 'Impossible de sauvegarder le taux.');
    },
  });

  const confirmEdit = (code: string) => {
    const val = parseFloat(editingValue);
    if (isNaN(val) || val <= 0) {
      toast('error', 'Valeur invalide', 'Le taux doit être un nombre positif.');
      return;
    }
    updateRateMut.mutate({ code, taux: val });
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const deptCount: number = Array.isArray((deptsRaw as any)?.departments)
    ? (deptsRaw as any).departments.length
    : Array.isArray(deptsRaw)
    ? (deptsRaw as unknown[]).length
    : Array.isArray((deptsRaw as any)?.data)
    ? (deptsRaw as any).data.length
    : 0;

  const devises = (currRaw?.devises ?? []).filter(d => d.code !== 'DZD');
  const usdRate  = devises.find(d => d.code === 'USD')?.taux_actuel ?? 0;
  const lastSync = devises[0]?.date_derniere_maj ?? null;

  const registrations: Registration[] = regsRaw?.data?.slice(0, 5) ?? [];

  const roleData = dash?.users_by_role ?? {};
  const roleTotal = Object.values(roleData).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(roleData).map(([name, value]) => ({
    name,
    value,
    pct: roleTotal > 0 ? ((value / roleTotal) * 100).toFixed(0) : '0',
  }));

  const rolesCount = Object.keys(roleData).length;
  const smtpConfigured = !!(sysConfig?.smtp_host);
  const maintenanceOn  = sysConfig?.maintenance_mode === '1';

  // ── Loading ────────────────────────────────────────────────────────────────

  if (dashLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skel h="h-28" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skel key={i} h="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Skel h="h-64" className="lg:col-span-3" />
          <Skel h="h-64" className="lg:col-span-2" />
        </div>
        <Skel h="h-40" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (dashError || !dash) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm text-[#64748B]">{t('common.error')}</p>
        <button
          onClick={() => refetchDash()}
          className="px-4 py-2 bg-[#0B1D3A] text-white rounded-xl text-sm font-bold hover:bg-[#1A3A6B] transition-colors cursor-pointer"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const { system_health, recent_audit } = dash;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5">

      {/* CSS Keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes pulseOrg {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* ── SECTION 1 — Header ── */}
      <div
        className="rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #0B1D3A 0%, #1A3A6B 100%)',
          animation: 'fadeSlideUp 400ms ease both',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl font-black text-white">{t('admin.dashboard.title')}</h1>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: '#CFA030', color: '#0B1D3A' }}
            >
              Admin
            </span>
          </div>
          <p className="text-sm text-blue-200 font-mono">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' — '}
            {now.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 self-start sm:self-auto">
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0"
            style={{ animation: 'pulseDot 2s ease-in-out infinite' }}
          />
          <span className="text-sm font-semibold text-emerald-300">{t('admin.dashboard.system_online')}</span>
        </div>
      </div>

      {/* ── SECTION 2 — KPIs ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label={t('admin.dashboard.total_users')}
          target={system_health.total_users}
          icon={Users}
          accent="#CFA030"
          delay={0}
        />
        <KpiCard
          label={t('admin.dashboard.pending')}
          target={dash.pending_registrations}
          icon={Clock}
          accent="#F59E0B"
          delay={80}
        />
        <KpiCard
          label={t('admin.dashboard.active_departments')}
          target={deptCount}
          icon={Building2}
          accent="#10B981"
          delay={160}
        />
        <KpiCard
          label={t('admin.dashboard.usd_rate')}
          target={Math.round(usdRate)}
          suffix="DZD"
          icon={TrendingUp}
          accent="#3B82F6"
          delay={240}
        />
      </div>

      {/* ── SECTION 3 — Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LineChart — Inscriptions par mois */}
        <SectionCard className="lg:col-span-3" delay={100}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#EFF6FF] rounded-lg"><TrendingUp size={16} className="text-[#3B82F6]" /></span>}
            title={t('admin.dashboard.registrations_per_month')}
          />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY_DATA} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="approuvees" name={t('admin.dashboard.approved')}
                  stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone" dataKey="rejetees" name={t('admin.dashboard.rejected')}
                  stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* PieChart — Répartition des rôles */}
        <SectionCard className="lg:col-span-2" delay={150}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#FFF8E7] rounded-lg"><Users size={16} className="text-[#CFA030]" /></span>}
            title={t('admin.dashboard.role_distribution')}
          />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={ROLE_COLORS[entry.name] ?? '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v} utilisateur(s)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom legend */}
            <div className="mt-1 space-y-1.5">
              {pieData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[entry.name] ?? '#94A3B8' }}
                    />
                    <span className="font-medium text-[#1A2332] capitalize">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <span className="font-bold text-[#1A2332]">{entry.value}</span>
                    <span>({entry.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── SECTION 4 — Currencies + System Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Taux de change */}
        <SectionCard delay={200}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#EFF6FF] rounded-lg"><TrendingUp size={16} className="text-[#3B82F6]" /></span>}
            title={t('admin.dashboard.live_rates')}
            badge={
              <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" style={{ animation: 'pulseOrg 1.5s ease-in-out infinite' }} />
                {t('admin.dashboard.live')}
              </div>
            }
            action={
              <button
                onClick={() => syncMut.mutate()}
                disabled={syncMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B1D3A] hover:bg-[#1A3A6B] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={syncMut.isPending ? 'animate-spin' : ''} />
                {t('admin.dashboard.refresh')}
              </button>
            }
          />
          <div className="p-4 space-y-2">
            {['USD','EUR','GBP','CNY'].map(code => {
              const d = devises.find(x => x.code === code);
              if (!d) return (
                <div key={code} className="h-14 bg-[#F8FAFC] rounded-xl animate-pulse" />
              );
              const { pct, up } = currVariation(d.taux_actuel, d.taux_base);
              const isEditing = editingCode === code;
              return (
                <div
                  key={code}
                  onClick={() => {
                    if (!isEditing) {
                      setEditingCode(code);
                      setEditingValue(d.taux_actuel.toString());
                    }
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                    isEditing
                      ? 'bg-white border-[#CFA030] shadow-sm cursor-default'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F0F7FF] cursor-pointer'
                  }`}
                >
                  {/* Left — flag + name (unchanged) */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none">{FLAG[code] ?? '🏳️'}</span>
                    <div>
                      <p className="text-sm font-black text-[#1A2332]">{code}</p>
                      <p className="text-xs text-[#94A3B8]">{d.nom}</p>
                    </div>
                  </div>

                  {/* Right — normal display OR edit controls */}
                  {isEditing ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        autoFocus
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  confirmEdit(code);
                          if (e.key === 'Escape') setEditingCode(null);
                        }}
                        className="w-28 text-right font-mono text-sm font-bold border-2 border-[#CFA030] rounded-lg px-2 py-1 bg-white text-[#1A2332] focus:outline-none"
                      />
                      <button
                        onClick={() => confirmEdit(code)}
                        disabled={updateRateMut.isPending}
                        className="cursor-pointer disabled:opacity-50"
                        title="Confirmer"
                      >
                        <CheckCircle size={16} color="#10B981" />
                      </button>
                      <button
                        onClick={() => setEditingCode(null)}
                        className="cursor-pointer"
                        title="Annuler"
                      >
                        <XCircle size={16} color="#EF4444" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#1A2332] font-mono tabular-nums">
                          {d.taux_actuel.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} DZD
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: up ? '#10B981' : '#EF4444' }}
                        >
                          {up ? '↑' : '↓'} {pct}%
                        </p>
                      </div>
                      <Pencil
                        size={13}
                        className="text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {lastSync && (
              <p className="text-xs text-[#94A3B8] pt-1">
                {t('admin.dashboard.updated_at')} {lastSync}
              </p>
            )}
            <p className="text-[10px] text-[#94A3B8] pt-2 flex items-center gap-1">
              <Pencil size={10} />
              Cliquez sur un taux pour le modifier manuellement
            </p>
          </div>
        </SectionCard>

        {/* Statut du système */}
        <SectionCard delay={250}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#F0FDF4] rounded-lg"><Server size={16} className="text-[#10B981]" /></span>}
            title={t('admin.dashboard.system_status')}
          />
          <div className="p-4 space-y-3">
            {/* Status indicators */}
            {[
              { label: t('admin.dashboard.db'),          ok: true,           icon: Database },
              { label: t('admin.dashboard.auth'),        ok: true,           icon: Shield  },
              { label: t('admin.dashboard.smtp'),        ok: smtpConfigured, icon: Mail    },
              { label: t('admin.dashboard.maintenance'), ok: !maintenanceOn, warn: maintenanceOn, icon: Wrench  },
            ].map(({ label, ok, warn, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]"
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className="text-[#64748B]" />
                  <span className="text-sm font-medium text-[#1A2332]">{label}</span>
                </div>
                {warn ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{t('admin.dashboard.active')}</span>
                ) : ok ? (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ {t('admin.dashboard.operational')}</span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">{t('admin.dashboard.not_configured')}</span>
                )}
              </div>
            ))}

            {/* Counters */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: t('admin.dashboard.active_users'), value: system_health.active_users },
                { label: t('admin.dashboard.roles_defined'), value: rolesCount                },
                { label: t('admin.dashboard.departments'),   value: deptCount                 },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <p className="text-xl font-black text-[#0B1D3A]">{value}</p>
                  <p className="text-[10px] font-semibold text-[#64748B] leading-tight mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── SECTION 5 — Registrations + Audit ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Demandes récentes */}
        <SectionCard delay={300}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#FFFBEB] rounded-lg"><Clock size={16} className="text-[#F59E0B]" /></span>}
            title={t('admin.dashboard.pending_registrations')}
            badge={
              registrations.length > 0
                ? <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{registrations.length}</span>
                : undefined
            }
            action={
              <button
                onClick={() => navigate('/admin/registrations')}
                className="text-xs font-bold text-[#3B82F6] hover:underline cursor-pointer"
              >
                {t('admin.dashboard.see_all')}
              </button>
            }
          />
          <div className="p-4">
            {regsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : registrations.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 text-[#94A3B8]">
                <Inbox size={36} />
                <p className="text-sm font-medium">{t('admin.dashboard.no_pending')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {registrations.map(reg => {
                  const statut = reg.statut ?? 'EN_ATTENTE_VALIDATION';
                  const badge  = REG_STATUS[statut] ?? REG_STATUS['EN_ATTENTE_VALIDATION'];
                  const name   = reg.raison_sociale || `${reg.user?.prenom ?? ''} ${reg.user?.nom ?? ''}`.trim() || '—';
                  return (
                    <div
                      key={reg.id}
                      className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F0F7FF] transition-all duration-150 cursor-default"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                        style={{ backgroundColor: avatarBg(name) }}
                      >
                        {initials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1A2332] truncate">{reg.raison_sociale || '—'}</p>
                        <p className="text-xs text-[#64748B] truncate">
                          {reg.ville ? `${reg.ville} · ` : ''}
                          {reg.created_at ? format(new Date(reg.created_at), 'dd/MM/yyyy') : '—'}
                        </p>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Activité récente */}
        <SectionCard delay={350}>
          <CardHeader
            icon={<span className="flex items-center justify-center w-8 h-8 bg-[#F5F3FF] rounded-lg"><Shield size={16} className="text-[#8B5CF6]" /></span>}
            title={t('admin.dashboard.recent_activity')}
            action={
              <button
                onClick={() => navigate('/admin/audit')}
                className="text-xs font-bold text-[#3B82F6] hover:underline cursor-pointer"
              >
                {t('admin.dashboard.full_log')}
              </button>
            }
          />
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {recent_audit.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-[#94A3B8]">
                <CheckCircle size={28} />
                <p className="text-sm font-medium">{t('common.empty_state')}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {recent_audit.slice(0, 8).map(entry => {
                  const ai = AUDIT_ICON[entry.action] ?? AUDIT_ICON['UPDATE'];
                  const Icon = ai.icon;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F7FF] transition-all duration-150 cursor-default"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: ai.bg }}
                      >
                        <Icon size={13} style={{ color: ai.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1A2332] truncate">{entry.utilisateur}</p>
                        <p className="text-xs text-[#94A3B8] font-mono truncate">{entry.table_cible}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: AUDIT_ICON[entry.action]?.bg ?? '#F1F5F9', color: AUDIT_ICON[entry.action]?.color ?? '#475569' }}
                        >
                          {entry.action}
                        </span>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          {relativeTime(entry.date_action)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

    </div>
  );
};

export default AdminDashboard;
