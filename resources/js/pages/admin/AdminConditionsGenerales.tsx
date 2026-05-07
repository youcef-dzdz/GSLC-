import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, X, FileText, ChevronDown, Check, AlertCircle, Zap } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';
import { useTranslation } from 'react-i18next';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CreePar { id: number; nom: string; prenom: string; }

interface Condition {
  id: number;
  version: string;
  titre: string;
  contenu: string;
  actif: boolean;
  cree_par_user_id: number | null;
  cree_par: CreePar | null;
  date_application: string | null;
  created_at: string;
}

interface ConditionForm {
  version: string;
  titre: string;
  contenu: string;
  date_application: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: ConditionForm = {
  version: '',
  titre: '',
  contenu: '',
  date_application: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminConditionsGenerales() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'fr'|'en'|'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();
  const { isAdmin } = usePermission();
  const canEdit = isAdmin;

  // ── State ──────────────────────────────────────────────────────────────────

  const [search,       setSearch]       = useState('');
  const [statFilter,   setStatFilter]   = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState<Condition|null>(null);
  const [form,         setForm]         = useState<ConditionForm>(EMPTY_FORM);
  const [toDelete,     setToDelete]     = useState<Condition|null>(null);
  const [toActivate,   setToActivate]   = useState<Condition|null>(null);
  const [toast,        setToast]        = useState<{msg:string;type:'success'|'error'}|null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFilters = () => { setSearch(''); setStatFilter(''); };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const formatDateTimeLocal = (d: string | null): string => {
    if (!d) return '';
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  // ── Data ───────────────────────────────────────────────────────────────────

  const safeArray = (res: any): any[] => {
    const d = res?.data ?? res;
    return Array.isArray(d?.conditions) ? d.conditions : Array.isArray(d) ? d : [];
  };

  const { data: allConditions = [], isLoading, isError } = useQuery<Condition[]>({
    queryKey: ['admin-conditions'],
    queryFn: async () => safeArray(await adminService.getConditions()),
  });

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allConditions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.version.toLowerCase().includes(q) ||
        c.titre.toLowerCase().includes(q)
      );
    }
    if (statFilter === 'actif')     list = list.filter(c => c.actif);
    if (statFilter === 'brouillon') list = list.filter(c => !c.actif);
    return list;
  }, [allConditions, search, statFilter]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      editing
        ? adminService.updateCondition(editing.id, payload)
        : adminService.createCondition(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-conditions'] });
      showToast(editing ? t('admin.conditions_generales.update_ok') : t('admin.conditions_generales.create_ok'));
      closeModal();
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Erreur', 'error'),
  });

  const activateMut = useMutation({
    mutationFn: (id: number) => adminService.activateCondition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-conditions'] });
      showToast(t('admin.conditions_generales.activate_ok'));
      setToActivate(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message ?? 'Erreur', 'error');
      setToActivate(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteCondition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-conditions'] });
      showToast(t('admin.conditions_generales.delete_ok'));
      setToDelete(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message ?? 'Impossible de supprimer.', 'error');
      setToDelete(null);
    },
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (c: Condition) => {
    setEditing(c);
    setForm({
      version:          c.version,
      titre:            c.titre,
      contenu:          c.contenu,
      date_application: formatDateTimeLocal(c.date_application),
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      titre:            form.titre,
      contenu:          form.contenu,
      date_application: form.date_application || null,
    };
    if (!editing) payload.version = form.version;
    saveMut.mutate(payload);
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="p-6 space-y-3">
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 64, background: '#EEF5FF', borderRadius: 12 }} />
      ))}
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-[#8A2020] font-medium">{t('admin.conditions_generales.error_load')}</p>
      <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-conditions'] })}
        className="px-4 py-2 bg-[#0D2A5E] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3360] transition">
        {t('admin.conditions_generales.retry')}
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
          <h1 className="text-xl font-extrabold text-[#0D2A5E]">{t('admin.conditions_generales.title')}</h1>
          <p className="text-[11px] text-[#88A8D0] mt-0.5">
            {filtered.length} / {allConditions.length} {t('admin.conditions_generales.subtitle')}
          </p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8960A] text-white rounded-xl text-sm font-semibold hover:bg-[#A87A08] transition">
            <Plus className="w-4 h-4" />
            {t('admin.conditions_generales.new_title')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.conditions_generales.search')}
              className={`w-full border border-[#C5D8F5] rounded-xl py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
          <div className="relative min-w-[160px]">
            <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{t('admin.conditions_generales.all_statuses')}</option>
              <option value="actif">{t('admin.conditions_generales.statut_actif')}</option>
              <option value="brouillon">{t('admin.conditions_generales.statut_brouillon')}</option>
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>
          <button onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
            {t('admin.conditions_generales.reset_filters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_version')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_titre')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_date')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_cree_par')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_statut')}</th>
              {canEdit && <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{t('admin.conditions_generales.col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF5FF]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#88A8D0]">
                    <FileText className="w-8 h-8 opacity-40" />
                    <span className="text-sm">{t('admin.conditions_generales.no_conditions')}</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(c => (
              <tr key={c.id} className={`transition-colors ${c.actif ? 'bg-[#FFFDF0]' : 'hover:bg-[#F4F9FF]'}`}>

                {/* Version */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#EEF5FF] text-[#0D2A5E]">
                    {c.version}
                  </span>
                </td>

                {/* Titre */}
                <td className="px-4 py-3 max-w-[240px]">
                  <p className="text-sm font-semibold text-[#0D2A5E] leading-tight truncate" title={c.titre}>
                    {c.titre}
                  </p>
                </td>

                {/* Date d'application */}
                <td className="px-4 py-3">
                  <span className="text-xs text-[#3A5A8A]">{formatDate(c.date_application)}</span>
                </td>

                {/* Créé par */}
                <td className="px-4 py-3">
                  <span className="text-xs text-[#3A5A8A]">
                    {c.cree_par ? `${c.cree_par.prenom} ${c.cree_par.nom}` : '—'}
                  </span>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  {c.actif ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#E6F7F0] text-[#2A8A5A]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2A8A5A]" />
                      {t('admin.conditions_generales.badge_actif')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#88A8D0]">
                      {t('admin.conditions_generales.badge_brouillon')}
                    </span>
                  )}
                </td>

                {/* Actions */}
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Activate — only on draft versions */}
                      {!c.actif && (
                        <button onClick={() => setToActivate(c)}
                          title={t('admin.conditions_generales.activate')}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFF3C0] text-[#7A5800] hover:bg-[#C8960A] hover:text-white text-xs font-bold transition">
                          <Zap className="w-3 h-3" />
                          {t('admin.conditions_generales.activate')}
                        </button>
                      )}
                      <button onClick={() => openEdit(c)} title={t('admin.conditions_generales.edit_title')}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!c.actif && (
                        <button onClick={() => setToDelete(c)} title={t('admin.conditions_generales.delete')}
                          className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#88A8D0] hover:text-[#8A2020] transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activate confirm modal */}
      {toActivate && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setToActivate(null); }}>
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF3C0] text-[#C8960A] flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2A5E] mb-1">{t('admin.conditions_generales.confirm_act')}</h3>
                <p className="text-sm text-[#3A5A8A] leading-relaxed">{t('admin.conditions_generales.confirm_act_msg')}</p>
                <p className="mt-2 font-bold text-[#0D2A5E] text-sm">{toActivate.version} — {toActivate.titre}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setToActivate(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                  {t('admin.conditions_generales.cancel')}
                </button>
                <button onClick={() => activateMut.mutate(toActivate.id)}
                  disabled={activateMut.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition disabled:opacity-50">
                  {t('admin.conditions_generales.activate')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root') ?? document.body
      )}

      {/* Delete confirm modal */}
      {toDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setToDelete(null); }}>
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F0] text-[#8A2020] flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2A5E] mb-1">{t('admin.conditions_generales.confirm_del')}</h3>
                <p className="text-sm text-[#3A5A8A]">
                  {t('admin.conditions_generales.confirm_del_msg')} <span className="font-bold text-[#0D2A5E]">{toDelete.version}</span> ?
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setToDelete(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                  {t('admin.conditions_generales.cancel')}
                </button>
                <button onClick={() => deleteMut.mutate(toDelete.id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#8A2020] text-white rounded-xl hover:bg-[#6A1010] transition disabled:opacity-50">
                  {t('admin.conditions_generales.delete')}
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
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#EEF5FF] shrink-0">
              <h2 className="text-base font-bold text-[#0D2A5E]">
                {editing ? t('admin.conditions_generales.edit_title') : t('admin.conditions_generales.new_title')}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#88A8D0] hover:text-[#0D2A5E] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
              <form id="condition-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Version + Date — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.conditions_generales.f_version')} *</label>
                    <input type="text" required disabled={!!editing}
                      value={form.version}
                      onChange={e => setForm(f => ({...f, version: e.target.value}))}
                      placeholder="ex: v3.0"
                      className={`w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent font-mono ${editing ? 'bg-[#F8FAFC] cursor-not-allowed opacity-60' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.conditions_generales.f_date')}</label>
                    <input type="datetime-local"
                      value={form.date_application}
                      onChange={e => setForm(f => ({...f, date_application: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.conditions_generales.f_titre')} *</label>
                  <input type="text" required
                    value={form.titre}
                    onChange={e => setForm(f => ({...f, titre: e.target.value}))}
                    placeholder="ex: Conditions Générales de Location de Conteneurs NASHCO"
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{t('admin.conditions_generales.f_contenu')} *</label>
                  <textarea required rows={12}
                    value={form.contenu}
                    onChange={e => setForm(f => ({...f, contenu: e.target.value}))}
                    placeholder="Saisissez le texte complet des conditions générales..."
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent resize-y min-h-[200px]"
                  />
                </div>

              </form>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-[#EEF5FF] justify-end shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                {t('admin.conditions_generales.cancel')}
              </button>
              <button type="submit" form="condition-form" disabled={saveMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition disabled:opacity-50">
                {editing ? t('admin.conditions_generales.save') : t('admin.conditions_generales.create')}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root') ?? document.body
      )}
    </div>
  );
}
