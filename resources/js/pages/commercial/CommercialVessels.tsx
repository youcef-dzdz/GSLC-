import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Check, Loader2, AlertCircle, Ship, ArrowLeft } from 'lucide-react';
import { commercialService } from '@/services/commercial.service';
import { apiClient } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pays {
  id: number;
  nom: string;
}

interface Vessel {
  id: number;
  nom_navire: string;
  numero_imo: string;
  pays: Pays | null;
  compagnie_maritime: string;
  capacite_teu: number;
  annee_construction: number | null;
  actif: boolean;
}

// ─── Statut Badge ─────────────────────────────────────────────────────────────

const StatutBadge = ({ actif }: { actif: boolean }) =>
  actif ? (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: '#ECFDF5', color: '#10B981' }}
    >
      Actif
    </span>
  ) : (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: '#F9FAFB', color: '#6B7280' }}
    >
      Inactif
    </span>
  );

// ─── Vessels List ─────────────────────────────────────────────────────────────

const VesselsList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actifFilter, setActifFilter] = useState<'all' | 'actif' | 'inactif'>('all');

  const { data, isLoading, isError, refetch } = useQuery<{ data: Vessel[] }>({
    queryKey: ['commercial-vessels'],
    queryFn: async () => (await commercialService.getVessels()).data,
  });

  const vessels: Vessel[] = data?.data ?? (Array.isArray(data) ? (data as Vessel[]) : []);

  const filtered = vessels.filter((v) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      v.nom_navire.toLowerCase().includes(q) ||
      v.numero_imo.toLowerCase().includes(q) ||
      v.compagnie_maritime.toLowerCase().includes(q);
    const matchActif =
      actifFilter === 'all' ||
      (actifFilter === 'actif' && v.actif) ||
      (actifFilter === 'inactif' && !v.actif);
    return matchSearch && matchActif;
  });

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Navires</h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            {vessels.length} navire{vessels.length > 1 ? 's' : ''} enregistré{vessels.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/commercial/vessels/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1F3C] hover:bg-[#1A4A8C] text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nouveau navire
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher nom, IMO, compagnie..."
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
          />
        </div>

        <select
          value={actifFilter}
          onChange={(e) => setActifFilter(e.target.value as 'all' | 'actif' | 'inactif')}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
        >
          <option value="all">Tous</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
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
            <Ship size={32} />
            <p className="text-sm">Aucun navire trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {['Nom navire', 'N° IMO', 'Pavillon', 'Compagnie', 'Capacité TEU', 'Année', 'Statut'].map((h) => (
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
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                          <Ship size={13} className="text-[#3B82F6]" />
                        </div>
                        <span className="font-semibold text-[#0D1F3C]">{v.nom_navire}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">
                        {v.numero_imo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#374151]">
                      {v.pays?.nom ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#374151] font-medium">
                      {v.compagnie_maritime}
                    </td>
                    <td className="px-4 py-3 text-[#374151]">
                      {v.capacite_teu.toLocaleString('fr-DZ')} TEU
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      {v.annee_construction ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge actif={v.actif} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Vessel Form ──────────────────────────────────────────────────────────────

const VesselForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nomNavire,          setNomNavire]          = useState('');
  const [numeroImo,          setNumeroImo]          = useState('');
  const [paysId,             setPaysId]             = useState<number | ''>('');
  const [compagnie,          setCompagnie]          = useState('');
  const [capaciteTeu,        setCapaciteTeu]        = useState<number | ''>('');
  const [anneeConstruction,  setAnneeConstruction]  = useState<number | ''>('');

  const { data: paysData, isLoading: paysLoading } = useQuery<{ data: Pays[] } | Pays[]>({
    queryKey: ['pays'],
    queryFn: async () => (await commercialService.getPays()).data,
  });

  const paysList: Pays[] = Array.isArray(paysData)
    ? paysData
    : (paysData as { data: Pays[] })?.data ?? [];

  const createMut = useMutation({
    mutationFn: () =>
      apiClient.post('/api/commercial/vessels', {
        nom_navire:          nomNavire,
        numero_imo:          numeroImo,
        pays_id:             Number(paysId),
        compagnie_maritime:  compagnie,
        capacite_teu:        Number(capaciteTeu),
        annee_construction:  anneeConstruction !== '' ? Number(anneeConstruction) : null,
      }),
    onSuccess: () => {
      toast('success', 'Navire enregistré', 'Le navire a été enregistré avec succès.');
      navigate('/commercial/vessels');
    },
    onError: (e: any) => {
      toast('error', 'Erreur', e?.response?.data?.message ?? 'Une erreur est survenue');
    },
  });

  const isValid =
    nomNavire.trim() !== '' &&
    numeroImo.trim() !== '' &&
    paysId !== '' &&
    compagnie.trim() !== '' &&
    Number(capaciteTeu) >= 1;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      {/* Back + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/commercial/vessels')}
          className="p-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">Nouveau navire</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Enregistrer un nouveau navire dans la flotte</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 space-y-5">

        {/* Row 1: nom + IMO */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Nom du navire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nomNavire}
              onChange={(e) => setNomNavire(e.target.value)}
              placeholder="Ex : MSC Allegria"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              N° IMO <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={numeroImo}
              onChange={(e) => setNumeroImo(e.target.value)}
              placeholder="Ex : IMO9299724"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white font-mono"
            />
          </div>
        </div>

        {/* Row 2: pays + compagnie */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Pavillon (pays) <span className="text-red-500">*</span>
            </label>
            <select
              value={paysId}
              onChange={(e) => setPaysId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={paysLoading}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white disabled:opacity-60"
            >
              <option value="">
                {paysLoading ? 'Chargement...' : 'Sélectionner un pays'}
              </option>
              {paysList.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Compagnie maritime <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={compagnie}
              onChange={(e) => setCompagnie(e.target.value)}
              placeholder="Ex : MSC, CMA CGM..."
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>
        </div>

        {/* Row 3: capacité + année */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Capacité TEU <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={capaciteTeu}
              onChange={(e) =>
                setCapaciteTeu(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Ex : 14000"
              min={1}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
              Année de construction
            </label>
            <input
              type="number"
              value={anneeConstruction}
              onChange={(e) =>
                setAnneeConstruction(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Ex : 2015"
              min={1900}
              max={new Date().getFullYear()}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/commercial/vessels')}
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
          Enregistrer le navire
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommercialVessels() {
  const location = useLocation();
  const isForm = location.pathname.includes('/new');
  return isForm ? <VesselForm /> : <VesselsList />;
}
