import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, Plus, Trash2, X, Lock,
  ChevronRight, Pencil,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '../../hooks/usePermission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Permission {
  id: number;
  name: string;
  label: string;
  module: string;
  description?: string;
  is_system: boolean;
}

interface Role {
  id: number;
  nom_role: string;
  label: string;
  niveau: number;
  description?: string;
  is_system: boolean;
  permissions: Permission[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const NIVEAU_BADGE: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEE2E2', text: '#991B1B' },
  2: { bg: '#FFEDD5', text: '#9A3412' },
  3: { bg: '#FEF9C3', text: '#854D0E' },
  4: { bg: '#DBEAFE', text: '#1E40AF' },
  5: { bg: '#F1F5F9', text: '#475569' },
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; headerBg: string }> = {
  admin:      { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', headerBg: '#3A5A8A' },
  commercial: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', headerBg: '#2A8A5A' },
  logistique: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', headerBg: '#C8960A' },
  finance:    { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', headerBg: '#5A80BB' },
  direction:  { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8', headerBg: '#8A2020' },
};

const MODULE_LABELS_TR: Record<string, Record<'fr'|'en'|'ar', string>> = {
  admin: { fr: 'Administration', en: 'Administration', ar: 'الإدارة' },
  commercial: { fr: 'Commercial', en: 'Commercial', ar: 'التجاري' },
  logistique: { fr: 'Logistique', en: 'Logistics', ar: 'اللوجستيك' },
  finance: { fr: 'Finance', en: 'Finance', ar: 'المالية' },
  direction: { fr: 'Direction', en: 'Direction', ar: 'المديرية' },
};

const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  title: { fr: 'Rôles & Permissions', en: 'Roles & Permissions', ar: 'الأدوار والصلاحيات' },
  subtitle_roles: { fr: 'rôle', en: 'role', ar: 'دور' },
  subtitle_roles_p: { fr: 'rôles', en: 'roles', ar: 'أدوار' },
  subtitle_perms: { fr: 'permission', en: 'permission', ar: 'صلاحية' },
  subtitle_perms_p: { fr: 'permissions', en: 'permissions', ar: 'صلاحيات' },
  subtitle_desc: { fr: "Gérez les niveaux d'accès", en: 'Manage access levels', ar: 'إدارة مستويات الوصول' },
  new_role: { fr: 'Nouveau rôle', en: 'New role', ar: 'دور جديد' },
  tab_roles: { fr: 'Rôles', en: 'Roles', ar: 'الأدوار' },
  tab_perms: { fr: 'Catalogue des permissions', en: 'Permissions Catalog', ar: 'كتالوج الصلاحيات' },
  col_name: { fr: 'Nom du rôle', en: 'Role Name', ar: 'اسم الدور' },
  col_label: { fr: 'Label', en: 'Label', ar: 'إسم مرجعي' },
  col_level: { fr: 'Niv.', en: 'Lvl.', ar: 'مستوى' },
  col_status: { fr: 'Statut', en: 'Status', ar: 'الحالة' },
  col_perms: { fr: 'Permissions', en: 'Permissions', ar: 'الصلاحيات' },
  col_actions: { fr: 'Actions', en: 'Actions', ar: 'إجراءات' },
  no_roles: { fr: 'Aucun rôle défini', en: 'No roles defined', ar: 'لم يتم تحديد أي أدوار' },
  create_first: { fr: 'Créer le premier rôle', en: 'Create first role', ar: 'إنشاء أول دور' },
  custom: { fr: 'Personnalisé', en: 'Custom', ar: 'مخصص' },
  system: { fr: 'Système', en: 'System', ar: 'النظام' },
  confirm: { fr: 'Confirmer ?', en: 'Confirm?', ar: 'تأكيد؟' },
  yes: { fr: 'Oui', en: 'Yes', ar: 'نعم' },
  no: { fr: 'Non', en: 'No', ar: 'لا' },
  sys_notice: { fr: 'Rôle système — les permissions ne peuvent pas être modifiées.', en: 'System role — permissions cannot be modified.', ar: 'دور النظام — لا يمكن تعديل الصلاحيات.' },
  assigned_perms: { fr: 'Permissions assignées', en: 'Assigned permissions', ar: 'الصلاحيات المعينة' },
  selected: { fr: 'sélectionnées', en: 'selected', ar: 'محددة' },
  save_perms: { fr: 'Enregistrer les permissions', en: 'Save permissions', ar: 'حفظ الصلاحيات' },
  saving: { fr: 'Enregistrement...', en: 'Saving...', ar: 'جارٍ الحفظ...' },
  all: { fr: 'Tous', en: 'All', ar: 'الكل' },
  no_perms: { fr: 'Aucune permission trouvée', en: 'No permissions found', ar: 'لم يتم العثور على أي صلاحيات' },
  col_id: { fr: 'Identifiant', en: 'Identifier', ar: 'المعرف' },
  col_desc: { fr: 'Description', en: 'Description', ar: 'الوصف' },
  lbl_name: { fr: 'Nom du rôle (snake_case)', en: 'Role Name (snake_case)', ar: 'اسم الدور (بحروف_صغيرة)' },
  ph_name: { fr: 'ex : chef_projet', en: 'e.g. project_manager', ar: 'مثال: مدير_مشروع' },
  lbl_disp: { fr: 'Label affiché', en: 'Display Label', ar: 'الاسم المعروض' },
  ph_disp: { fr: 'ex : Chef de Projet', en: 'e.g. Project Manager', ar: 'مثال: مدير مشروع' },
  lbl_lvl: { fr: 'Niveau (1 = le plus élevé)', en: 'Level (1 = highest)', ar: 'المستوى (1 = الأعلى)' },
  lvl_num: { fr: 'Niveau', en: 'Level', ar: 'مستوى' },
  lbl_desc: { fr: 'Description (optionnel)', en: 'Description (optional)', ar: 'الوصف (اختياري)' },
  ph_desc: { fr: 'Description du rôle...', en: 'Role description...', ar: 'وصف الدور...' },
  cancel: { fr: 'Annuler', en: 'Cancel', ar: 'إلغاء' },
  create: { fr: 'Créer le rôle', en: 'Create role', ar: 'إنشاء الدور' },
  creating: { fr: 'Création...', en: 'Creating...', ar: 'جاري الإنشاء...' },
  msg_created: { fr: 'Rôle créé', en: 'Role created', ar: 'تم إنشاء الدور' },
  msg_create_err: { fr: 'Impossible de créer le rôle.', en: 'Failed to create role.', ar: 'فشل إنشاء الدور.' },
  msg_sync: { fr: 'Permissions mises à jour', en: 'Permissions updated', ar: 'تم تحديث الصلاحيات' },
  msg_sync_ok: { fr: 'Les permissions ont été enregistrées.', en: 'Permissions have been saved.', ar: 'تم حفظ الصلاحيات بنجاح.' },
  msg_sync_err: { fr: 'Impossible de synchroniser.', en: 'Failed to synchronize.', ar: 'فشل حفظ الصلاحيات.' },
  msg_del: { fr: 'Rôle supprimé', en: 'Role deleted', ar: 'تم حذف الدور' },
  msg_del_ok: { fr: 'Le rôle a été supprimé.', en: 'The role has been deleted.', ar: 'تم حذف الدور بنجاح.' },
  msg_del_err: { fr: 'Impossible de supprimer ce rôle.', en: 'Failed to delete role.', ar: 'فشل حذف الدور.' },
};

// ── Skeletons ─────────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-[#E2E8F0]">
    {[160, 96, 64, 80, 64, 48].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-[#E2E8F0] rounded animate-pulse" style={{ width: w }} />
      </td>
    ))}
  </tr>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const AdminRoles: React.FC = () => {
  const { isAdmin } = usePermission();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  }, []);

  const qc = useQueryClient();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0]?.split('_')[0] ?? 'fr') as 'fr'|'en'|'ar';
  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;
  const isRTL = lang === 'ar';

  const [showCreate,    setShowCreate]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ nom_role: '', label: '', niveau: 3, description: '' });
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [editForm, setEditForm] = useState({
    nom_role: '', niveau: 3, description: ''
  });

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn:  () => adminService.getRoles().then(r => r.data),
  });



  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMut = useMutation({
    mutationFn: () => adminService.createRole({ nom_role: form.nom_role, label: form.label, niveau: form.niveau }),
    onSuccess: () => {
      toast('success', tlx('msg_created'), `"${form.label}"`);
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setShowCreate(false);
      setForm({ nom_role: '', label: '', niveau: 3, description: '' });
    },
    onError: () => toast('error', 'Erreur', tlx('msg_create_err')),
  });

  const updateMut = useMutation({
    mutationFn: () => adminService.updateRole(
      editRole!.id,
      { nom_role: editForm.nom_role,
        niveau: editForm.niveau,
        description: editForm.description }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setEditRole(null);
      toast('success', 'Rôle modifié', 'Les modifications ont été enregistrées.');
    },
    onError: () => toast('error', 'Erreur', 'Impossible de modifier ce rôle.'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: () => {
      toast('success', tlx('msg_del'), tlx('msg_del_ok'));
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      toast('error', 'Erreur', err?.response?.data?.message ?? tlx('msg_del_err'));
      setDeleteConfirm(null);
    },
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
              <ShieldCheck size={20} color="#0D1F3C" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0D1F3C]">{tlx('title')}</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {isLoading ? '...' : `${roles.length} ${roles.length !== 1 ? tlx('subtitle_roles_p') : tlx('subtitle_roles')}`} · {tlx('subtitle_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D1F3C] hover:bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={16} />
            {tlx('new_role')}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Table ── */}
        <div className="flex flex-col overflow-auto w-full transition-all duration-300">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {[tlx('col_name'), tlx('col_label'), tlx('col_level'), tlx('col_status'), tlx('col_perms'), tlx('col_actions')].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-bold text-[#0D2A5E] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F1F5F9]">
                {isLoading
                  ? [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
                  : roles.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <ShieldCheck size={40} className="mx-auto text-[#D1D5DB] mb-3" />
                        <p className="text-[#6B7280] font-medium">{tlx('no_roles')}</p>
                        <button
                          onClick={() => setShowCreate(true)}
                          className="mt-3 px-4 py-2 bg-[#0D1F3C] text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-[#1a3a6b] transition-colors"
                        >
                          {tlx('create_first')}
                        </button>
                      </td>
                    </tr>
                  )
                  : roles.map(role => {
                    const nv = NIVEAU_BADGE[role.niveau] ?? NIVEAU_BADGE[5];
                    return (
                      <tr
                        key={role.id}
                        onClick={() => navigate(`/admin/roles/${role.id}`)}
                        className="cursor-pointer border-b border-[#E2E8F0] transition-colors duration-100 hover:bg-[#F8FAFC] border-l-4 border-l-transparent"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-[#0D1F3C]">{role.nom_role}</p>
                              {role.description && (
                                <p className="text-xs text-[#9CA3AF] truncate max-w-[160px]">{role.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono bg-[#F1F5F9] text-[#475569] rounded px-2 py-0.5 text-xs">
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: nv.bg, color: nv.text }}>
                            N{role.niveau}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {role.is_system ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#6D28D9]">
                              <Lock size={10} />
                              {tlx('system')}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-[#9CA3AF] bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                              {tlx('custom')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0D1F3C]">{role.permissions?.length ?? 0}</p>
                          <p className="text-xs text-[#9CA3AF]">{tlx('subtitle_perms_p')}</p>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          {!role.is_system && (
                            deleteConfirm === role.id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-[#EF4444] font-semibold">{tlx('confirm')}</span>
                                <button
                                  onClick={() => deleteMut.mutate(role.id)}
                                  disabled={deleteMut.isPending}
                                  className="text-xs font-bold px-2 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5] cursor-pointer transition-colors disabled:opacity-50"
                                >
                                  {tlx('yes')}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E2E8F0] cursor-pointer transition-colors"
                                >
                                  {tlx('no')}
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/roles/${role.id}`);
                                  }}
                                  className="p-1.5 rounded text-[#1A4A8C] hover:bg-[#EFF6FF] transition-all cursor-pointer"
                                  title="Gérer les permissions"
                                >
                                  <ChevronRight size={15} />
                                </button>
                                {/* Edit button — hidden for system roles */}
                                {!role.is_system && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditForm({
                                        nom_role: role.nom_role,
                                        niveau: role.niveau,
                                        description: role.description ?? '',
                                      });
                                      setEditRole(role);
                                    }}
                                    style={{
                                      background: 'none', border: 'none',
                                      cursor: 'pointer', padding: 4,
                                      color: '#4366BB',
                                    }}
                                    title="Modifier"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeleteConfirm(role.id)}
                                  className="p-1.5 rounded text-[#D1D5DB] hover:text-red-600 hover:bg-[#FEF2F2] transition-all cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

      {/* ── Create modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Plus size={16} color="#0D1F3C" />
                <h2 className="text-sm font-bold text-[#0D1F3C]">{tlx('new_role')}</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-[#64748B] hover:text-[#0D1F3C] cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Champ 1 — Label affiché (nom_role) */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 12, fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: 6,
                }}>
                  {tlx('lbl_disp')}
                  <span style={{ color: '#EF4444', marginLeft: 2 }}>*</span>
                </label>
                <input
                  value={form.nom_role}
                  onChange={e => setForm(p => ({
                    ...p,
                    nom_role: e.target.value,
                    // Auto-generate label from nom_role
                    label: e.target.value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_]/g, ''),
                  }))}
                  placeholder={tlx('ph_disp')}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 8, fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>
                  Exemple : Chef de Projet, Assistant IT, Auditeur
                </p>
              </div>

              {/* Champ 2 — Identifiant système (label) — auto-généré */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  fontSize: 12, fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: 6,
                }}>
                  Identifiant système (auto-généré)
                </label>
                <input
                  value={form.label}
                  onChange={e => setForm(p => ({
                    ...p,
                    label: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '_')
                      .replace(/[^a-z0-9_]/g, ''),
                  }))}
                  placeholder="ex: chef_projet"
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 8, fontSize: 13,
                    boxSizing: 'border-box',
                    background: '#F8FAFF',
                    color: '#4366BB',
                    fontFamily: 'monospace',
                  }}
                />
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>
                  Généré automatiquement — modifiable si nécessaire
                </p>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] font-medium mb-1">{tlx('lbl_lvl')}</label>
                <select
                  value={form.niveau}
                  onChange={e => setForm(f => ({ ...f, niveau: Number(e.target.value) }))}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-1 focus:ring-[#0D1F3C]/20 cursor-pointer"
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{tlx('lvl_num')} {n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] font-medium mb-1">{tlx('lbl_desc')}</label>
                <textarea
                  placeholder={tlx('ph_desc')}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0D1F3C] focus:outline-none focus:border-[#0D1F3C] focus:ring-1 focus:ring-[#0D1F3C]/20 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm font-semibold text-[#6B7280] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                {tlx('cancel')}
              </button>
              <button
                onClick={() => {
                  if (!form.nom_role.trim()) {
                    toast('error', 'Erreur', 'Le nom affiché est requis.');
                    return;
                  }
                  if (!form.label || form.label.length < 2) {
                    toast('error', 'Erreur',
                      'L\'identifiant doit contenir au moins 2 caractères.');
                    return;
                  }
                  if (!/^[a-z0-9_]+$/.test(form.label)) {
                    toast('error', 'Erreur',
                      'Identifiant invalide.');
                    return;
                  }
                  createMut.mutate();
                }}
                disabled={!form.nom_role || !form.label || createMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 cursor-pointer transition-colors"
                style={{ backgroundColor: '#C9A84C' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b8923e')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C9A84C')}
              >
                <Plus size={14} />
                {createMut.isPending ? tlx('creating') : tlx('create')}
              </button>
            </div>
          </div>
        </div>
      )}

  {editRole && (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        padding: 32, width: 440, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700,
                       color: '#0F172A' }}>
            Modifier le rôle
          </h3>
          <button onClick={() => setEditRole(null)}
            style={{ background: 'none', border: 'none',
                     cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>

        {/* Nom du rôle */}
        <label style={{ fontSize: 12, fontWeight: 600,
                        color: '#374151', display: 'block',
                        marginBottom: 6 }}>
          Nom affiché
        </label>
        <input
          value={editForm.nom_role}
          onChange={e => setEditForm(p => ({
            ...p, nom_role: e.target.value
          }))}
          style={{
            width: '100%', padding: '9px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8, fontSize: 13,
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />

        {/* Niveau */}
        <label style={{ fontSize: 12, fontWeight: 600,
                        color: '#374151', display: 'block',
                        marginBottom: 6 }}>
          Niveau (1 = le plus haut)
        </label>
        <select
          value={editForm.niveau}
          onChange={e => setEditForm(p => ({
            ...p, niveau: Number(e.target.value)
          }))}
          style={{
            width: '100%', padding: '9px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8, fontSize: 13,
            marginBottom: 16, boxSizing: 'border-box',
          }}
        >
          {[1,2,3,4,5].map(n => (
            <option key={n} value={n}>Niveau {n}</option>
          ))}
        </select>

        {/* Description */}
        <label style={{ fontSize: 12, fontWeight: 600,
                        color: '#374151', display: 'block',
                        marginBottom: 6 }}>
          Description (optionnel)
        </label>
        <textarea
          value={editForm.description}
          onChange={e => setEditForm(p => ({
            ...p, description: e.target.value
          }))}
          rows={3}
          style={{
            width: '100%', padding: '9px 12px',
            border: '1.5px solid #E2E8F0',
            borderRadius: 8, fontSize: 13,
            marginBottom: 24, boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10,
                      justifyContent: 'flex-end' }}>
          <button
            onClick={() => setEditRole(null)}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1.5px solid #E2E8F0',
              background: '#fff', cursor: 'pointer',
              fontSize: 13, color: '#374151',
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => updateMut.mutate()}
            disabled={updateMut.isPending ||
                      !editForm.nom_role.trim()}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: '#4366BB', color: '#fff',
              opacity: updateMut.isPending ? 0.7 : 1,
            }}
          >
            {updateMut.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )}

    </div>
  );
};

export default AdminRoles;
