import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus, Edit2, Trash2, Briefcase, Users,
  AlertCircle, Loader2, X, Building2, Search,
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Responsable {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  responsable: Responsable | null;
  responsable_id: number | null;
  membres_count: number;
  created_at: string;
}

interface UserOption {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface FormState {
  name: string;
  code: string;
  description: string;
  responsable_id: string;
}

const EMPTY_FORM: FormState = { name: '', code: '', description: '', responsable_id: '' };

// ─── Code colour map ──────────────────────────────────────────────────────────

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

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: Department | null;
  users: UserOption[];
  onClose: () => void;
  onSaved: () => void;
}

const DeptModal: React.FC<ModalProps> = ({ open, editing, users, onClose, onSaved }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  React.useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setForm(editing
      ? {
          name: editing.name,
          code: editing.code,
          description: editing.description ?? '',
          responsable_id: editing.responsable_id?.toString() ?? '',
        }
      : EMPTY_FORM,
    );
  }, [open, editing]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editing
        ? apiClient.put(`/api/admin/departments/${editing.id}`, payload)
        : apiClient.post('/api/admin/departments', payload),
    onSuccess: () => {
      toast('success', editing ? t('admin.departments.updated') : t('admin.departments.created'), t('admin.departments.op_success'));
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
      toast('error', t('common.error'), err?.response?.data?.message ?? t('common.error_save'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name:           form.name.trim(),
      code:           form.code.trim().toUpperCase(),
      description:    form.description.trim() || null,
      responsable_id: form.responsable_id ? Number(form.responsable_id) : null,
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
            {editing ? t('admin.departments.edit_title') : t('admin.departments.create_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
          <form id="dept-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t('admin.departments.field_name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex : Service Commercial"
                className={inputCls(!!fieldErrors.name)}
              />
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {t('admin.departments.field_code')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="ex : COM, FIN, LOG"
                maxLength={20}
                className={`${inputCls(!!fieldErrors.code)} font-mono`}
              />
              <p className="text-[10px] text-gray-400 mt-1">{t('admin.departments.field_code_hint')}</p>
              {fieldErrors.code && <p className="text-xs text-red-500 mt-0.5">{fieldErrors.code}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('admin.departments.field_description')}</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Description du département (optionnel)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition resize-none"
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t('admin.departments.field_responsable')}</label>
              <select
                value={form.responsable_id}
                onChange={e => setForm(f => ({ ...f, responsable_id: e.target.value }))}
                className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] transition cursor-pointer"
              >
                <option value="">{t('admin.departments.no_responsable_option')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom} — {u.email}
                  </option>
                ))}
              </select>
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="dept-form"
            disabled={mutation.isPending}
            className="px-5 py-2 text-sm font-semibold bg-[#0D1F3C] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50 transition flex items-center gap-2 cursor-pointer"
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            {editing ? t('common.save') : t('common.create')}
          </button>
        </div>

      </div>
    </div>,
    document.body,
  );
};

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────

interface ConfirmProps {
  dept: Department | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmProps> = ({ dept, loading, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  if (!dept || typeof document === 'undefined') return null;
  const blocked = dept.membres_count > 0;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h3 className="text-lg font-black text-[#0D1F3C] mb-2">{t('admin.departments.delete_title')}</h3>
          <p className="text-sm text-[#64748B]">
            Vous allez supprimer <span className="font-bold text-[#0D1F3C]">{dept.name}</span>.
          </p>

          {blocked && (
            <div className="flex items-center gap-2 justify-center mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
              <AlertCircle size={14} />
              {dept.membres_count} membre(s) rattaché(s) — suppression impossible.
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || blocked}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const DepartmentsPage: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [search, setSearch]             = useState('');

  // ── Fetch departments ─────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery<{ departments: Department[] }>({
    queryKey: ['dept-page-list'],
    queryFn: async () => (await apiClient.get('/api/admin/departments')).data,
  });

  // ── Fetch users for responsable select ───────────────────────────────────

  const { data: usersData } = useQuery<{ data: UserOption[] }>({
    queryKey: ['admin-users-select'],
    queryFn: async () => (await apiClient.get('/api/admin/users')).data,
  });

  // ── Delete mutation ───────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/admin/departments/${id}`),
    onSuccess: () => {
      toast('success', t('admin.departments.deleted'), t('admin.departments.op_success'));
      setDeletingDept(null);
      queryClient.invalidateQueries({ queryKey: ['dept-page-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
    },
    onError: (err: any) => {
      toast('error', t('common.error'), err?.response?.data?.message ?? t('common.error_delete'));
      setDeletingDept(null);
    },
  });

  const departments: Department[] = data?.departments ?? [];
  const users: UserOption[]       = usersData?.data ?? [];

  const filtered = search
    ? departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase()),
      )
    : departments;

  const totalMembers = departments.reduce((sum, d) => sum + d.membres_count, 0);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit   = (d: Department) => { setEditing(d); setModalOpen(true); };
  const onSaved    = () => {
    queryClient.invalidateQueries({ queryKey: ['dept-page-list'] });
    queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div
        className="rounded-2xl shadow-md p-5 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFBEB 100%)', borderLeft: '4px solid #CFA030' }}
      >
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">{t('admin.departments.title')}</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{t('admin.departments.subtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D1F3C] text-white text-sm font-bold hover:bg-[#1A3A6B] transition-colors shadow-md cursor-pointer"
        >
          <Plus size={16} />
          {t('admin.departments.new')}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center shadow-sm">
            <Briefcase size={20} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Départements</p>
            <p className="text-4xl font-black text-[#0D1F3C] tabular-nums">{departments.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] flex items-center justify-center shadow-sm">
            <Users size={20} className="text-[#10B981]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{t('admin.departments.total_members')}</p>
            <p className="text-4xl font-black text-[#0D1F3C] tabular-nums">{totalMembers}</p>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">

        {/* Card toolbar */}
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-sm font-semibold text-[#0D1F3C] flex items-center gap-2 flex-shrink-0">
            <Building2 size={15} className="text-[#CFA030]" />
            {t('admin.departments.list_title')}
          </h3>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Spinner />
            <span className="text-sm text-[#64748B]">{t('common.loading')}</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-sm text-[#64748B]">{t('admin.departments.error_load')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
            <Building2 size={40} />
            <p className="text-sm font-medium">
              {search ? t('common.no_results') : t('admin.departments.empty')}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                {t('admin.departments.empty_create')}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  {([t('admin.departments.col_department'), t('admin.departments.col_description'), t('admin.departments.col_responsable'), t('admin.departments.col_members'), t('admin.departments.col_actions')] as const).map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider ${i === 3 ? 'text-center' : i === 4 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(dept => {
                  const c = codeColor(dept.code);
                  return (
                    <tr key={dept.id} className="hover:bg-[#F0F7FF] transition-all duration-150">

                      {/* Département */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-lg flex-shrink-0"
                            style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                          >
                            {dept.code}
                          </span>
                          <span className="font-semibold text-[#0D1F3C]">{dept.name}</span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-[220px]">
                        {dept.description
                          ? <p className="text-xs text-[#64748B] truncate">{dept.description}</p>
                          : <span className="text-xs text-[#CBD5E1] italic">—</span>
                        }
                      </td>

                      {/* Responsable */}
                      <td className="px-5 py-4">
                        {dept.responsable ? (
                          <div>
                            <p className="text-xs font-semibold text-[#0D1F3C]">
                              {dept.responsable.prenom} {dept.responsable.nom}
                            </p>
                            <p className="text-xs text-[#94A3B8]">{dept.responsable.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-[#CBD5E1] italic">{t('admin.departments.no_responsable')}</span>
                        )}
                      </td>

                      {/* Membres */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                          <Users size={11} />
                          {dept.membres_count}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(dept)}
                            className="p-2 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingDept(dept)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                            title="Supprimer"
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
          </div>
        )}
      </div>

      {/* Modals */}
      <DeptModal
        open={modalOpen}
        editing={editing}
        users={users}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        dept={deletingDept}
        loading={deleteMutation.isPending}
        onConfirm={() => deletingDept && deleteMutation.mutate(deletingDept.id)}
        onCancel={() => setDeletingDept(null)}
      />

    </div>
  );
};

export default DepartmentsPage;
