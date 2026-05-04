import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Search, Eye, FileText, Check, X, Loader2, AlertCircle, ArrowLeft, ClipboardList } from 'lucide-react';
import { commercialService } from '@/services/commercial.service';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quote {
  id: number;
  numero_devis: string;
  version: number;
  demande_id: number;
  numero_dossier?: string;
  client?: string;
  montant_ht: number;
  tva: number;
  total_ttc: number;
  statut: string;
  commentaire_nashco?: string;
  commentaire_client?: string;
  date_envoi?: string;
  date_expiration?: string;
}

interface PaginatedResponse {
  data: Quote[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  BROUILLON:       { label: 'Brouillon',       color: '#6B7280', bg: '#F9FAFB' },
  ENVOYE:          { label: 'Envoyé',          color: '#3B82F6', bg: '#EFF6FF' },
  EN_NEGOCIATION:  { label: 'En négociation',  color: '#8B5CF6', bg: '#F5F3FF' },
  ACCEPTE:         { label: 'Accepté',         color: '#10B981', bg: '#ECFDF5' },
  REFUSE:          { label: 'Refusé',          color: '#EF4444', bg: '#FEF2F2' },
  EXPIRE:          { label: 'Expiré',          color: '#F59E0B', bg: '#FFFBEB' },
};

const NEXT_STATUTS: Record<string, string[]> = {
  BROUILLON:      ['ENVOYE'],
  ENVOYE:         ['EN_NEGOCIATION', 'ACCEPTE', 'REFUSE'],
  EN_NEGOCIATION: ['ACCEPTE', 'REFUSE'],
  ACCEPTE:        [],
  REFUSE:         [],
  EXPIRE:         [],
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (amount: number) => {
  return amount.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });
};

// ─── Quote Drawer ─────────────────────────────────────────────────────────────

const QuoteDrawer = ({
  quote, onClose,
}: { quote: Quote; onClose: () => void }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newStatut, setNewStatut] = useState('');

  const nextOptions = NEXT_STATUTS[quote.statut] ?? [];

  const updateMut = useMutation({
    mutationFn: () =>
      commercialService.updateQuote(quote.id, {
        statut: newStatut,
      }),
    onSuccess: () => {
      toast('success', 'Statut mis à jour', `Devis passé à "${STATUT_CFG[newStatut]?.label ?? newStatut}"`);
      qc.invalidateQueries({ queryKey: ['commercial-quotes'] });
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
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Devis</p>
              <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                v{quote.version}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#0D1F3C]">{quote.numero_devis}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Status */}
          <div className="flex items-center gap-3">
            <StatutBadge statut={quote.statut} />
            {quote.version > 1 && (
              <span className="text-xs text-[#94A3B8]">
                Version {quote.version} — négociation en cours
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Client</p>
              <p className="font-semibold text-[#0D1F3C]">{quote.client ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Demande liée</p>
              <p className="font-semibold text-[#0D1F3C] font-mono text-xs">{quote.numero_dossier ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Montant HT</p>
              <p className="font-semibold text-[#0D1F3C]">{formatMoney(quote.montant_ht)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">TVA</p>
              <p className="font-semibold text-[#0D1F3C]">{quote.tva}%</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3 col-span-2">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Total TTC</p>
              <p className="font-black text-lg text-[#0D1F3C]">{formatMoney(quote.total_ttc)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date d'envoi</p>
              <p className="font-semibold text-[#0D1F3C]">
                {quote.date_envoi ? new Date(quote.date_envoi).toLocaleDateString('fr-DZ') : '—'}
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date d'expiration</p>
              <p className="font-semibold text-[#0D1F3C]">
                {quote.date_expiration ? new Date(quote.date_expiration).toLocaleDateString('fr-DZ') : '—'}
              </p>
            </div>
          </div>

          {/* Negotiation thread */}
          {(quote.commentaire_nashco || quote.commentaire_client) && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Fil de négociation</p>

              {quote.commentaire_nashco && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#0D1F3C] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-bold">N</span>
                    </div>
                    <span className="text-xs font-semibold text-[#0D1F3C]">NASHCO</span>
                    <span className="text-[10px] text-[#94A3B8]">Commercial</span>
                  </div>
                  <div className="ml-8 bg-[#EFF6FF] rounded-xl rounded-tl-none px-3 py-2.5">
                    <p className="text-xs text-[#1E40AF]">{quote.commentaire_nashco}</p>
                  </div>
                </div>
              )}

              {quote.commentaire_client && (
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#94A3B8]">Client</span>
                    <span className="text-xs font-semibold text-[#0D1F3C]">{quote.client ?? 'Client'}</span>
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-bold">C</span>
                    </div>
                  </div>
                  <div className="mr-8 bg-[#FFFBEB] rounded-xl rounded-tr-none px-3 py-2.5">
                    <p className="text-xs text-[#92400E]">{quote.commentaire_client}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {quote.statut === 'ACCEPTE' && (
            <button
              onClick={() => {
                onClose();
                navigate(`/commercial/contracts/new?devis_id=${quote.id}`);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[#10B981] text-[#10B981] hover:bg-[#ECFDF5] text-sm font-semibold transition-colors"
            >
              <FileText size={16} />
              Créer le contrat
            </button>
          )}

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

              {newStatut && (
                <button
                  onClick={() => updateMut.mutate()}
                  disabled={updateMut.isPending}
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

// ─── Quote Form ───────────────────────────────────────────────────────────────

const QuoteForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const qc = useQueryClient();

  const demande_id = searchParams.get('demande_id');
  const dossier = searchParams.get('dossier');

  const [montantHt, setMontantHt] = useState<number | ''>('');
  const [tva, setTva] = useState<number>(19);
  const [commentaireNashco, setCommentaireNashco] = useState('');
  const [dateExpiration, setDateExpiration] = useState('');

  const ht = Number(montantHt) || 0;
  const totalTtc = ht + (ht * tva) / 100;

  const createMut = useMutation({
    mutationFn: () =>
      commercialService.createQuote({
        demande_id: Number(demande_id),
        montant_ht: ht,
        tva,
        total_ttc: totalTtc,
        commentaire_nashco: commentaireNashco,
        date_expiration: dateExpiration,
      }),
    onSuccess: () => {
      toast('success', 'Devis créé', 'Le devis a été enregistré avec succès');
      qc.invalidateQueries({ queryKey: ['commercial-quotes'] });
      navigate('/commercial/quotes');
    },
    onError: (e: any) => {
      toast('error', 'Erreur', e?.response?.data?.message ?? 'Une erreur est survenue');
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/commercial/quotes')}
          className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Générer un devis</h1>
          {dossier && (
            <p className="text-sm text-[#94A3B8] mt-1">
              Devis pour la demande: <span className="font-semibold text-[#0D1F3C]">{dossier}</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Montant HT (DZD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={montantHt}
              onChange={(e) => setMontantHt(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              TVA (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={tva}
              onChange={(e) => setTva(Number(e.target.value))}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>
        </div>

        <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex justify-between items-center">
          <span className="text-sm font-semibold text-[#64748B]">Total TTC calculé :</span>
          <span className="text-xl font-black text-[#0D1F3C]">{formatMoney(totalTtc)}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Date d'expiration
          </label>
          <input
            type="date"
            value={dateExpiration}
            onChange={(e) => setDateExpiration(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Commentaire interne (NASHCO)
          </label>
          <textarea
            value={commentaireNashco}
            onChange={(e) => setCommentaireNashco(e.target.value)}
            placeholder="Notes internes, détails du calcul..."
            rows={4}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/commercial/quotes')}
          className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending || ht <= 0}
          className="px-5 py-2.5 rounded-lg bg-[#0D1F3C] text-white text-sm font-semibold hover:bg-[#1A4A8C] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Créer le devis
        </button>
      </div>
    </div>
  );
};

// ─── Quotes List ──────────────────────────────────────────────────────────────

const QuotesList = () => {
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['commercial-quotes', page, statutFilter],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (statutFilter) params.statut = statutFilter;
      return (await commercialService.getQuotes(params)).data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data?.data ?? [];
    const q = search.toLowerCase();
    return (data?.data ?? []).filter(
      (d) => d.numero_devis.toLowerCase().includes(q)
    );
  }, [data?.data, search]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Devis</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {data?.total ?? 0} devis au total
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
            placeholder="Rechercher n° devis..."
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
            <button onClick={() => refetch()} className="text-xs underline font-semibold">Réessayer</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-[#CBD5E1]">
            <ClipboardList size={32} />
            <p className="text-sm">Aucun devis trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {['N° Devis', 'Demande liée', 'Client', 'Montant TTC', 'Statut', 'Date expiration', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#0D1F3C] font-mono text-xs">{q.numero_devis}</span>
                      <span className="ml-2 text-[10px] text-[#94A3B8] font-bold">v{q.version}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#64748B] font-mono text-xs">{q.numero_dossier ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#374151] font-medium">{q.client ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#0D1F3C]">{formatMoney(q.total_ttc)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={q.statut} />
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-xs">
                      {q.date_expiration ? new Date(q.date_expiration).toLocaleDateString('fr-DZ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#3B82F6] transition-colors"
                        title="Voir détails"
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
      {selectedQuote && (
        <QuoteDrawer
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialQuotes() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isNew = location.pathname.includes('/new') || searchParams.has('demande_id');

  if (isNew) {
    return <QuoteForm />;
  }

  return <QuotesList />;
}
