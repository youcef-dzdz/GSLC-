import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';
import { useToast } from '@/components/ui/Toast';
import PenaliteSurestarieModal, { PenaliteForm } from './PenaliteSurestarieModal';
import { ConfirmModal } from './ports/PortShared';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Penalite {
  id: number;
  type_conteneur_id: number;
  type_conteneur?: string;
  devise_id: number;
  devise?: string;
  type: 'DEMURRAGE' | 'DETENTION';
  tarif_journalier: number;
  tranche_debut: number;
  tranche_fin: number | null;
  date_debut_validite: string;
  date_fin_validite: string | null;
  actif: boolean;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR') : '—';

// ── Component ─────────────────────────────────────────────────────────────────

const AdminPenalitesSurestarie: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = usePermission();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState<Penalite | null>(null);
  const [toDelete,     setToDelete]     = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin && !hasPermission('penalites.view')) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, hasPermission, navigate]);

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: penalites = [], isLoading, isError } = useQuery<Penalite[]>({
    queryKey: ['adminPenalites', typeFilter, statutFilter],
    queryFn: () =>
      adminService.getPenalites({ type: typeFilter, statut: statutFilter })
        .then((res: any) => res?.data?.penalites ?? res?.penalites ?? []),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [modalErrors, setModalErrors] = useState<Record<string, string[]> | null>(null);

  const createMut = useMutation({
    mutationFn: (data: PenaliteForm) => adminService.createPenalite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPenalites'] });
      setShowModal(false);
      setModalErrors(null);
      toast('success', t('admin.penalites.created_success'), '');
    },
    onError: (e: any) => {
      setModalErrors(e?.response?.data?.errors ?? null);
      toast('error', t('common.error'), e?.response?.data?.message ?? '');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PenaliteForm }) =>
      adminService.updatePenalite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPenalites'] });
      setShowModal(false);
      setEditing(null);
      setModalErrors(null);
      toast('success', t('admin.penalites.updated_success'), '');
    },
    onError: (e: any) => {
      setModalErrors(e?.response?.data?.errors ?? null);
      toast('error', t('common.error'), e?.response?.data?.message ?? '');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deletePenalite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPenalites'] });
      setToDelete(null);
      toast('success', t('admin.penalites.deleted_success'), '');
    },
    onError: (e: any) => {
      toast('error', t('common.error'), e?.response?.data?.message ?? '');
    },
  });

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return penalites;
    const q = search.toLowerCase();
    return penalites.filter(p =>
      p.type.toLowerCase().includes(q) ||
      (p.type_conteneur ?? '').toLowerCase().includes(q)
    );
  }, [penalites, search]);

  const canEdit = isAdmin || hasPermission('penalites.manage');

  // ── Shared styles ─────────────────────────────────────────────────────────

  const selCls = 'border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] appearance-none w-full';

  // ── Render ────────────────────────────────────────────────────────────────

  if (isError) return (
    <div className="p-6 text-[#8A2020] text-sm">{t('admin.penalites.error_load')}</div>
  );

  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0D2A5E]">{t('admin.penalites.title')}</h1>
          <p className="text-[11px] text-[#88A8D0] mt-0.5">{t('admin.penalites.subtitle')}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditing(null); setModalErrors(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8960A] text-white rounded-xl text-sm font-semibold hover:bg-[#A87A08] transition"
          >
            <Plus className="w-4 h-4" />
            {t('admin.penalites.new_button')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.penalites.search_placeholder')}
              className="w-full border border-[#C5D8F5] rounded-xl pl-9 pr-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A]"
            />
          </div>

          {/* Type filter */}
          <div className="relative min-w-[170px]">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={selCls}>
              <option value="">{t('admin.penalites.all_types')}</option>
              <option value="DEMURRAGE">{t('admin.penalites.type_demurrage')}</option>
              <option value="DETENTION">{t('admin.penalites.type_detention')}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
          </div>

          {/* Statut filter */}
          <div className="relative min-w-[150px]">
            <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className={selCls}>
              <option value="">{t('admin.penalites.all_statuses')}</option>
              <option value="actif">{t('common.active') ?? 'Actif'}</option>
              <option value="inactif">{t('common.inactive') ?? 'Inactif'}</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
          </div>

          <button
            onClick={() => { setSearch(''); setTypeFilter(''); setStatutFilter(''); }}
            className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]"
          >
            {t('common.reset_filters') ?? 'Réinitialiser'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_type')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_conteneur')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_devise')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_tarif')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_tranche')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_validite')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.penalites.col_statut')}</th>
              {canEdit && <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-right">{t('admin.penalites.col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF5FF]">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[#88A8D0]">{t('common.loading') ?? 'Chargement...'}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-[#88A8D0]">{t('admin.penalites.empty')}</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-[#F4F9FF] transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.type === 'DEMURRAGE' ? 'bg-[#E0EEFF] text-[#1A4A9A]' : 'bg-[#FFF3C0] text-[#7A5800]'}`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#3A5A8A]">{p.type_conteneur ?? '—'}</td>
                <td className="px-4 py-3 text-[#3A5A8A] font-mono text-xs">{p.devise ?? '—'}</td>
                <td className="px-4 py-3 font-bold text-[#0D2A5E]">{p.tarif_journalier}</td>
                <td className="px-4 py-3 text-[#3A5A8A]">{p.tranche_debut} → {p.tranche_fin ?? '∞'}</td>
                <td className="px-4 py-3 text-xs text-[#3A5A8A]">{fmtDate(p.date_debut_validite)} — {fmtDate(p.date_fin_validite)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.actif ? 'bg-[#FFF3C0] text-[#7A5800]' : 'bg-[#EEF5FF] text-[#88A8D0]'}`}>
                    {p.actif ? t('common.active') ?? 'Actif' : t('common.inactive') ?? 'Inactif'}
                  </span>
                </td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditing(p); setModalErrors(null); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setToDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#88A8D0] hover:text-[#8A2020] transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <PenaliteSurestarieModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={data => editing ? updateMut.mutate({ id: editing.id, data }) : createMut.mutate(data)}
          initialData={editing ?? undefined}
          isSubmitting={createMut.isPending || updateMut.isPending}
          errors={modalErrors}
        />
      )}

      {/* Delete confirm */}
      {toDelete !== null && (
        <ConfirmModal
          message={t('admin.penalites.confirm_delete_message')}
          onConfirm={() => deleteMut.mutate(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}

    </div>
  );
};

export default AdminPenalitesSurestarie;
