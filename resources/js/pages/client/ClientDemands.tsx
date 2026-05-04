import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Plus, Eye, X, Check, Loader2, AlertCircle,
  ClipboardList, ArrowLeft, Trash2, Calendar, Ship,
} from 'lucide-react';
import { clientPortalService } from '@/services/clientPortal.service';
import { useToast } from '@/components/ui/Toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTS = [
  { id: 1, label: 'Port de Mostaganem' },
  { id: 2, label: 'Port d\'Oran' },
  { id: 3, label: 'Port d\'Alger' },
  { id: 4, label: 'Port d\'Annaba' },
];

const TYPES_CONTENEUR = [
  { id: 1, label: '20 pieds standard' },
  { id: 2, label: '40 pieds standard' },
  { id: 3, label: '40 pieds High Cube' },
  { id: 4, label: '20 pieds frigorifique' },
];

const PAYS_ORIGINE = [
  { id: 1, label: 'Algérie' },
  { id: 2, label: 'France' },
  { id: 3, label: 'Chine' },
  { id: 4, label: 'Espagne' },
  { id: 5, label: 'Italie' },
  { id: 6, label: 'Turquie' },
  { id: 7, label: 'Allemagne' },
];

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  EN_ETUDE:        { label: 'En étude',        color: '#3B82F6', bg: '#EFF6FF' },
  DEVIS_ENVOYE:    { label: 'Devis envoyé',    color: '#F59E0B', bg: '#FFFBEB' },
  EN_NEGOCIATION:  { label: 'En négociation',  color: '#8B5CF6', bg: '#F5F3FF' },
  ACCEPTE:         { label: 'Accepté',         color: '#10B981', bg: '#ECFDF5' },
  REFUSE:          { label: 'Refusé',          color: '#EF4444', bg: '#FEF2F2' },
  ANNULE:          { label: 'Annulé',          color: '#6B7280', bg: '#F9FAFB' },
};

const PRIORITE_CFG: Record<string, { label: string; color: string; activeBg: string }> = {
  NORMALE: { label: 'Normale', color: '#6B7280', activeBg: '#6B7280' },
  HAUTE:   { label: 'Haute',   color: '#F59E0B', activeBg: '#F59E0B' },
  URGENTE: { label: 'Urgente', color: '#EF4444', activeBg: '#EF4444' },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface LigneDemande {
  id: number;
  type_conteneur_id: number;
  quantite: number;
  description?: string;
  typeConteneur?: { libelle: string };
}

interface Demand {
  id: number;
  numero_dossier: string;
  port_origine: { id: number; nom_port: string } | null;
  port_destination: { id: number; nom_port: string } | null;
  type_achat: string;
  priorite: string;
  statut: string;
  date_livraison_souhaitee: string;
  notes_client?: string;
  lignes: LigneDemande[];
  created_at: string;
}

interface PaginatedResponse {
  data: Demand[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

interface LigneForm {
  id: string; // for React key
  type_conteneur_id: number | '';
  pays_origine_id: number | '';
  quantite: number | '';
  description: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Drawer ───────────────────────────────────────────────────────────────────

const DemandDrawer = ({
  demand, onClose,
}: { demand: Demand; onClose: () => void }) => {
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
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Port origine</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.port_origine?.nom_port ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Port destination</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.port_destination?.nom_port ?? '—'}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Type achat</p>
              <p className="font-semibold text-[#0D1F3C]">{demand.type_achat}</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Priorité</p>
              <p className="font-semibold" style={{ color: PRIORITE_CFG[demand.priorite]?.color }}>
                {PRIORITE_CFG[demand.priorite]?.label ?? demand.priorite}
              </p>
            </div>
            <div className="bg-[#F8FAFC] rounded-lg p-3 col-span-2">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Livraison souhaitée</p>
              <p className="font-semibold text-[#0D1F3C]">{formatDate(demand.date_livraison_souhaitee)}</p>
            </div>
          </div>

          {/* Lignes */}
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3C] mb-3">Conteneurs demandés</h3>
            <div className="space-y-2">
              {demand.lignes?.map((l) => (
                <div key={l.id} className="p-3 border border-[#E2E8F0] rounded-xl text-sm">
                  <div className="flex justify-between font-semibold text-[#0D1F3C] mb-1">
                    <span>{l.typeConteneur?.libelle ?? `Type ID: ${l.type_conteneur_id}`}</span>
                    <span>x{l.quantite}</span>
                  </div>
                  {l.description && <p className="text-xs text-[#6B7280]">{l.description}</p>}
                </div>
              ))}
              {(!demand.lignes || demand.lignes.length === 0) && (
                <p className="text-sm text-[#94A3B8]">Aucune ligne associée.</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {demand.notes_client && (
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <p className="text-xs text-[#94A3B8] font-medium mb-1">Notes complémentaires</p>
              <p className="text-sm text-[#374151] whitespace-pre-wrap">{demand.notes_client}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Form ─────────────────────────────────────────────────────────────────────

const DemandForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [portOrigineId, setPortOrigineId] = useState<number | ''>('');
  const [portDestinationId, setPortDestinationId] = useState<number | ''>('');
  const [typeAchat, setTypeAchat] = useState<'FOB' | 'CIF' | 'EXW' | 'DAP'>('FOB');
  const [priorite, setPriorite] = useState<'NORMALE' | 'HAUTE' | 'URGENTE'>('NORMALE');
  const [dateLivraison, setDateLivraison] = useState('');
  const [notesClient, setNotesClient] = useState('');

  const [lignes, setLignes] = useState<LigneForm[]>([
    { id: 'initial', type_conteneur_id: '', pays_origine_id: '', quantite: 1, description: '' }
  ]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const updateLigne = (id: string, field: keyof LigneForm, value: any) => {
    setLignes(lignes.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const addLigne = () => {
    setLignes([...lignes, { id: Math.random().toString(), type_conteneur_id: '', pays_origine_id: '', quantite: 1, description: '' }]);
  };

  const removeLigne = (id: string) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter(l => l.id !== id));
    }
  };

  const isLignesValid = lignes.every(l => l.type_conteneur_id !== '' && l.pays_origine_id !== '' && Number(l.quantite) >= 1);
  const isValid = 
    portOrigineId !== '' && 
    portDestinationId !== '' && 
    portOrigineId !== portDestinationId && 
    dateLivraison !== '' && 
    dateLivraison >= minDateStr && 
    isLignesValid;

  const createMut = useMutation({
    mutationFn: () => clientPortalService.createDemand({
      port_origine_id: Number(portOrigineId),
      port_destination_id: Number(portDestinationId),
      type_achat: typeAchat,
      priorite: priorite,
      date_livraison_souhaitee: dateLivraison,
      notes_client: notesClient || undefined,
      lignes: lignes.map(l => ({
        type_conteneur_id: Number(l.type_conteneur_id),
        pays_origine_id: Number(l.pays_origine_id),
        quantite: Number(l.quantite),
        description: l.description || undefined,
      }))
    }),
    onSuccess: () => {
      toast('success', 'Demande soumise', 'Notre équipe vous contactera sous 48h.');
      qc.invalidateQueries({ queryKey: ['client-demands'] });
      navigate('/client/demands');
    },
    onError: (e: any) => {
      toast('error', 'Erreur', e?.response?.data?.message || 'Une erreur est survenue');
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/client/demands')}
          className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Nouvelle demande</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Saisissez les détails de votre demande d'import</p>
        </div>
      </div>

      {/* Section 1 */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-[#0D1F3C] flex items-center gap-2">
          <Ship size={18} /> Informations de transport
        </h2>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Port d'origine <span className="text-red-500">*</span>
            </label>
            <select
              value={portOrigineId}
              onChange={(e) => setPortOrigineId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            >
              <option value="">Sélectionner un port</option>
              {PORTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Port de destination <span className="text-red-500">*</span>
            </label>
            <select
              value={portDestinationId}
              onChange={(e) => setPortDestinationId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            >
              <option value="">Sélectionner un port</option>
              {PORTS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            {portOrigineId !== '' && portOrigineId === portDestinationId && (
              <p className="text-xs text-red-500">Doit être différent de l'origine</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Type d'achat <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {['FOB', 'CIF', 'EXW', 'DAP'].map(t => (
                <button
                  key={t}
                  onClick={() => setTypeAchat(t as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    typeAchat === t ? 'bg-[#0D1F3C] text-white' : 'border border-[#E2E8F0] text-[#374151] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Livraison souhaitée <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={minDateStr}
              value={dateLivraison}
              onChange={(e) => setDateLivraison(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-[#0D1F3C]">Priorité & Informations complémentaires</h2>
        
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Priorité <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {Object.entries(PRIORITE_CFG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setPriorite(key as any)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border"
                style={{
                  background: priorite === key ? cfg.activeBg : 'white',
                  color: priorite === key ? 'white' : '#374151',
                  borderColor: priorite === key ? cfg.activeBg : '#E2E8F0'
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            Notes client
          </label>
          <textarea
            value={notesClient}
            onChange={(e) => setNotesClient(e.target.value)}
            placeholder="Informations additionnelles..."
            rows={3}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white resize-none"
          />
        </div>
      </div>

      {/* Section 3 */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="text-base font-bold text-[#0D1F3C]">Conteneurs demandés</h2>
        
        <div className="space-y-4">
          {lignes.map((ligne, index) => (
            <div key={ligne.id} className="p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] space-y-4 relative">
              {lignes.length > 1 && (
                <button
                  onClick={() => removeLigne(ligne.id)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <h3 className="text-xs font-bold text-[#64748B] uppercase">Ligne {index + 1}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Type conteneur <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ligne.type_conteneur_id}
                    onChange={(e) => updateLigne(ligne.id, 'type_conteneur_id', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
                  >
                    <option value="">Sélectionner...</option>
                    {TYPES_CONTENEUR.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Pays d'origine <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={ligne.pays_origine_id}
                    onChange={(e) => updateLigne(ligne.id, 'pays_origine_id', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
                  >
                    <option value="">Sélectionner...</option>
                    {PAYS_ORIGINE.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Quantité <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={ligne.quantite}
                    onChange={(e) => updateLigne(ligne.id, 'quantite', e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Description
                  </label>
                  <input
                    type="text"
                    value={ligne.description}
                    onChange={(e) => updateLigne(ligne.id, 'description', e.target.value)}
                    placeholder="Contenu..."
                    className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addLigne}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#3B82F6] hover:bg-[#EFF6FF] rounded-lg transition-colors border border-transparent hover:border-[#BFDBFE]"
          >
            <Plus size={16} /> Ajouter une ligne
          </button>
        </div>
      </div>

      {/* Footer sticky */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-[#E2E8F0] p-4 flex justify-end gap-3 z-40">
        <button
          onClick={() => navigate('/client/demands')}
          className="px-5 py-2.5 rounded-lg border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending || !isValid}
          className="px-5 py-2.5 rounded-xl bg-[#0D1F3C] text-white text-sm font-semibold hover:bg-[#1A4A8C] disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {createMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Soumettre la demande
        </button>
      </div>
    </div>
  );
};

// ─── List ─────────────────────────────────────────────────────────────────────

const DemandsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse>({
    queryKey: ['client-demands', page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      return (await clientPortalService.getDemands(params)).data;
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return data?.data ?? [];
    const q = search.toLowerCase();
    return (data?.data ?? []).filter(
      (d) => d.numero_dossier.toLowerCase().includes(q)
    );
  }, [data?.data, search]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Mes demandes d'import</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {data?.total ?? 0} demande{(data?.total ?? 0) > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={() => navigate('/client/demands/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nouvelle demande
        </button>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher n° dossier..."
          className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
        />
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
                  {['N° Dossier', 'Port origine', 'Port destination', 'Type', 'Priorité', 'Livraison', 'Statut', ''].map((h) => (
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
                    <td className="px-4 py-3 text-[#374151]">{d.port_origine?.nom_port ?? '—'}</td>
                    <td className="px-4 py-3 text-[#374151]">{d.port_destination?.nom_port ?? '—'}</td>
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
                        {formatDate(d.date_livraison_souhaitee)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={d.statut} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedDemand(d)}
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
      {selectedDemand && (
        <DemandDrawer
          demand={selectedDemand}
          onClose={() => setSelectedDemand(null)}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientDemands() {
  const location = useLocation();
  const isForm = location.pathname.includes('/new');

  return isForm ? <DemandForm /> : <DemandsList />;
}
