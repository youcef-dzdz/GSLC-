import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Check, Loader2, AlertCircle, FileText, Eye, PenLine, Shield, Info } from 'lucide-react';
import { clientPortalService } from '@/services/clientPortal.service';
import { useToast } from '@/components/ui/Toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  EN_ATTENTE_SIGNATURE:             { label: 'À signer',          color: '#F59E0B', bg: '#FFFBEB' },
  EN_ATTENTE_CAUTION:               { label: 'Attente caution',   color: '#3B82F6', bg: '#EFF6FF' },
  EN_ATTENTE_ACTIVATION:            { label: 'Attente activation',color: '#8B5CF6', bg: '#F5F3FF' },
  EN_ATTENTE_APPROBATION_DIRECTEUR: { label: 'Attente directeur', color: '#6366F1', bg: '#EEF2FF' },
  ACTIF:                            { label: 'Actif',             color: '#10B981', bg: '#ECFDF5' },
  EXPIRE:                           { label: 'Expiré',            color: '#EF4444', bg: '#FEF2F2' },
  RESILIE:                          { label: 'Résilié',           color: '#6B7280', bg: '#F9FAFB' },
};

const STATUT_CAUTION_CFG: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#F59E0B' },
  RECU:       { label: 'Reçu',       color: '#10B981' },
  RESTITUE:   { label: 'Restitué',   color: '#6B7280' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContractLine {
  id: number;
  service: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  total_ht: number;
  franchise_jours: number;
}

interface Contract {
  id: number;
  numero_contrat: string;
  statut: string;
  statut_caution: string;
  date_debut: string;
  date_fin: string;
  montant_caution: number;
  lignes?: ContractLine[];
  created_at: string;
}

interface PaginatedResponse {
  data: Contract[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

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

// ─── Signature Modal ──────────────────────────────────────────────────────────

const SignatureModal = ({
  contract, onClose,
}: { contract: Contract; onClose: () => void }) => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [otp, setOtp] = useState('');
  const [conditionsAccepted, setConditionsAccepted] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const signMut = useMutation({
    mutationFn: () => clientPortalService.submitSignature(contract.id, otp),
    onSuccess: () => {
      toast('success', 'Contrat signé', 'Veuillez déposer votre chèque de caution.');
      qc.invalidateQueries({ queryKey: ['client-contracts'] });
      onClose();
    },
    onError: (e: any) => {
      toast('error', 'Erreur', e?.response?.data?.message || 'Code OTP invalide ou expiré');
    }
  });

  const isSubmitDisabled = otp.length !== 6 || !conditionsAccepted || signMut.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-black text-[#0D1F3C] flex items-center gap-2">
            <Shield size={20} className="text-[#3B82F6]" />
            Signature électronique
          </h2>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:bg-[#F8FAFC] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Banner */}
          <div className="bg-[#EFF6FF] text-[#1E3A8A] p-4 rounded-xl flex gap-3 text-sm">
            <Info size={20} className="text-[#3B82F6] shrink-0" />
            <p>Un code OTP à 6 chiffres a été envoyé par notification lors de la génération du contrat.</p>
          </div>

          {/* Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] flex justify-between items-center">
            <div>
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider mb-0.5">Contrat</p>
              <p className="font-black text-[#0D1F3C]">{contract.numero_contrat}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider mb-0.5">Montant Caution</p>
              <p className="font-bold text-[#F59E0B]">{formatMoney(contract.montant_caution)}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#0D1F3C] mb-2 text-center">
                Code OTP reçu par notification
              </label>
              <input
                ref={inputRef}
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full border-2 border-[#E2E8F0] focus:border-[#0D1F3C] focus:outline-none rounded-xl px-4 py-3 text-center text-3xl font-mono tracking-[0.5em] text-[#0D1F3C] font-black transition-colors"
              />
            </div>

            <div className="flex items-start gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <input
                type="checkbox"
                id="conditions"
                checked={conditionsAccepted}
                onChange={(e) => setConditionsAccepted(e.target.checked)}
                className="mt-1 shrink-0 w-4 h-4 text-[#0D1F3C] rounded border-[#E2E8F0] focus:ring-[#0D1F3C]"
              />
              <label htmlFor="conditions" className="text-sm text-[#475569] leading-snug cursor-pointer">
                J'accepte les conditions générales du contrat et m'engage à respecter ses termes.
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-[#FFFBEB] text-[#D97706] p-4 rounded-xl text-xs font-semibold text-center border border-[#FDE68A]">
            Ce code expire dans 10 minutes. Contactez votre commercial si vous ne l'avez pas reçu.
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-white rounded-xl border border-transparent hover:border-[#E2E8F0] transition-colors"
          >
            Annuler
          </button>
          <button
            disabled={isSubmitDisabled}
            onClick={() => signMut.mutate()}
            className="px-6 py-2.5 bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {signMut.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Signer le contrat'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Drawer ───────────────────────────────────────────────────────────────────

const ContractDetailDrawer = ({
  contract, onClose, onSignClick,
}: { contract: Contract; onClose: () => void; onSignClick: (c: Contract) => void }) => {
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
        <div className="p-5 space-y-6 flex-1">
          {/* Status block */}
          <div className="flex items-center justify-between">
            <StatutBadge statut={contract.statut} />
            {contract.statut === 'EN_ATTENTE_SIGNATURE' && (
              <button
                onClick={() => onSignClick(contract)}
                className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <PenLine size={14} />
                Signer ce contrat
              </button>
            )}
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date début</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(contract.date_debut)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date fin</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(contract.date_fin)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Statut caution</p>
              <p className="font-semibold" style={{ color: STATUT_CAUTION_CFG[contract.statut_caution]?.color || '#6B7280' }}>
                {STATUT_CAUTION_CFG[contract.statut_caution]?.label || contract.statut_caution}
              </p>
            </div>
            <div className="bg-[#FFFBEB] rounded-xl p-3 border border-[#FDE68A]">
              <p className="text-xs text-[#D97706] font-medium mb-1">Montant caution</p>
              <p className="font-black text-[#B45309]">{formatMoney(contract.montant_caution)}</p>
            </div>
          </div>

          {/* Lignes */}
          {contract.lignes && contract.lignes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#0D1F3C] mb-3">Prestations contractuelles</h3>
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-[#64748B]">Service</th>
                      <th className="px-3 py-2 font-semibold text-[#64748B] text-center">Qté</th>
                      <th className="px-3 py-2 font-semibold text-[#64748B] text-right">Franchise</th>
                      <th className="px-3 py-2 font-semibold text-[#64748B] text-right">Prix U. HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {contract.lignes.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC]">
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-[#0D1F3C]">{l.service}</p>
                          {l.description && <p className="text-[10px] text-[#64748B] mt-0.5">{l.description}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-center text-[#374151] font-medium">{l.quantite}</td>
                        <td className="px-3 py-2.5 text-right text-[#374151] font-medium">{l.franchise_jours} j</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#0D1F3C]">{formatMoney(l.prix_unitaire)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── List ─────────────────────────────────────────────────────────────────────

export default function ClientContracts() {
  const [page, setPage] = useState(1);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [signingContract, setSigningContract] = useState<Contract | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['client-contracts', page],
    queryFn: async () => {
      const response = await clientPortalService.getContracts();
      // The API might return PaginatedResponse directly, but service wraps in {data: ...}
      // Assuming getContracts() returns axios response where r.data is PaginatedResponse
      return response.data;
    },
  });

  const contracts = data?.data || [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0D1F3C]">Mes Contrats</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Consultez et signez vos contrats logistiques</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#0D1F3C]" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center py-16 gap-3 text-red-500">
            <AlertCircle size={28} />
            <p className="text-sm font-medium">Erreur de chargement</p>
            <button onClick={() => refetch()} className="text-xs font-bold underline">Réessayer</button>
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-[#94A3B8]">
            <FileText size={48} className="text-[#CBD5E1]" />
            <div className="text-center">
              <p className="font-bold text-[#64748B]">Aucun contrat pour le moment</p>
              <p className="text-sm mt-1">Vos contrats apparaîtront ici après validation des devis.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  {['N° Contrat', 'Statut', 'Caution', 'Statut caution', 'Début', 'Fin', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {contracts.map(c => {
                  const isSignatureRow = c.statut === 'EN_ATTENTE_SIGNATURE';
                  const isActiveRow = c.statut === 'ACTIF';
                  
                  return (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isSignatureRow ? 'border-l-4 border-l-amber-400' : 
                        isActiveRow ? 'border-l-4 border-l-green-400' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-black text-[#0D1F3C] font-mono text-xs">{c.numero_contrat}</span>
                      </td>
                      <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                      <td className="px-4 py-3 font-bold text-[#374151]">{formatMoney(c.montant_caution)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold" style={{ color: STATUT_CAUTION_CFG[c.statut_caution]?.color || '#6B7280' }}>
                          {STATUT_CAUTION_CFG[c.statut_caution]?.label || c.statut_caution}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">{formatDate(c.date_debut)}</td>
                      <td className="px-4 py-3 text-[#64748B]">{formatDate(c.date_fin)}</td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedContract(c)}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#3B82F6] transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        {isSignatureRow && (
                          <button
                            onClick={() => setSigningContract(c)}
                            className="px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <PenLine size={12} />
                            Signer
                          </button>
                        )}
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#F1F5F9] text-xs text-[#6B7280] bg-[#F8FAFC]">
            <span className="font-medium">Page {data?.current_page} / {data?.last_page}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 font-bold transition-colors"
              >
                ← Préc.
              </button>
              <button
                disabled={page >= (data?.last_page ?? 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] disabled:opacity-40 font-bold transition-colors"
              >
                Suiv. →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selectedContract && (
        <ContractDetailDrawer
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onSignClick={(c) => {
            setSelectedContract(null);
            setSigningContract(c);
          }}
        />
      )}

      {/* Signature Modal */}
      {signingContract && (
        <SignatureModal
          contract={signingContract}
          onClose={() => setSigningContract(null)}
        />
      )}
    </div>
  );
}
