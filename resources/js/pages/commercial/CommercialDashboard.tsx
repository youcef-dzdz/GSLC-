import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, FileText, CheckCircle, TrendingUp,
  ChevronRight, AlertCircle, Building2, Calendar,
} from 'lucide-react';
import { commercialService } from '@/services/commercial.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  EN_ETUDE:        { label: 'En étude',        color: '#3B82F6', bg: '#EFF6FF' },
  DEVIS_ENVOYE:    { label: 'Devis envoyé',    color: '#F59E0B', bg: '#FFFBEB' },
  EN_NEGOCIATION:  { label: 'En négociation',  color: '#8B5CF6', bg: '#F5F3FF' },
  ACCEPTE:         { label: 'Accepté',         color: '#10B981', bg: '#ECFDF5' },
  REFUSE:          { label: 'Refusé',          color: '#EF4444', bg: '#FEF2F2' },
  ANNULE:          { label: 'Annulé',          color: '#6B7280', bg: '#F9FAFB' },
};

const PRIORITE_CFG: Record<string, { label: string; color: string }> = {
  NORMALE: { label: 'Normale', color: '#6B7280' },
  HAUTE:   { label: 'Haute',   color: '#F59E0B' },
  URGENTE: { label: 'Urgente', color: '#EF4444' },
};

const PIPELINE_STAGES = [
  { key: 'EN_ETUDE',       label: 'En étude',       color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'DEVIS_ENVOYE',   label: 'Devis envoyé',   color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'EN_NEGOCIATION', label: 'En négociation', color: '#8B5CF6', bg: '#F5F3FF' },
  { key: 'ACCEPTE',        label: 'Accepté',        color: '#10B981', bg: '#ECFDF5' },
  { key: 'REFUSE',         label: 'Refusé',         color: '#EF4444', bg: '#FEF2F2' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  pipeline: Record<string, number>;
  quote_conversion: { total: number; acceptes: number; taux: number };
  contrats_ce_mois: number;
  recent_activity: Array<{
    id: number;
    numero_dossier: string;
    client: string | null;
    statut: string;
    priorite: string;
    created_at: string;
  }>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery<{ data: DashboardData }>({
    queryKey: ['commercial-dashboard'],
    queryFn: async () => await commercialService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse max-w-7xl mx-auto pb-24">
        <div className="h-8 bg-[#F1F5F9] rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#F1F5F9] rounded-xl" />
          ))}
        </div>
        <div className="h-32 bg-[#F1F5F9] rounded-xl" />
        <div className="h-64 bg-[#F1F5F9] rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-[#64748B] text-sm">Erreur de chargement du tableau de bord</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#0D1F3C] text-white rounded-xl text-sm font-semibold hover:bg-[#1A4A8C]"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const db = data.data;

  // Computing KPIs
  const totalDemandes = Object.values(db.pipeline).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* ─── SECTION 1: Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Tableau de bord Commercial</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Bonjour — voici l'état de votre activité commerciale
          </p>
        </div>
        <div className="text-xs text-[#94A3B8] bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-sm">
          Mis à jour: {new Date().toLocaleDateString('fr-DZ')}
        </div>
      </div>

      {/* ─── SECTION 2: KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total demandes */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Total Demandes</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#EFF6FF]">
              <ClipboardList size={18} className="text-[#3B82F6]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0D1F3C]">{totalDemandes}</p>
          <p className="text-xs text-[#94A3B8] mt-1">{db.pipeline.EN_ETUDE || 0} en cours d'étude</p>
        </div>

        {/* Devis ce mois */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Devis ce mois</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F0FDF4]">
              <FileText size={18} className="text-[#10B981]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0D1F3C]">{db.quote_conversion.total}</p>
          <p className="text-xs text-[#94A3B8] mt-1">Taux d'acceptation: {db.quote_conversion.taux}%</p>
        </div>

        {/* Contrats signés */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Contrats signés</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ECFDF5]">
              <CheckCircle size={18} className="text-[#10B981]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0D1F3C]">{db.contrats_ce_mois}</p>
          <p className="text-xs text-[#94A3B8] mt-1">Ce mois</p>
        </div>

        {/* Taux de conversion */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Taux conversion</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFFBEB]">
              <TrendingUp size={18} className="text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#0D1F3C]">{db.quote_conversion.taux}%</p>
          <p className="text-xs text-[#94A3B8] mt-1">{db.quote_conversion.acceptes} / {db.quote_conversion.total} devis</p>
        </div>
      </div>

      {/* ─── SECTION 3: Pipeline visuel ─── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h2 className="text-sm font-black text-[#0D1F3C] mb-4">Pipeline Commercial</h2>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-0">
          {PIPELINE_STAGES.map((stage, index) => {
            const count = db.pipeline[stage.key] || 0;
            return (
              <div key={stage.key} className="flex items-center w-full">
                <div className="flex-1 bg-white rounded-xl border border-[#E2E8F0] p-4 text-center transition-all hover:border-[#CBD5E1] hover:shadow-sm">
                  <p className="text-3xl font-black" style={{ color: stage.color }}>{count}</p>
                  <p className="text-xs font-semibold text-[#94A3B8] mt-1 uppercase tracking-wide">{stage.label}</p>
                  <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: stage.bg }}>
                    <div 
                      className="h-1 rounded-full transition-all duration-1000" 
                      style={{ background: stage.color, width: `${Math.min(count * 10, 100)}%` }} 
                    />
                  </div>
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="hidden lg:flex px-2 items-center justify-center shrink-0">
                    <ChevronRight size={20} className="text-[#CBD5E1]" />
                  </div>
                )}
                {/* Mobile downward chevron */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className="flex lg:hidden py-1 w-full items-center justify-center shrink-0">
                    <ChevronRight size={20} className="text-[#CBD5E1] rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 4: Activité Récente ─── */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <h2 className="text-sm font-black text-[#0D1F3C]">Activité récente</h2>
          <button 
            onClick={() => navigate('/commercial/demands')}
            className="text-xs font-bold text-[#3B82F6] hover:text-[#1D4ED8] hover:underline"
          >
            Voir tout →
          </button>
        </div>
        
        {db.recent_activity.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-[#94A3B8]">
            <ClipboardList size={32} className="text-[#CBD5E1]" />
            <p className="text-sm font-semibold">Aucune activité récente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                <tr>
                  {['N° Dossier', 'Client', 'Statut', 'Priorité', 'Date'].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {db.recent_activity.map((item) => {
                  const statCfg = STATUT_CFG[item.statut] || { label: item.statut, color: '#6B7280', bg: '#F3F4F6' };
                  const prioCfg = PRIORITE_CFG[item.priorite] || { label: item.priorite, color: '#6B7280' };
                  
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      onClick={() => navigate('/commercial/demands')}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-black text-[#0D1F3C] font-mono text-xs group-hover:text-[#3B82F6] transition-colors">
                          {item.numero_dossier}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-[#94A3B8]" />
                          <span className="font-semibold text-[#374151]">{item.client || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-transparent"
                          style={{ background: statCfg.bg, color: statCfg.color, borderColor: `${statCfg.color}20` }}
                        >
                          {statCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black uppercase tracking-wider" style={{ color: prioCfg.color }}>
                          {prioCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-[#64748B] text-xs">
                          <Calendar size={13} />
                          {new Date(item.created_at).toLocaleDateString('fr-DZ')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
