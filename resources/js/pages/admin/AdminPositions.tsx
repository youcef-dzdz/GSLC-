import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit2, Trash2, Briefcase, Search,
  AlertCircle, Loader2, X, Building2, ChevronDown,
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Position {
  id: number;
  title: string;
  description: string | null;
  department_id: number | null;
  department: { id: number; name: string; code: string } | null;
}

interface Department { id: number; name: string; code: string; }

interface FormState { title: string; description: string; department_id: string; }

const EMPTY_FORM: FormState = { title: '', description: '', department_id: '' };

// ─── Dept badge colour ────────────────────────────────────────────────────────

const CODE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  COM:   { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  FIN:   { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  LOG:   { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  ADMIN: { bg: '#FAF5FF', text: '#6B21A8', border: '#E9D5FF' },
  DIR:   { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
};
const codeColor = (code: string) =>
  CODE_COLORS[code.toUpperCase()] ?? { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC<{ size?: number }> = ({ size = 5 }) => (
  <svg className={`w-${size} h-${size} animate-spin text-[#0D1F3C]`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── Inline texts (trilingue) ─────────────────────────────────────────────────

const TX = {
  title:          { fr: 'Postes & Fonctions',        en: 'Positions & Roles',           ar: 'المناصب والوظائف' },
  subtitle:       { fr: 'Gestion des postes de l\'organisation', en: 'Manage organization positions', ar: 'إدارة مناصب المنظمة' },
  add:            { fr: 'Nouveau poste',             en: 'New position',                ar: 'منصب جديد' },
  search_ph:      { fr: 'Rechercher un poste…',      en: 'Search a position…',          ar: 'البحث عن منصب…' },
  all_depts:      { fr: 'Tous les services',         en: 'All departments',             ar: 'كل الأقسام' },
  no_dept:        { fr: 'Sans service',              en: 'No department',               ar: 'بدون قسم' },
  col_title:      { fr: 'Poste',                     en: 'Position',                    ar: 'المنصب' },
  col_dept:       { fr: 'Service',                   en: 'Department',                  ar: 'القسم' },
  col_desc:       { fr: 'Description',               en: 'Description',                 ar: 'الوصف' },
  col_actions:    { fr: 'Actions',                   en: 'Actions',                     ar: 'الإجراءات' },
  empty:          { fr: 'Aucun poste trouvé.',       en: 'No positions found.',         ar: 'لم يتم العثور على منصب.' },
  create_title:   { fr: 'Nouveau poste',             en: 'New position',                ar: 'منصب جديد' },
  edit_title:     { fr: 'Modifier le poste',         en: 'Edit position',               ar: 'تعديل المنصب' },
  field_title:    { fr: 'Intitulé du poste',         en: 'Position title',              ar: 'عنوان المنصب' },
  field_desc:     { fr: 'Description',               en: 'Description',                 ar: 'الوصف' },
  field_dept:     { fr: 'Service rattaché',          en: 'Linked department',           ar: 'القسم المرتبط' },
  no_dept_opt:    { fr: '— Aucun service —',         en: '— No department —',           ar: '— بدون قسم —' },
  cancel:         { fr: 'Annuler',                   en: 'Cancel',                      ar: 'إلغاء' },
  save:           { fr: 'Enregistrer',               en: 'Save',                        ar: 'حفظ' },
  create_btn:     { fr: 'Créer',                     en: 'Create',                      ar: 'إنشاء' },
  del_title:      { fr: 'Supprimer ce poste ?',      en: 'Delete this position?',       ar: 'حذف هذا المنصب؟' },
  del_cancel:     { fr: 'Annuler',                   en: 'Cancel',                      ar: 'إلغاء' },
  del_confirm:    { fr: 'Supprimer',                 en: 'Delete',                      ar: 'حذف' },
  created_ok:     { fr: 'Poste créé avec succès.',   en: 'Position created.',           ar: 'تم إنشاء المنصب.' },
  updated_ok:     { fr: 'Poste mis à jour.',         en: 'Position updated.',           ar: 'تم تحديث المنصب.' },
  deleted_ok:     { fr: 'Poste supprimé.',           en: 'Position deleted.',           ar: 'تم حذف المنصب.' },
  err_load:       { fr: 'Erreur de chargement.',     en: 'Loading error.',              ar: 'خطأ في التحميل.' },
  err_save:       { fr: 'Erreur d\'enregistrement.', en: 'Save error.',                 ar: 'خطأ في الحفظ.' },
  no_desc:        { fr: 'Aucune description.',       en: 'No description.',             ar: 'لا يوجد وصف.' },
};

type Lang = 'fr' | 'en' | 'ar';
const tl = (rec: Record<Lang, string>, lang: Lang) => rec[lang] ?? rec['fr'];

// ─── Modal Create / Edit ──────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: Position | null;
  departments: Department[];
  lang: Lang;
  onClose: () => void;
  onSaved: () => void;
}

const PositionModal: React.FC<ModalProps> = ({ open, editing, departments, lang, onClose, onSaved }) => {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setForm(editing
      ? {
          title:         editing.title,
          description:   editing.description ?? '',
          department_id: editing.department_id?.toString() ?? '',
        }
      : EMPTY_FORM,
    );
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing
        ? apiClient.put(`/api/admin/positions/${editing.id}`, payload)
        : apiClient.post('/api/admin/positions', payload),
    onSuccess: () => {
      toast('success', editing ? tl(TX.updated_ok, lang) : tl(TX.created_ok, lang));
      onSaved();
      onClose();
    },
    onError: (err: any) => {
      const serverErrors = err?.response?.data?.errors as Record<string, string[]> | undefined;
      if (serverErrors) {
        const mapped: Partial<Record<keyof FormState, string>> = {};
        for (const [k, v] of Object.entries(serverErrors)) {
          mapped[k as keyof FormState] = v[0];
        }
        setFieldErrors(mapped);
      }
      toast('error', err?.response?.data?.message ?? tl(TX.err_save, lang));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title:         form.title.trim(),
      description:   form.description.trim() || null,
      department_id: form.department_id ? Number(form.department_id) : null,
    });
  };

  const inputCls = (hasError?: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition ${hasError ? 'border-red-300' : 'border-gray-200'}`;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      style={{ zIndex: 999999 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-[#0D1F3C]">
            {editing ? tl(TX.edit_title, lang) : tl(TX.create_title, lang)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
          <form id="pos-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {tl(TX.field_title, lang)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className={inputCls(!!fieldErrors.title)}
              />
              {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {tl(TX.field_desc, lang)}
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition resize-none"
              />
            </div>

            {/* Département */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {tl(TX.field_dept, lang)}
              </label>
              <div className="relative">
                <select
                  value={form.department_id}
                  onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition cursor-pointer pr-8"
                >
                  <option value="">{tl(TX.no_dept_opt, lang)}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 cursor-pointer"
          >
            {tl(TX.cancel, lang)}
          </button>
          <button
            type="submit"
            form="pos-form"
            disabled={mutation.isPending}
            className="px-5 py-2 text-sm font-semibold bg-[#0D1F3C] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {editing ? tl(TX.save, lang) : tl(TX.create_btn, lang)}
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
};

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  position: Position | null;
  loading: boolean;
  errorMsg: string | null;
  lang: Lang;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({ position, loading, errorMsg, lang, onConfirm, onCancel }) => {
  if (!position || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h3 className="text-base font-black text-[#0D1F3C] mb-2">{tl(TX.del_title, lang)}</h3>
          <p className="text-sm text-[#64748B]">
            <span className="font-bold text-[#0D1F3C]">{position.title}</span>
          </p>

          {errorMsg && (
            <div className="flex items-center gap-2 justify-center mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
              <AlertCircle size={14} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 cursor-pointer"
            >
              {tl(TX.del_cancel, lang)}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !!errorMsg}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {tl(TX.del_confirm, lang)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPositions() {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0]?.split('_')[0] ?? 'fr') as Lang;
  const isRTL = lang === 'ar';
  const qc = useQueryClient();
  const { toast } = useToast();

  const [search,       setSearch]       = useState('');
  const [deptFilter,   setDeptFilter]   = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);
  const [deleteError,  setDeleteError]  = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: posData, isLoading, isError } = useQuery({
    queryKey: ['admin-positions'],
    queryFn: () => apiClient.get('/api/admin/positions').then(r => r.data),
  });

  const { data: deptData } = useQuery({
    queryKey: ['admin-departments-list'],
    queryFn: () => apiClient.get('/api/admin/departments').then(r => r.data),
  });

  const positions: Position[]   = posData?.positions   ?? [];
  const departments: Department[] = deptData?.departments ?? [];

  // ── Filtered list ─────────────────────────────────────────────────────────────

  const filtered = positions.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchDept   = !deptFilter
      ? true
      : deptFilter === '__none__'
      ? p.department_id === null
      : String(p.department_id) === deptFilter;
    return matchSearch && matchDept;
  });

  // ── Delete ────────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`/api/admin/positions/${deleteTarget.id}`);
      qc.invalidateQueries({ queryKey: ['admin-positions'] });
      toast('success', tl(TX.deleted_ok, lang));
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? tl(TX.err_save, lang);
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const openDelete = (p: Position) => {
    setDeleteError(null);
    setDeleteTarget(p);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (p: Position) => { setEditing(p); setModalOpen(true); };
  const onSaved    = () => qc.invalidateQueries({ queryKey: ['admin-positions'] });

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="p-6 max-w-5xl mx-auto">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D1F3C] flex items-center justify-center shrink-0">
            <Briefcase size={18} color="#CFA030" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0D1F3C]">{tl(TX.title, lang)}</h1>
            <p className="text-xs text-[#64748B]">{tl(TX.subtitle, lang)}</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-[#0D1F3C] text-white rounded-xl hover:bg-[#1a3360] transition cursor-pointer"
        >
          <Plus size={15} />
          {tl(TX.add, lang)}
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tl(TX.search_ph, lang)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition"
          />
        </div>

        {/* Dept filter */}
        <div className="relative">
          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] appearance-none cursor-pointer transition"
          >
            <option value="">{tl(TX.all_depts, lang)}</option>
            <option value="__none__">{tl(TX.no_dept, lang)}</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code} — {d.name}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size={7} />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 justify-center py-16 text-sm text-red-500">
          <AlertCircle size={16} />
          {tl(TX.err_load, lang)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-[#94A3B8]">
          <Briefcase size={40} strokeWidth={1.5} />
          <p className="text-sm font-semibold">{tl(TX.empty, lang)}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">
                  {tl(TX.col_title, lang)}
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide">
                  {tl(TX.col_dept, lang)}
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide hidden md:table-cell">
                  {tl(TX.col_desc, lang)}
                </th>
                <th className="px-5 py-3 text-xs font-bold text-[#64748B] uppercase tracking-wide text-right">
                  {tl(TX.col_actions, lang)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const color = p.department ? codeColor(p.department.code) : null;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#0D1F3C]/5 flex items-center justify-center shrink-0">
                          <Briefcase size={13} className="text-[#0D1F3C]" />
                        </div>
                        <span className="font-semibold text-[#0D1F3C]">{p.title}</span>
                      </div>
                    </td>

                    {/* Dept badge */}
                    <td className="px-5 py-3.5">
                      {p.department && color ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
                          style={{ background: color.bg, color: color.text, borderColor: color.border }}
                        >
                          <Building2 size={10} />
                          {p.department.code}
                        </span>
                      ) : (
                        <span className="text-xs text-[#CBD5E1]">—</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {p.description ? (
                        <span className="text-xs text-[#64748B] line-clamp-2">{p.description}</span>
                      ) : (
                        <span className="text-xs text-[#CBD5E1] italic">{tl(TX.no_desc, lang)}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-[#64748B] hover:text-blue-600 transition cursor-pointer"
                          title={tl(TX.edit_title, lang)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-500 transition cursor-pointer"
                          title={tl(TX.del_title, lang)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer count */}
          <div className="px-5 py-3 border-t border-gray-50 text-xs text-[#94A3B8]">
            {filtered.length} / {positions.length}
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <PositionModal
        open={modalOpen}
        editing={editing}
        departments={departments}
        lang={lang}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDelete
        position={deleteTarget}
        loading={deleting}
        errorMsg={deleteError}
        lang={lang}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />

    </div>
  );
}
