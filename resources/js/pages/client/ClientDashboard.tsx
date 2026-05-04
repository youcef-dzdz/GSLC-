import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, AlertCircle, CreditCard, Shield,
  Loader2, Plus, FileText, Receipt, ClipboardList,
} from 'lucide-react';
import { clientPortalService } from '@/services/clientPortal.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentDemand {
  id: number;
  numero_dossier: string;
  statut: string;
  priorite: string;
  created_at: string;
}

interface DashboardData {
  conteneurs_actifs: number;
  factures_impayees: { count: number; montant: number };
  derniers_demandes: RecentDemand[];
  score_risque: 'FAIBLE' | 'MOYEN' | 'ELEVE';
}

// ─── Config ───────────────────────────────────────────────────────────────────

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

const RISQUE_CFG = {
  FAIBLE: { label: 'Faible',  color: '#10B981', bg: '#ECFDF5' },
  MOYEN:  { label: 'Moyen',   color: '#F59E0B', bg: '#FFFBEB' },
  ELEVE:  { label: 'Élevé',   color: '#EF4444', bg: '#FEF2F2' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (n: number) =>
  n.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-DZ');

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatutBadge = ({ statut }: { statut: string }) => {
  const cfg = STATUT_CFG[statut] ?? { label: statut, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const KpiCard = ({ label, value, icon: Icon, iconColor, iconBg }: KpiCardProps) => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 flex items-center gap-4">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: iconBg }}
    >
      <Icon size={22} style={{ color: iconColor }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-2xl font-black text-[#0D1F3C] leading-tight">{value}</div>
    </div>
  </div>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────

interface ActionBtnProps {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  primary?: boolean;
}

const ActionBtn = ({ label, icon: Icon, onClick, primary }: ActionBtnProps) => (
  <button
    onClick={onClick}
    className={[
      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
      primary
        ? 'bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white'
        : 'bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#374151]',
    ].join(' ')}
  >
    <Icon size={15} />
    {label}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['client-dashboard'],
    queryFn: async () => (await clientPortalService.getDashboard()).data,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-[#0D1F3C]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-red-500">
        <AlertCircle size={32} />
        <p className="text-sm font-medium">Erreur de chargement du tableau de bord</p>
        <button onClick={() => refetch()} className="text-xs underline font-semibold">
          Réessayer
        </button>
      </div>
    );
  }

  const risqueCfg = RISQUE_CFG[data.score_risque] ?? RISQUE_CFG.FAIBLE;

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-[#0D1F3C]">Mon Espace Client</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Bienvenue sur votre portail NASHCO</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Conteneurs actifs"
          value={data.conteneurs_actifs}
          icon={Box}
          iconColor="#3B82F6"
          iconBg="#EFF6FF"
        />
        <KpiCard
          label="Factures impayées"
          value={data.factures_impayees.count}
          icon={AlertCircle}
          iconColor="#EF4444"
          iconBg="#FEF2F2"
        />
        <KpiCard
          label="Montant dû"
          value={
            <span className="text-lg font-black text-[#0D1F3C]">
              {formatMoney(data.factures_impayees.montant)}
            </span>
          }
          icon={CreditCard}
          iconColor="#F59E0B"
          iconBg="#FFFBEB"
        />
        <KpiCard
          label="Score de risque"
          value={
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: risqueCfg.bg, color: risqueCfg.color }}
            >
              {risqueCfg.label}
            </span>
          }
          icon={Shield}
          iconColor={risqueCfg.color}
          iconBg={risqueCfg.bg}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-3">
        <ActionBtn
          label="Nouvelle demande"
          icon={Plus}
          onClick={() => navigate('/client/demands/new')}
          primary
        />
        <ActionBtn
          label="Mes devis"
          icon={Receipt}
          onClick={() => navigate('/client/quotes')}
        />
        <ActionBtn
          label="Mes contrats"
          icon={FileText}
          onClick={() => navigate('/client/contracts')}
        />
        <ActionBtn
          label="Mes factures"
          icon={ClipboardList}
          onClick={() => navigate('/client/invoices')}
        />
      </div>

      {/* ── Recent Demands Table ── */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#0D1F3C]">Dernières demandes</h2>

        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {data.derniers_demandes.length === 0 ? (
            <div className="flex flex-col items-center py-14 gap-3 text-[#CBD5E1]">
              <ClipboardList size={32} />
              <p className="text-sm">Aucune demande pour le moment</p>
              <button
                onClick={() => navigate('/client/demands/new')}
                className="text-xs font-semibold text-[#3B82F6] underline"
              >
                Créer votre première demande
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    {['N° Dossier', 'Statut', 'Priorité', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {data.derniers_demandes.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#0D1F3C] font-mono text-xs">
                          {d.numero_dossier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatutBadge statut={d.statut} />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: PRIORITE_CFG[d.priorite]?.color ?? '#6B7280' }}
                        >
                          {PRIORITE_CFG[d.priorite]?.label ?? d.priorite}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
