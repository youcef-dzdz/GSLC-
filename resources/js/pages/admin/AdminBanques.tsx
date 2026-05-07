import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, X, Landmark, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';
import { useTranslation } from 'react-i18next';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Banque {
  id: number;
  nom: string;
  code_banque: string;
  swift: string | null;
  telephone: string | null;
  adresse: string | null;
  actif: boolean;
}

interface BanqueForm {
  nom: string;
  code_banque: string;
  swift: string;
  telephone: string;
  adresse: string;
  actif: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: BanqueForm = {
  nom: '',
  code_banque: '',
  swift: '',
  telephone: '',
  adresse: '',
  actif: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminBanques() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr'|'en'|'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();
  const { isAdmin } = usePermission();
  const canEdit = isAdmin;

  // ── State ──────────────────────────────────────────────────────────────────

  const [search,     setSearch]     = useState('');
  const [statFilter, setStatFilter] = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<Banque|null>(null);
  const [form,       setForm]       = useState<BanqueForm>(EMPTY_FORM);
  const [toDelete,   setToDelete]   = useState<Banque|null>(null);
  const [toast,      setToast]      = useState<{msg:string;type:'success'|'error'}|null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFilters = () => { setSearch(''); setStatFilter(''); };

  // ── Data ───────────────────────────────────────────────────────────────────

  const safeArray = (res: any): any[] => {
    const d = res?.data ?? res;
    return Array.isArray(d?.banques) ? d.banques : Array.isArray(d) ? d : [];
  };

  const { data: allBanques = [], isLoading, isError } = useQuery<Banque[]>({
    queryKey: ['admin-banques'],
    queryFn: async () => safeArray(await adminService.getBanques()),
  });

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allBanques];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.code_banque.toLowerCase().includes(q) ||
        b.nom.toLowerCase().includes(q) ||
        (b.swift ?? '').toLowerCase().includes(q)
      );
    }
    if (statFilter === 'actif')   list = list.filter(b => b.actif);
    if (statFilter === 'inactif') list = list.filter(b => !b.actif);
    return list;
  }, [allBanques, search, statFilter]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      editing
        ? adminService.updateBanque(editing.id, payload)
        : adminService.createBanque(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banques'] });
      showToast(editing ? t('admin.banques.update_ok') : t('admin.banques.create_ok'));
      closeModal();
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? err?.message ?? 'Erreur', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteBanque(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banques'] });
      showToast(t('admin.banques.delete_ok'));
      setToDelete(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message ?? 'Impossible de supprimer cette banque.', 'error');
      setToDelete(null);
    },
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (b: Banque) => {
    setEditing(b);
    setForm({
      nom:          b.nom,
      code_banque:  b.code_banque,
      swift:        b.swift ?? '',
      telephone:    b.telephone ?? '',
      adresse:      b.adresse ?? '',
      actif:        b.actif,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      nom:       form.nom,
      swift:     form.swift     || null,
      telephone: form.telephone || null,
      adresse:   form.adresse   || null,
      actif:     form.actif,
    };
    if (!editing) payload.code_banque = form.code_banque.toUpperCase();
    saveMut.mutate(payload);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="p-6 space-y-3">
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: 56, background: '#EEF5FF', borderRadius: 12 }} />
      ))}
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-[#8A2020] font-medium">{t('admin.banques.error_load')}</p>
      <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-banques'] })}
        className="px-4 py-2 bg-[#0D2A5E] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3360] transition">
        {t('admin.banques.retry')}
      </button>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${toast.type === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'}`}>
          <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center ${toast.type === 'success' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertCircle className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <p className="text-[15px] font-semibold pr-2">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-1 p-1.5 rounded-xl opacity-60 hover:opacity-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#0D2A5E]">{t('admin.banques.title')}</h1>
          <p className="text-[11px] text-[#88A8D0] mt-0.5">
            {filtered.length} / {allBanques.length} {t('admin.banques.subtitle')}
          </p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8960A] text-white rounded-xl text-sm font-semibold hover:bg-[#A87A08] transition">
            <Plus className="w-4 h-4" />
            {t('admin.banques.new_title')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.banques.search')}
              className={`w-full border border-[#C5D8F5] rounded-xl py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
          <div className="relative min-w-[150px]">
            <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{t('admin.banques.all_statuses')}</option>
              <option value="actif">{t('admin.banques.statut_actif')}</option>
              <option value="inactif">{t('admin.banques.statut_inactif')}</option>
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>
          <button onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
            {t('admin.banques.reset_filters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_code')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_nom')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_swift')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_telephone')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_adresse')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_statut')}</th>
              {canEdit && <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.banques.col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF5FF]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#88A8D0]">
                    <Landmark className="w-8 h-8 opacity-40" />
                    <span className="text-sm">{t('admin.banques.no_banques')}</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-[#F4F9FF] transition-colors">

                {/* Code */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#EEF5FF] text-[#0D2A5E]">
                    {b.code_banque}
                  </span>
                </td>

                {/* Nom */}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0D2A5E] leading-tight">{b.nom}</p>
                </td>

                {/* SWIFT */}
                <td className="px-4 py-3">
                  {b.swift ? (
                    <span className="font-mono text-xs text-[#3A5A8A] tracking-widest">{b.swift}</span>
                  ) : (
                    <span className="text-xs text-[#88A8D0]">—</span>
                  )}
                </td>

                {/* Téléphone */}
                <td className="px-4 py-3">
                  <span className="text-xs text-[#3A5A8A]">{b.telephone ?? '—'}</span>
                </td>

                {/* Adresse */}
                <td className="px-4 py-3 max-w-[200px]">
                  <p className="text-xs text-[#3A5A8A] truncate" title={b.adresse ?? ''}>
                    {b.adresse ?? '—'}
                  </p>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  {b.actif ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF3C0] text-[#7A5800]">
                      {t('admin.banques.actif')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#88A8D0]">
                      {t('admin.banques.inactif')}
                    </span>
                  )}
                </td>

                {/* Actions */}
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(b)} title={t('admin.banques.edit_title')}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setToDelete(b)} title={t('admin.banques.delete')}
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

      {/* Delete confirm modal */}
      {toDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setToDelete(null); }}>
          <div className="bg-white w-full max-w-sm rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F0] text-[#8A2020] flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2A5E] mb-1">{t('admin.banques.confirm_del')}</h3>
                <p className="text-sm text-[#3A5A8A]">
                  {t('admin.banques.confirm_del_msg')} <span className="font-bold text-[#0D2A5E]">{toDelete.code_banque} — {toDelete.nom}</span> ?
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setToDelete(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                  {t('admin.banques.cancel')}
                </button>
                <button onClick={() => deleteMut.mutate(toDelete.id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#8A2020] text-white rounded-xl hover:bg-[#6A1010] transition disabled:opacity-50">
                  {t('admin.banques.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root') ?? document.body
      )}

      {/* Create / Edit modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#EEF5FF] shrink-0">
              <h2 className="text-base font-bold text-[#0D2A5E]">
                {editing ? t('admin.banques.edit_title') : t('admin.banques.new_title')}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#88A8D0] hover:text-[#0D2A5E] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
              <form id="banque-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Code banque — readonly on edit */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.banques.f_code')} *</label>
                  <input type="text" required disabled={!!editing}
                    value={form.code_banque}
                    onChange={e => setForm(f => ({...f, code_banque: e.target.value.toUpperCase()}))}
                    placeholder="ex: BNA"
                    className={`w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent font-mono uppercase ${editing ? 'bg-[#F8FAFC] cursor-not-allowed opacity-60' : ''}`}
                  />
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.banques.f_nom')} *</label>
                  <input type="text" required
                    value={form.nom}
                    onChange={e => setForm(f => ({...f, nom: e.target.value}))}
                    placeholder="ex: Banque Nationale d'Algérie"
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* SWIFT + Téléphone — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.banques.f_swift')}</label>
                    <input type="text" maxLength={11}
                      value={form.swift}
                      onChange={e => setForm(f => ({...f, swift: e.target.value.toUpperCase()}))}
                      placeholder="ex: BNAADZAL"
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.banques.f_telephone')}</label>
                    <input type="tel"
                      value={form.telephone}
                      onChange={e => setForm(f => ({...f, telephone: e.target.value}))}
                      placeholder="ex: +213 21 71 00 00"
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.banques.f_adresse')}</label>
                  <input type="text"
                    value={form.adresse}
                    onChange={e => setForm(f => ({...f, adresse: e.target.value}))}
                    placeholder="ex: 8 Place du 1er Mai, Alger"
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* Actif */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.actif}
                      onChange={e => setForm(f => ({...f, actif: e.target.checked}))}
                      className="w-4 h-4 rounded border-[#C5D8F5] accent-[#C8960A]"
                    />
                    <span className="text-sm text-[#3A5A8A] font-medium">{t('admin.banques.f_actif')}</span>
                  </label>
                </div>

              </form>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-[#EEF5FF] justify-end shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                {t('admin.banques.cancel')}
              </button>
              <button type="submit" form="banque-form" disabled={saveMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition disabled:opacity-50">
                {editing ? t('admin.banques.save') : t('admin.banques.create')}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root') ?? document.body
      )}
    </div>
  );
}
