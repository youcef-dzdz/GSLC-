import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Eye, Download, X, Loader2, AlertCircle, Receipt, CreditCard, Check } from 'lucide-react';
import { clientPortalService } from '@/services/clientPortal.service';
import { useToast } from '@/components/ui/Toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  BROUILLON:           { label: 'Brouillon',   color: '#6B7280', bg: '#F9FAFB' },
  EMISE:               { label: 'Émise',       color: '#3B82F6', bg: '#EFF6FF' },
  PARTIELLEMENT_PAYEE: { label: 'Partielle',   color: '#F59E0B', bg: '#FFFBEB' },
  PAYEE:               { label: 'Payée',       color: '#10B981', bg: '#ECFDF5' },
  EN_RETARD:           { label: 'En retard',   color: '#EF4444', bg: '#FEF2F2' },
  ANNULEE:             { label: 'Annulée',     color: '#6B7280', bg: '#F9FAFB' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: number;
  numero_facture: string;
  statut: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  montant_restant: number;
  date_emission: string;
  date_echeance: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Invoice[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
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

const InvoiceDetailModal = ({
  invoice, onClose,
}: { invoice: Invoice; onClose: () => void }) => {
  const { toast } = useToast();

  const paid = invoice.montant_ttc - invoice.montant_restant;
  const progressPercent = invoice.montant_ttc > 0 ? Math.min(100, Math.max(0, (paid / invoice.montant_ttc) * 100)) : 0;
  
  let progressColor = '#3B82F6'; // Default blue
  if (invoice.statut === 'PAYEE') progressColor = '#10B981';
  else if (invoice.statut === 'PARTIELLEMENT_PAYEE') progressColor = '#F59E0B';
  else if (invoice.statut === 'EN_RETARD') progressColor = '#EF4444';

  const downloadMut = useMutation({
    mutationFn: () => clientPortalService.downloadInvoice(invoice.id),
    onSuccess: () => {
      toast('info', 'Information', 'Fonctionnalité PDF disponible prochainement. Contactez votre commercial.');
    },
    onError: () => {
      toast('error', 'Erreur', 'Impossible de récupérer la facture.');
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-lg font-black text-[#0D1F3C] flex items-center gap-2">
              <Receipt size={20} className="text-[#3B82F6]" />
              {invoice.numero_facture}
            </h2>
            <StatutBadge statut={invoice.statut} />
          </div>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:bg-[#F8FAFC] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date émission</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(invoice.date_emission)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Date échéance</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(invoice.date_echeance)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Montant HT</p>
              <p className="font-semibold text-[#0D1F3C]">{formatMoney(invoice.montant_ht)}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">TVA</p>
              <p className="font-semibold text-[#0D1F3C]">{formatMoney(invoice.tva)}</p>
            </div>
            <div className="bg-[#EFF6FF] rounded-xl p-3 border border-[#BFDBFE]">
              <p className="text-xs text-[#1E3A8A] font-bold mb-1">Total TTC</p>
              <p className="font-black text-[#1D4ED8] text-lg">{formatMoney(invoice.montant_ttc)}</p>
            </div>
            <div className="bg-[#FEF2F2] rounded-xl p-3 border border-[#FECACA]">
              <p className="text-xs text-[#991B1B] font-bold mb-1">Montant restant</p>
              <p className="font-black text-[#B91C1C] text-lg">{formatMoney(invoice.montant_restant)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide">État du paiement</span>
              <span className="text-sm font-semibold text-[#0D1F3C]">
                {formatMoney(paid)} payé sur {formatMoney(invoice.montant_ttc)}
              </span>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>

          {/* PDF Section */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-lg flex items-center justify-center shrink-0">
                <Download size={20} className="text-[#64748B]" />
              </div>
              <div>
                <p className="font-bold text-[#0D1F3C] text-sm">Téléchargement PDF</p>
                <p className="text-xs text-[#64748B]">Obtenir une copie officielle de cette facture</p>
              </div>
            </div>
            <button
              onClick={() => downloadMut.mutate()}
              disabled={downloadMut.isPending}
              className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#0D1F3C] hover:bg-[#F1F5F9] text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {downloadMut.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Télécharger'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── List ─────────────────────────────────────────────────────────────────────

export default function ClientInvoices() {
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['client-invoices', page],
    queryFn: async () => {
      const response = await clientPortalService.getInvoices();
      // Handle both paginated and flat array structures defensively
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length, per_page: 100, current_page: 1, last_page: 1 };
      }
      return response.data;
    },
  });

  const invoices = data?.data || [];

  // Computed KPIs
  const totalFacture = invoices.reduce((sum, inv) => sum + inv.montant_ttc, 0);
  const totalRestant = invoices.reduce((sum, inv) => sum + inv.montant_restant, 0);
  const totalPaye = totalFacture - totalRestant;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0D1F3C]">Mes Factures</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Consultez et suivez vos paiements</p>
      </div>

      {/* Summary KPI Bar */}
      {!isLoading && !isError && invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Receipt size={24} className="text-[#3B82F6]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Total facturé</p>
              <p className="font-black text-[#0D1F3C] text-lg">{formatMoney(totalFacture)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <Check size={24} className="text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Total payé</p>
              <p className="font-black text-[#10B981] text-lg">{formatMoney(totalPaye)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-[#EF4444]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wide">Total restant dû</p>
              <p className="font-black text-[#EF4444] text-lg">{formatMoney(totalRestant)}</p>
            </div>
          </div>
        </div>
      )}

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
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4 text-[#94A3B8]">
            <Receipt size={48} className="text-[#CBD5E1]" />
            <div className="text-center">
              <p className="font-bold text-[#64748B]">Aucune facture pour le moment</p>
              <p className="text-sm mt-1">Vos factures apparaîtront ici dès qu'elles seront émises.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  {['N° Facture', 'Statut', 'Montant TTC', 'Restant', 'Émise le', 'Échéance', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold text-[#64748B] text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {invoices.map(inv => {
                  const isRetard = inv.statut === 'EN_RETARD';
                  const isPayee = inv.statut === 'PAYEE';
                  
                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        isRetard ? 'border-l-4 border-l-red-400 bg-red-50/30' : 
                        isPayee ? 'border-l-4 border-l-green-400' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-black text-[#0D1F3C] font-mono text-xs">{inv.numero_facture}</span>
                      </td>
                      <td className="px-4 py-3"><StatutBadge statut={inv.statut} /></td>
                      <td className="px-4 py-3 font-bold text-[#0D1F3C]">{formatMoney(inv.montant_ttc)}</td>
                      <td className="px-4 py-3 font-bold text-[#EF4444]">{formatMoney(inv.montant_restant)}</td>
                      <td className="px-4 py-3 text-[#64748B]">{formatDate(inv.date_emission)}</td>
                      <td className={`px-4 py-3 font-medium ${isRetard ? 'text-[#EF4444]' : 'text-[#64748B]'}`}>
                        {formatDate(inv.date_echeance)}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-[#3B82F6] transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
                          title="Télécharger PDF"
                        >
                          <Download size={16} />
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

      {/* Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}
