import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Search, Plus, Edit2, X, Check, Loader2, AlertCircle,
  Building2, Mail, Phone, MapPin, Globe,
} from 'lucide-react';
import { commercialService } from '@/services/commercial.service';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  raison_sociale: string;
  nif: string | null;
  type_client: string | null;
  email_contact: string | null;
  telephone: string | null;
  ville: string | null;
  pays: { nom_pays: string } | null;
  statut: string;
  created_at: string;
}

interface ClientForm {
  raison_sociale: string;
  nif: string;
  type_client: string;
  email_contact: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays_id: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIF:                  { label: 'Actif',           color: '#10B981', bg: '#ECFDF5' },
  INACTIF:                { label: 'Inactif',         color: '#6B7280', bg: '#F9FAFB' },
  SUSPENDU:               { label: 'Suspendu',        color: '#EF4444', bg: '#FEF2F2' },
  EN_ATTENTE_VALIDATION:  { label: 'En attente',      color: '#F59E0B', bg: '#FFFBEB' },
};

const EMPTY_FORM: ClientForm = {
  raison_sociale: '', nif: '', type_client: 'IMPO', email_contact: '',
  telephone: '', adresse: '', ville: '', pays_id: '',
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const ClientModal = ({
  client, onClose,
}: { client: Client | null; onClose: () => void }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!client;

  const [form, setForm] = useState<ClientForm>(
    isEdit
      ? {
          raison_sociale: client.raison_sociale,
          nif: client.nif ?? '',
          type_client: client.type_client ?? 'IMPO',
          email_contact: client.email_contact ?? '',
          telephone: client.telephone ?? '',
          adresse: '',
          ville: client.ville ?? '',
          pays_id: '',
        }
      : EMPTY_FORM
  );

  const { data: paysData } = useQuery({
    queryKey: ['pays'],
    queryFn: async () => (await commercialService.getPays()).data,
  });

  const set = (k: keyof ClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveMut = useMutation({
    mutationFn: () =>
      isEdit
        ? commercialService.updateClient(client!.id, form as unknown as Record<string, unknown>)
        : commercialService.createClient(form as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast('success', isEdit ? 'Client mis à jour' : 'Client créé', form.raison_sociale);
      qc.invalidateQueries({ queryKey: ['commercial-clients'] });
      onClose();
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? 'Une erreur est survenue';
      toast('error', 'Erreur', msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.raison_sociale.trim()) return;
    saveMut.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-black text-[#0D1F3C]">
            {isEdit ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Raison sociale */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Raison sociale <span className="text-red-500">*</span>
            </label>
            <input
              value={form.raison_sociale}
              onChange={set('raison_sociale')}
              required
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
              placeholder="SARL Example..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* NIF */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">NIF</label>
              <input
                value={form.nif}
                onChange={set('nif')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
                placeholder="123456789..."
              />
            </div>
            {/* Type client */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Type</label>
              <select
                value={form.type_client}
                onChange={set('type_client')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
              >
                <option value="IMPO">Importateur</option>
                <option value="EXPO">Exportateur</option>
                <option value="FREIGHT">Freight Forwarder</option>
                <option value="TRANSITAIRE">Transitaire</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email_contact}
                onChange={set('email_contact')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
                placeholder="contact@example.com"
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Téléphone</label>
              <input
                value={form.telephone}
                onChange={set('telephone')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
                placeholder="+213..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Ville */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Ville</label>
              <input
                value={form.ville}
                onChange={set('ville')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
                placeholder="Alger..."
              />
            </div>
            {/* Pays */}
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1.5">Pays</label>
              <select
                value={form.pays_id}
                onChange={set('pays_id')}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
              >
                <option value="">Sélectionner...</option>
                {(paysData ?? []).map((p: { id: number; nom_pays: string }) => (
                  <option key={p.id} value={p.id}>{p.nom_pays}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">Adresse</label>
            <input
              value={form.adresse}
              onChange={set('adresse')}
              className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"
              placeholder="Rue, quartier..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#374151] hover:bg-[#F8FAFC] transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saveMut.isPending || !form.raison_sociale.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {saveMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isEdit ? 'Sauvegarder' : 'Créer le client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialClients() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const [search, setSearch] = useState('');
  const [modalClient, setModalClient] = useState<Client | null | 'new'>('new' as any);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Client | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ data: Client[] }>({
    queryKey: ['commercial-clients'],
    queryFn: async () => (await commercialService.getClients()).data,
  });

  const filtered = useMemo(() => {
    const list = data?.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.raison_sociale.toLowerCase().includes(q) ||
        (c.email_contact ?? '').toLowerCase().includes(q) ||
        (c.ville ?? '').toLowerCase().includes(q)
    );
  }, [data?.data, search]);

  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Clients</h1>
          <p className="text-sm text-[#94A3B8] mt-1">{filtered.length} client{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
        />
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] h-40 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">
          <AlertCircle size={18} />
          <span className="text-sm">Erreur de chargement. <button onClick={() => refetch()} className="underline font-semibold">Réessayer</button></span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-[#CBD5E1]">
          <Building2 size={36} />
          <p className="text-sm">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const statut = STATUT_CFG[c.statut] ?? { label: c.statut, color: '#6B7280', bg: '#F3F4F6' };
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                      <Building2 size={18} className="text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0D1F3C] text-sm leading-tight">{c.raison_sociale}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{c.type_client ?? '—'}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: statut.bg, color: statut.color }}
                  >
                    {statut.label}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-[#6B7280]">
                  {c.email_contact && (
                    <div className="flex items-center gap-2">
                      <Mail size={11} className="text-[#CBD5E1] flex-shrink-0" />
                      <span className="truncate">{c.email_contact}</span>
                    </div>
                  )}
                  {c.telephone && (
                    <div className="flex items-center gap-2">
                      <Phone size={11} className="text-[#CBD5E1] flex-shrink-0" />
                      <span>{c.telephone}</span>
                    </div>
                  )}
                  {c.ville && (
                    <div className="flex items-center gap-2">
                      <MapPin size={11} className="text-[#CBD5E1] flex-shrink-0" />
                      <span>{c.ville}{c.pays ? `, ${c.pays.nom_pays}` : ''}</span>
                    </div>
                  )}
                  {c.nif && (
                    <div className="flex items-center gap-2">
                      <Globe size={11} className="text-[#CBD5E1] flex-shrink-0" />
                      <span className="font-mono">NIF : {c.nif}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-end">
                  <button
                    onClick={() => { setEditTarget(c); setShowModal(true); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1A4A8C] hover:text-[#0D1F3C] transition-colors"
                  >
                    <Edit2 size={12} />
                    Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ClientModal
          client={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
