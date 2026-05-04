import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Eye, Check, X, Loader2, AlertCircle, FileText, ArrowLeft, Zap } from 'lucide-react';
import { commercialService } from '@/services/commercial.service';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contract {
  id: number;
  numero_contrat: string;
  client: string | null;
  client_id: number;
  statut: string;
  statut_caution: string;
  date_debut: string;
  date_fin: string;
  montant_caution: number;
  jours_restants: number;
  created_at: string;
}

interface PaginatedResponse {
  data: Contract[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE_SIGNATURE:             { label: 'Attente signature',  color: '#F59E0B', bg: '#FFFBEB' },
  EN_ATTENTE_ACTIVATION:            { label: 'Attente activation', color: '#3B82F6', bg: '#EFF6FF' },
  EN_ATTENTE_APPROBATION_DIRECTEUR: { label: 'Attente directeur',  color: '#8B5CF6', bg: '#F5F3FF' },
  ACTIF:                            { label: 'Actif',              color: '#10B981', bg: '#ECFDF5' },
  EXPIRE:                           { label: 'Expiré',             color: '#EF4444', bg: '#FEF2F2' },
  RESILIE:                          { label: 'Résilié',            color: '#6B7280', bg: '#F9FAFB' },
};

const STATUT_CAUTION_CFG: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#F59E0B' },
  RECU:       { label: 'Reçu',       color: '#10B981' },
  RESTITUE:   { label: 'Restitué',   color: '#6B7280' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (n: number) =>
  n.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });

const formatDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-DZ') : '—';

// ─── Status Badge ─────────────────────────────────────────────────────────────

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

// ─── Jours Restants Badge ─────────────────────────────────────────────────────

const JoursBadge = ({ jours }: { jours: number }) => {
  const color = jours > 30 ? '#10B981' : jours >= 1 ? '#F59E0B' : '#EF4444';
  const bg    = jours > 30 ? '#ECFDF5' : jours >= 1 ? '#FFFBEB' : '#FEF2F2';
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: bg, color }}
    >
      {jours}j
    </span>
  );
};

// ─── Contract Drawer ──────────────────────────────────────────────────────────

const ContractDrawer = ({
  contract, onClose,
}: { contract: Contract; onClose: () => void }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const activateMut = useMutation({
    mutationFn: () => commercialService.activateContract(contract.id),
    onSuccess: () => {
      toast('success', 'Contrat activé', 'Le contrat a été activé avec succès.');
      qc.invalidateQueries({ queryKey: ['commercial-contracts'] });
      onClose();
    },
    onError: (e: any) =>
      toast('error', 'Erreur', e?.response?.data?.message ?? 'Une erreur est survenue'),
  });

  const cautionCfg = STATUT_CAUTION_CFG[contract.statut_caution] ?? {
    label: contract.statut_caution,
    color: '#6B7280',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Contrat</p>
            <h2 className="text-lg font-black text-[#0D1F3C]">{contract.numero_contrat}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">

          {/* Status */}
          <div className="flex items-center gap-3">
            <StatutBadge statut={contract.statut} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Client</p>
              <p className="font-semibold text-[#0D1F3C]">{contract.client ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Statut caution</p>
              <p className="font-semibold" style={{ color: cautionCfg.color }}>{cautionCfg.label}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3 col-span-2">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Montant caution</p>
              <p className="font-black text-lg text-[#0D1F3C]">{formatMoney(contract.montant_caution)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date début</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(contract.date_debut)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date fin</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(contract.date_fin)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Jours restants</p>
              <JoursBadge jours={contract.jours_restants} />
            </div>
          </div>

          {/* Activate button */}
          {contract.statut === 'EN_ATTENTE_ACTIVATION' && (
            <button
              onClick={() => activateMut.mutate()}
              disabled={activateMut.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {activateMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Activer le contrat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Contract Form ────────────────────────────────────────────────────────────

const ContractForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const qc = useQueryClient();

  const devis_id = searchParams.get('devis_id');

  const [dateDebut,        setDateDebut]        = useState('');
  const [dateFin,          setDateFin]          = useState('');
  const [montantCaution,   setMontantCaution]   = useState<number | ''>('');
  const [clausesSpeciales, setClausesSpeciales] = useState('');

  const createMut = useMutation({
    mutationFn: () =>
      commercialService.createContract({
        devis_id:         Number(devis_id),
        date_debut:       dateDebut,
        date_fin:         dateFin,
        montant_caution:  Number(montantCaution),
        clauses_speciales: clausesSpeciales || undefined,
      }),
    onSuccess: () => {
      toast('success', 'Contrat créé', 'Contrat créé. OTP envoyé au client.');
      qc.invalidateQueries({ queryKey: ['commercial-contracts'] });
      navigate('/commercial/contracts');
    },
    onError: (e: any) => {
      toast('error', 'Erreur', e?.response?.data?.message ?? 'Une erreur est survenue');
    },
  });

  const isValid =
    !!dateDebut &&
    !!dateFin &&
    dateFin >= dateDebut &&
    Number(montantCaution) > 0;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Back + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/commercial/contracts')}
          className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Nouveau contrat</h1>
          {devis_id && (
            <p className="text-sm text-[#94A3B8] mt-1">
              Contrat généré depuis le devis :{' '}
              <span className="font-semibold text-[#0D1F3C] font-mono">#{devis_id}</span>
            </p>
          )}
        </div>
      </div>

      {/* Devis banner */}
      {devis_id && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-sm">
          <FileText size={16} className="text-[#3B82F6] flex-shrink-0" />
          <span className="text-[#1D4ED8] font-medium">
            Ce contrat sera lié au devis <span className="font-bold font-mono">#{devis_id}</span>
          </span>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Date début <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Date fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dateFin}
              min={dateDebut || undefined}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Montant caution (DZD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={montantCaution}
            onChange={(e) =>
              setMontantCaution(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="0.00"
            min={0}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
          />
          {Number(montantCaution) > 0 && (
            <p className="text-xs text-[#94A3B8]">
              = {formatMoney(Number(montantCaution))}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Clauses spéciales
          </label>
          <textarea
            value={clausesSpeciales}
            onChange={(e) => setClausesSpeciales(e.target.value)}
            placeholder="Clauses contractuelles spécifiques (optionnel)..."
            rows={4}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/commercial/contracts')}
          className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending || !isValid}
          className="px-5 py-2.5 rounded-lg bg-[#0D1F3C] text-white text-sm font-semibold hover:bg-[#1A4A8C] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Créer le contrat
        </button>
      </div>
    </div>
  );
};

// ─── Contracts List ───────────────────────────────────────────────────────────

const ContractsList = () => {
  const [search,        setSearch]        = useState('');
  const [statutFilter,  setStatutFilter]  = useState('');
  const [page,          setPage]          = useState(1);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['commercial-contracts', page, statutFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (statutFilter) params.statut = statutFilter;
      return (await commercialService.getContracts(params)).data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data?.data ?? [];
    const q = search.toLowerCase();
    return (data?.data ?? []).filter(
      (c) =>
        c.numero_contrat.toLowerCase().includes(q) ||
        (c.client ?? '').toLowerCase().includes(q),
    );
  }, [data?.data, search]);

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Contrats</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {data?.total ?? 0} contrat{(data?.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher n° contrat, client..."
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
            <button onClick={() => refetch()} className="text-xs underline font-semibold">
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-[#CBD5E1]">
            <FileText size={32} />
            <p className="text-sm">Aucun contrat trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {[
                    'N° Contrat', 'Client', 'Statut', 'Caution',
                    'Statut caution', 'Début', 'Fin', 'Jours restants', '',
                  ].map((h) => (
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
                {filtered.map((c) => {
                  const cautionCfg = STATUT_CAUTION_CFG[c.statut_caution] ?? {
                    label: c.statut_caution,
                    color: '#6B7280',
                  };
                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#0D1F3C] font-mono text-xs">
                          {c.numero_contrat}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#374151] font-medium truncate max-w-32 block">
                          {c.client ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatutBadge statut={c.statut} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#0D1F3C] whitespace-nowrap">
                          {formatMoney(c.montant_caution)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: cautionCfg.color }}>
                          {cautionCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                        {formatDate(c.date_debut)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6B7280] whitespace-nowrap">
                        {formatDate(c.date_fin)}
                      </td>
                      <td className="px-4 py-3">
                        <JoursBadge jours={c.jours_restants} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedContract(c)}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#3B82F6] transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                ← Préc.
              </button>
              <button
                disabled={page >= (data?.last_page ?? 1)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Suiv. →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedContract && (
        <ContractDrawer
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialContracts() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isForm = location.pathname.includes('/new') || !!searchParams.get('devis_id');

  return isForm ? <ContractForm /> : <ContractsList />;
}
