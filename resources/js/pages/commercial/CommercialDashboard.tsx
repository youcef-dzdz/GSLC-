import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList, Receipt, FileText, Users,
  TrendingUp, Clock, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { commercialService } from '@/services/commercial.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pipeline {
  EN_ETUDE: number;
  DEVIS_ENVOYE: number;
  EN_NEGOCIATION: number;
  ACCEPTE: number;
  REFUSE: number;
}

interface RecentDemand {
  id: number;
  numero_dossier: string;
  client: string | null;
  statut: string;
  priorite: string;
  created_at: string;
}

interface DashboardData {
  pipeline: Pipeline;
  quote_conversion: { total: number; acceptes: number; taux: number };
  contrats_ce_mois: number;
  recent_activity: RecentDemand[];
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  EN_ETUDE:        { label: 'En étude',        color: '#3B82F6', bg: '#EFF6FF' },
  DEVIS_ENVOYE:    { label: 'Devis envoyé',    color: '#F59E0B', bg: '#FFFBEB' },
  EN_NEGOCIATION:  { label: 'En négociation',  color: '#8B5CF6', bg: '#F5F3FF' },
  ACCEPTE:         { label: 'Accepté',         color: '#10B981', bg: '#ECFDF5' },
  REFUSE:          { label: 'Refusé',          color: '#EF4444', bg: '#FEF2F2' },
};

const PRIORITE_CFG: Record<string, { label: string; color: string }> = {
  NORMALE:  { label: 'Normale',  color: '#6B7280' },
  HAUTE:    { label: 'Haute',    color: '#F59E0B' },
  URGENTE:  { label: 'Urgente',  color: '#EF4444' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KpiCard = ({
  label, value, icon: Icon, color, sub,
}: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex items-start gap-4">
    <div className="rounded-xl p-3" style={{ background: color + '20' }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-[#0D1F3C] mt-0.5">{value}</p>
      {sub && <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatutBadge = ({ statut }: { statut: string }) => {
  const cfg = STATUT_CFG[statut] ?? { label: statut, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────

const PrioriteBadge = ({ priorite }: { priorite: string }) => {
  const cfg = PRIORITE_CFG[priorite] ?? { label: priorite, color: '#6B7280' };
  return (
    <span className="text-xs font-semibold" style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CommercialDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['commercial-dashboard'],
    queryFn: async () => (await commercialService.getDashboard()).data,
    refetchInterval: 60_000,
  });

  const pipelineChartData = data
    ? Object.entries(data.pipeline).map(([key, val]) => ({
        name: STATUT_CFG[key]?.label ?? key,
        total: val,
        color: STATUT_CFG[key]?.color ?? '#6B7280',
      }))
    : [];

  const totalDemands = data
    ? Object.values(data.pipeline).reduce((a, b) => a + b, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50 rounded-xl border border-red-100">
        <AlertCircle size={20} />
        <span>Impossible de charger le tableau de bord. <button onClick={() => refetch()} className="underline font-semibold">Réessayer</button></span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-black text-[#0D1F3C]">Tableau de bord Commercial</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Vue d'ensemble de l'activité commerciale</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Demandes totales"
          value={totalDemands}
          icon={ClipboardList}
          color="#3B82F6"
          sub={`${data?.pipeline.EN_ETUDE ?? 0} en cours d'étude`}
        />
        <KpiCard
          label="Devis ce mois"
          value={data?.quote_conversion.total ?? 0}
          icon={Receipt}
          color="#8B5CF6"
          sub={`Taux acceptation : ${data?.quote_conversion.taux ?? 0}%`}
        />
        <KpiCard
          label="Contrats signés"
          value={data?.contrats_ce_mois ?? 0}
          icon={FileText}
          color="#10B981"
          sub="Ce mois"
        />
        <KpiCard
          label="Taux conversion"
          value={`${data?.quote_conversion.taux ?? 0}%`}
          icon={TrendingUp}
          color="#CFA030"
          sub={`${data?.quote_conversion.acceptes ?? 0} / ${data?.quote_conversion.total ?? 0} devis`}
        />
      </div>

      {/* Pipeline chart + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Pipeline bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <h2 className="text-sm font-semibold text-[#0D1F3C] mb-4">Pipeline des demandes</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                cursor={{ fill: '#F8FAFC' }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {pipelineChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent demands */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0D1F3C]">Activité récente</h2>
            <a href="/commercial/demands" className="text-xs text-[#1A4A8C] hover:underline font-semibold">
              Voir tout →
            </a>
          </div>

          {data?.recent_activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#CBD5E1]">
              <ClipboardList size={32} className="mb-2" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recent_activity.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={14} className="text-[#3B82F6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0D1F3C] truncate">
                        {d.numero_dossier}
                      </p>
                      <p className="text-xs text-[#94A3B8] truncate">
                        {d.client ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <PrioriteBadge priorite={d.priorite} />
                    <StatutBadge statut={d.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline status breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#0D1F3C] mb-4">Répartition du pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(STATUT_CFG).map(([key, cfg]) => {
            const count = data?.pipeline[key as keyof Pipeline] ?? 0;
            const pct = totalDemands > 0 ? Math.round((count / totalDemands) * 100) : 0;
            return (
              <div
                key={key}
                className="rounded-xl p-4 text-center border"
                style={{ background: cfg.bg, borderColor: cfg.color + '30' }}
              >
                <p className="text-2xl font-black" style={{ color: cfg.color }}>{count}</p>
                <p className="text-xs font-semibold mt-1" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CommercialDashboard;
