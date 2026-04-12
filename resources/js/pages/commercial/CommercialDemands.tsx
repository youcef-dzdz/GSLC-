import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Eye, ChevronDown, Loader2, AlertCircle,
  ClipboardList, X, Check, Calendar, Building2,
} from 'lucide-react';
import { commercialService } from '@/services/commercial.service';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Demand {
  id: number;
  numero_dossier: string;
  client: string | null;
  client_id: number;
  port_origine: string | null;
  port_destination: string | null;
  statut: string;
  priorite: string;
  type_achat: string;
  date_soumission: string;
  date_livraison_souhaitee: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Demand[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
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

const NEXT_STATUTS: Record<string, string[]> = {
  EN_ETUDE:       ['DEVIS_ENVOYE', 'REFUSE'],
  DEVIS_ENVOYE:   ['EN_NEGOCIATION', 'ACCEPTE', 'REFUSE'],
  EN_NEGOCIATION: ['ACCEPTE', 'REFUSE'],
  ACCEPTE:        [],
  REFUSE:         [],
  ANNULE:         [],
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatutBadge = ({ statut }: { statut: string }) => {
  const cfg = STATUT_CFG[statut] ?? { label: statut, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DemandDrawer = ({
  demand, onClose,
}: { demand: Demand; onClose: () => void }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newStatut, setNewStatut] = useState('');
  const [motif, setMotif] = useState('');

  const nextOptions = NEXT_STATUTS[demand.statut] ?? [];

  const updateMut = useMutation({
    mutationFn: () =>
      commercialService.updateDemandStatus(demand.id, {
        statut: newStatut,
        motif_rejet: newStatut === 'REFUSE' ? motif : undefined,
      }),
    onSuccess: () => {
      toast('success', 'Statut mis à jour', `Demande passée à "${STATUT_CFG[newStatut]?.label ?? newStatut}"`);
      qc.invalidateQueries({ queryKey: ['commercial-demands'] });
      qc.invalidateQueries({ queryKey: ['commercial-dashboard'] });
      onClose();
    },
    onError: (e: any) => toast('error', 'Erreur', e?.response?.data?.message ?? 'Une erreur est survenue'),
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Demande</p>
            <h2 className="text-lg font-black text-[#0D1F3C]">{demand.numero_dossier}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status */}
          <div className="flex items-center gap-3">
            <StatutBadge statut={demand.statut} />
            <span className="text-xs font-semibold" style={{ color: PRIORITE_CFG[demand.priorite]?.color }}>
              {PRIORITE_CFG[demand.priorite]?.label ?? demand.priorite}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Client</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.client ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Type achat</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.type_achat}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Port origine</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.port_origine ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Port destination</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.port_destination ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Soumis le</p>
              <p className="font-semibold text-[#0D1F3C]">
                {demand.date_soumission ? new Date(demand.date_soumission).toLocaleDateString('fr-DZ') : '—'}
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Livraison souhaitée</p>
              <p className="font-semibold text-[#0D1F3C]">
                {demand.date_livraison_souhaitee ? new Date(demand.date_livraison_souhaitee).toLocaleDateString('fr-DZ') : '—'}
              </p>
            </div>
          </div>

          {/* Transition section */}
          {nextOptions.length > 0 && (
            <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-[#0D1F3C]">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {nextOptions.map((s) => {
                  const cfg = STATUT_CFG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setNewStatut(s === newStatut ? '' : s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                      style={{
                        background: newStatut === s ? cfg?.bg : '#fff',
                        color: cfg?.color,
                        borderColor: newStatut === s ? cfg?.color : '#E2E8F0',
                      }}
                    >
                      {cfg?.label ?? s}
                    </button>
                  );
                })}
              </div>

              {newStatut === 'REFUSE' && (
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Motif de refus (obligatoire)..."
                  rows={3}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] resize-none"
                />
              )}

              {newStatut && (
                <button
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending || (newStatut === 'REFUSE' && !motif.trim())}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {updateMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Confirmer le changement
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialDemands() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['commercial-demands', page, statutFilter, prioriteFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (statutFilter) params.statut = statutFilter;
      if (prioriteFilter) params.priorite = prioriteFilter;
      return (await commercialService.getDemands(params)).data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data?.data ?? [];
    const q = search.toLowerCase();
    return (data?.data ?? []).filter(
      (d) =>
        d.numero_dossier.toLowerCase().includes(q) ||
        (d.client ?? '').toLowerCase().includes(q)
    );
  }, [data?.data, search]);

  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Demandes d'import</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {data?.total ?? 0} demande{(data?.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <a
          href="/commercial/demands/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nouvelle demande
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher n° dossier, client..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
          />
        </div>

        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_CFG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        <select
          value={prioriteFilter}
          onChange={(e) => { setPrioriteFilter(e.target.value); setPage(1); }}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITE_CFG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#0D1F3C]" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 gap-3 text-red-500">
            <AlertCircle size={28} />
            <p className="text-sm">Erreur de chargement</p>
            <button onClick={() => refetch()} className="text-xs underline font-semibold">Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-[#CBD5E1]">
            <ClipboardList size={32} />
            <p className="text-sm">Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {['N° Dossier', 'Client', 'Ports', 'Type', 'Priorité', 'Livraison', 'Statut', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#0D1F3C] font-mono text-xs">{d.numero_dossier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                          <Building2 size={13} className="text-[#3B82F6]" />
                        </div>
                        <span className="text-[#374151] font-medium truncate max-w-32">{d.client ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      <div className="text-xs">
                        <span>{d.port_origine ?? '—'}</span>
                        <span className="text-[#CBD5E1] mx-1">→</span>
                        <span>{d.port_destination ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">
                        {d.type_achat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: PRIORITE_CFG[d.priorite]?.color }}>
                        {PRIORITE_CFG[d.priorite]?.label ?? d.priorite}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {d.date_livraison_souhaitee
                          ? new Date(d.date_livraison_souhaitee).toLocaleDateString('fr-DZ')
                          : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={d.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedDemand(d)}
                        className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#3B82F6] transition-colors"
                        title="Voir / changer statut"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && (data?.last_page ?? 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F1F5F9] text-xs text-[#6B7280]">
            <span>Page {data?.current_page} / {data?.last_page}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                ← Préc.
              </button>
              <button
                disabled={page >= (data?.last_page ?? 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Suiv. →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedDemand && (
        <DemandDrawer
          demand={selectedDemand}
          onClose={() => setSelectedDemand(null)}
        />
      )}
    </div>
  );
}
