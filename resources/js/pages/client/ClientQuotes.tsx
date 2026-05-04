import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Loader2, AlertCircle, ClipboardList, FileText, MessageSquare } from 'lucide-react';
import { clientPortalService } from '@/services/clientPortal.service';
import { useToast } from '@/components/ui/Toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  BROUILLON:            { label: 'Brouillon',         color: '#6B7280', bg: '#F9FAFB' },
  ENVOYE:               { label: 'Envoyé',            color: '#3B82F6', bg: '#EFF6FF' },
  EN_NEGOCIATION:       { label: 'En négociation',    color: '#8B5CF6', bg: '#F5F3FF' },
  MODIFICATION_DEMANDEE:{ label: 'Modif. demandée',   color: '#F59E0B', bg: '#FFFBEB' },
  ACCEPTE:              { label: 'Accepté',           color: '#10B981', bg: '#ECFDF5' },
  REFUSE:               { label: 'Refusé',            color: '#EF4444', bg: '#FEF2F2' },
  EXPIRE:               { label: 'Expiré',            color: '#9CA3AF', bg: '#F3F4F6' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quote {
  id: number;
  numero_devis: string;
  version: number;
  montant_ht: number;
  tva: number;
  total_ttc: number;
  statut: string;
  commentaire_nashco?: string;
  commentaire_client?: string;
  date_envoi?: string;
  date_expiration?: string;
  demande?: {
    id: number;
    numero_dossier: string;
  };
  lignes?: Array<{
    id: number;
    service: string;
    description?: string;
    quantite: number;
    prix_unitaire: number;
    total_ht: number;
  }>;
}

interface Demand {
  id: number;
  numero_dossier: string;
  statut: string;
  devis?: Quote[];
}

interface PaginatedResponse {
  data: Demand[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (n: number) =>
  n.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ');
};

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

// ─── Modal ────────────────────────────────────────────────────────────────────

const QuoteDetailModal = ({
  quoteId, onClose,
}: { quoteId: number; onClose: () => void }) => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeForm, setActiveForm] = useState<'NONE' | 'REJECT' | 'MODIFY'>('NONE');
  const [commentaire, setCommentaire] = useState('');

  const { data: qData, isLoading, isError } = useQuery<{ devis: Quote }>({
    queryKey: ['client-quote-detail', quoteId],
    queryFn: async () => (await clientPortalService.getQuote(quoteId)).data,
  });

  const quote = qData?.devis;

  const handleSuccess = (msg: string) => {
    toast('success', 'Succès', msg);
    qc.invalidateQueries({ queryKey: ['client-demands-quotes'] });
    qc.invalidateQueries({ queryKey: ['client-demand-detail'] });
    onClose();
  };

  const handleError = (e: any) => {
    toast('error', 'Erreur', e?.response?.data?.message || 'Une erreur est survenue');
  };

  const acceptMut = useMutation({
    mutationFn: () => clientPortalService.acceptQuote(quoteId),
    onSuccess: () => handleSuccess('Devis accepté avec succès.'),
    onError: handleError,
  });

  const rejectMut = useMutation({
    mutationFn: () => clientPortalService.rejectQuote(quoteId, commentaire),
    onSuccess: () => handleSuccess('Devis refusé.'),
    onError: handleError,
  });

  const modifyMut = useMutation({
    mutationFn: () => clientPortalService.requestModification(quoteId, commentaire),
    onSuccess: () => handleSuccess('Demande de modification envoyée.'),
    onError: handleError,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center">
          <Loader2 size={32} className="animate-spin text-[#0D1F3C] mb-3" />
          <p className="text-sm font-semibold text-[#0D1F3C]">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center">
          <AlertCircle size={32} className="text-red-500 mb-3" />
          <p className="text-sm font-semibold text-red-500">Erreur de chargement</p>
          <button onClick={onClose} className="mt-4 text-sm font-bold underline">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-black text-[#0D1F3C] flex items-center gap-2">
              <FileText size={20} />
              {quote.numero_devis}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-xs font-bold rounded">
                v{quote.version}
              </span>
              <StatutBadge statut={quote.statut} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:bg-[#F8FAFC] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Grid Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Dossier lié</p>
              <p className="font-semibold text-[#0D1F3C]">{quote.demande?.numero_dossier ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Montant HT</p>
              <p className="font-semibold text-[#0D1F3C]">{formatMoney(quote.montant_ht)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">TVA</p>
              <p className="font-semibold text-[#0D1F3C]">{formatMoney(quote.tva)}</p>
            </div>
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3">
              <p className="text-xs text-[#D97706] font-bold mb-1">Total TTC</p>
              <p className="font-black text-[#B45309] text-lg">{formatMoney(quote.total_ttc)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date d'envoi</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(quote.date_envoi)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date d'expiration</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(quote.date_expiration)}</p>
            </div>
          </div>

          {/* Commentaire NASHCO */}
          {quote.commentaire_nashco && (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex gap-3">
              <MessageSquare size={20} className="text-[#3B82F6] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#1D4ED8] uppercase mb-1">Message de NASHCO</p>
                <p className="text-sm text-[#1E3A8A] whitespace-pre-wrap">{quote.commentaire_nashco}</p>
              </div>
            </div>
          )}

          {/* Table Lignes */}
          {quote.lignes && quote.lignes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#0D1F3C] mb-3">Détail des prestations</h3>
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-[#64748B]">Service</th>
                      <th className="px-4 py-2 font-semibold text-[#64748B] text-center">Qté</th>
                      <th className="px-4 py-2 font-semibold text-[#64748B] text-right">Prix U. HT</th>
                      <th className="px-4 py-2 font-semibold text-[#64748B] text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {quote.lignes.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0D1F3C]">{l.service}</p>
                          {l.description && <p className="text-xs text-[#64748B] mt-0.5">{l.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-[#374151]">{l.quantite}</td>
                        <td className="px-4 py-3 text-right text-[#374151]">{formatMoney(l.prix_unitaire)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#0D1F3C]">{formatMoney(l.total_ht)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action forms */}
          {activeForm !== 'NONE' && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg space-y-3">
              <label className="block text-sm font-bold text-[#0D1F3C]">
                {activeForm === 'REJECT' ? 'Raison du refus' : 'Demande de modification'}
              </label>
              <textarea
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder={activeForm === 'REJECT' ? 'Expliquez pourquoi ce devis ne convient pas...' : 'Indiquez les changements souhaités...'}
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:border-[#3B82F6]"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setActiveForm('NONE');
                    setCommentaire('');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
                >
                  Annuler
                </button>
                <button
                  disabled={commentaire.length < 10 || rejectMut.isPending || modifyMut.isPending}
                  onClick={() => activeForm === 'REJECT' ? rejectMut.mutate() : modifyMut.mutate()}
                  className={`px-4 py-2 text-sm font-bold text-white rounded-lg flex items-center gap-2 ${
                    activeForm === 'REJECT' ? 'bg-[#EF4444] hover:bg-[#DC2626]' : 'bg-[#3B82F6] hover:bg-[#2563EB]'
                  } disabled:opacity-50`}
                >
                  {(rejectMut.isPending || modifyMut.isPending) && <Loader2 size={16} className="animate-spin" />}
                  {activeForm === 'REJECT' ? 'Confirmer le refus' : 'Envoyer la demande'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
          {quote.statut === 'ACCEPTE' && (
            <div className="w-full p-3 bg-[#ECFDF5] text-[#047857] text-sm font-bold rounded-lg text-center border border-[#A7F3D0]">
              Devis accepté — contrat en cours de génération
            </div>
          )}
          
          {quote.statut === 'REFUSE' && (
            <div className="w-full p-3 bg-[#FEF2F2] text-[#B91C1C] text-sm font-bold rounded-lg text-center border border-[#FECACA]">
              Devis refusé
            </div>
          )}

          {(quote.statut === 'ENVOYE' || quote.statut === 'EN_NEGOCIATION') && activeForm === 'NONE' && (
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setActiveForm('REJECT')}
                className="px-5 py-2.5 rounded-xl border border-[#EF4444] text-[#EF4444] text-sm font-semibold hover:bg-[#FEF2F2] transition-colors"
              >
                Refuser
              </button>
              {quote.statut === 'ENVOYE' && (
                <button
                  onClick={() => setActiveForm('MODIFY')}
                  className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] text-sm font-semibold hover:bg-white transition-colors bg-[#F1F5F9]"
                >
                  Demander une modification
                </button>
              )}
              <button
                onClick={() => acceptMut.mutate()}
                disabled={acceptMut.isPending}
                className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {acceptMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Accepter le devis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Demand Quotes List ───────────────────────────────────────────────────────

const QuotePreview = ({ demandId }: { demandId: number }) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery<{ demande: Demand }>({
    queryKey: ['client-demand-detail', demandId],
    queryFn: async () => (await clientPortalService.getDemand(demandId)).data,
  });

  if (isLoading) return <div className="py-4 text-center"><Loader2 size={20} className="animate-spin text-[#94A3B8] mx-auto" /></div>;
  if (isError || !data?.demande) return null;

  const devis = data.demande.devis || [];

  if (devis.length === 0) return (
    <p className="text-sm text-[#94A3B8] py-2">Aucun devis disponible pour ce dossier.</p>
  );

  return (
    <div className="space-y-3 mt-4">
      {devis.map(q => (
        <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0D1F3C]">{q.numero_devis}</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E2E8F0] text-[#64748B] text-[10px] font-bold rounded">
                v{q.version}
              </span>
              <StatutBadge statut={q.statut} />
            </div>
            <p className="text-sm font-black text-[#B45309]">{formatMoney(q.total_ttc)}</p>
          </div>
          <button
            onClick={() => setSelectedQuoteId(q.id)}
            className="px-4 py-2 text-sm font-semibold bg-white border border-[#E2E8F0] text-[#0D1F3C] rounded-lg hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
          >
            Voir le devis
          </button>
        </div>
      ))}

      {selectedQuoteId && (
        <QuoteDetailModal quoteId={selectedQuoteId} onClose={() => setSelectedQuoteId(null)} />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientQuotes() {
  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['client-demands-quotes'],
    queryFn: async () => (await clientPortalService.getDemands({ page: 1, per_page: 100 })).data,
  });

  const validStatuts = ['DEVIS_ENVOYE', 'EN_NEGOCIATION', 'ACCEPTE', 'REFUSE', 'MODIFICATION_DEMANDEE'];
  
  const demandsWithQuotes = (data?.data || []).filter(d => validStatuts.includes(d.statut));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-black text-[#0D1F3C]">Mes Devis</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Consultez et gérez les propositions commerciales</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#0D1F3C]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center py-20 gap-3 text-red-500">
          <AlertCircle size={32} />
          <p className="text-sm font-medium">Erreur de chargement</p>
          <button onClick={() => refetch()} className="text-xs underline font-bold">Réessayer</button>
        </div>
      ) : demandsWithQuotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-16 flex flex-col items-center text-center gap-4 text-[#94A3B8]">
          <ClipboardList size={48} className="text-[#CBD5E1]" />
          <div>
            <p className="font-bold text-[#64748B]">Aucun devis reçu pour le moment</p>
            <p className="text-sm mt-1">Vos devis apparaîtront ici une fois qu'ils auront été émis par notre équipe commerciale.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {demandsWithQuotes.map(demand => (
            <div key={demand.id} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">Dossier lié</span>
                  <h3 className="font-black text-[#0D1F3C] text-lg mt-0.5">{demand.numero_dossier}</h3>
                </div>
              </div>
              <QuotePreview demandId={demand.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
