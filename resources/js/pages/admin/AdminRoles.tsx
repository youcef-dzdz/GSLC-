import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck, Plus, Trash2, X, Save, Lock,
  AlertCircle, ChevronRight, Pencil,
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

type GroupedPermissions = Record<string, Permission[]>;
type ActiveTab = 'roles' | 'permissions';

// ── Constants ─────────────────────────────────────────────────────────────────

const NIVEAU_BADGE: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEE2E2', text: '#991B1B' },
  2: { bg: '#FFEDD5', text: '#9A3412' },
  3: { bg: '#FEF9C3', text: '#854D0E' },
  4: { bg: '#DBEAFE', text: '#1E40AF' },
  5: { bg: '#F1F5F9', text: '#475569' },
};

const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; headerBg: string }> = {
  admin:      { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', headerBg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
  commercial: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', headerBg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' },
  logistique: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', headerBg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' },
  finance:    { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', headerBg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  direction:  { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8', headerBg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)' },
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

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 overflow-hidden">
    <div className="h-14 bg-[#E2E8F0] animate-pulse" />
    <div className="p-4 space-y-3">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" style={{ width: 128 }} />
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" style={{ width: 192 }} />
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse" style={{ width: 96 }} />
        </div>
      ))}
    </div>
  </div>
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

  const [activeTab,     setActiveTab]     = useState<ActiveTab>('roles');
  const [selectedRole,  setSelectedRole]  = useState<Role | null>(null);
  const [checkedIds,    setCheckedIds]    = useState<Set<number>>(new Set());
  const [showCreate,    setShowCreate]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [catalogueModule, setCatalogueModule] = useState<string>('all');
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

  const { data: grouped = {}, isLoading: groupedLoading } = useQuery<GroupedPermissions>({
    queryKey: ['admin-permissions-grouped'],
    queryFn:  () => adminService.getPermissionsGrouped().then(r => r.data),
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

  const syncMut = useMutation({
    mutationFn: ({ roleId, ids }: { roleId: number; ids: number[] }) =>
      adminService.syncRolePermissions(roleId, ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      toast('success',
        tlx('msg_sync'),
        tlx('msg_sync_ok'));
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? tlx('msg_sync_err');
      toast('error', 'Erreur', msg);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteRole(id),
    onSuccess: (_, id) => {
      toast('success', tlx('msg_del'), tlx('msg_del_ok'));
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      if (selectedRole?.id === id) setSelectedRole(null);
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      toast('error', 'Erreur', err?.response?.data?.message ?? tlx('msg_del_err'));
      setDeleteConfirm(null);
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openRole = (role: Role) => {
    setSelectedRole(role);
    setCheckedIds(new Set(role.permissions.map(p => p.id)));
    setDeleteConfirm(null);
  };

  const togglePerm = (id: number) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const catalogueModules = Object.keys(grouped).sort();
  const totalPermCount   = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);
  const visibleModules   = catalogueModule === 'all'
    ? catalogueModules
    : catalogueModules.filter(m => m === catalogueModule);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
              <ShieldCheck size={20} color="#0D1F3C" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0D1F3C]">{tlx('title')}</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {isLoading ? '...' : `${roles.length} ${roles.length !== 1 ? tlx('subtitle_roles_p') : tlx('subtitle_roles')}`} · {totalPermCount} {totalPermCount !== 1 ? tlx('subtitle_perms_p') : tlx('subtitle_perms')} · {tlx('subtitle_desc')}
              </p>
            </div>
          </div>
          {activeTab === 'roles' && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D1F3C] hover:bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={16} />
              {tlx('new_role')}
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1">
          {([
            { key: 'roles',       label: tlx('tab_roles'),                    count: roles.length },
            { key: 'permissions', label: tlx('tab_perms'), count: totalPermCount },
          ] as { key: ActiveTab; label: string; count: number }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'text-[#0D1F3C] border-[#0D1F3C] bg-white'
                  : 'text-[#6B7280] border-transparent hover:text-[#0D1F3C] hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? 'bg-[#0D1F3C] text-white' : 'bg-[#F1F5F9] text-[#6B7280]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — RÔLES
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'roles' && (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Table ── */}
          <div className={`flex flex-col overflow-auto transition-all duration-300 ${selectedRole ? 'w-[55%]' : 'w-full'}`}>
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10">
                <tr style={{ background: '#0D1F3C' }}>
                  {[tlx('col_name'), tlx('col_label'), tlx('col_level'), tlx('col_status'), tlx('col_perms'), tlx('col_actions')].map((h, i) => (
                    <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
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
                    const isSelected = selectedRole?.id === role.id;
                    return (
                      <tr
                        key={role.id}
                        onClick={() => openRole(role)}
                        className={`cursor-pointer border-b border-[#E2E8F0] transition-colors duration-100 ${
                          isSelected
                            ? 'bg-[#EFF6FF] border-l-4 border-l-[#0D1F3C]'
                            : 'hover:bg-[#F8FAFC] border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isSelected && <ChevronRight size={14} color="#0D1F3C" className="flex-shrink-0" />}
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

          {/* ── Detail panel ── */}
          {selectedRole && (
            <div className="w-[45%] border-l border-[#E2E8F0] bg-white shadow-lg flex flex-col overflow-hidden">

              {/* Panel header */}
              <div
                className="flex items-start justify-between px-5 py-4 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0D1F3C 0%, #1a3a6b 100%)' }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-white truncate">{selectedRole.nom_role}</h2>
                    <span className="font-mono text-xs bg-white/20 text-white px-2 py-0.5 rounded">
                      {selectedRole.label}
                    </span>
                    {(() => {
                      const nv = NIVEAU_BADGE[selectedRole.niveau] ?? NIVEAU_BADGE[5];
                      return (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: nv.bg, color: nv.text }}>
                          N{selectedRole.niveau}
                        </span>
                      );
                    })()}
                    {selectedRole.is_system && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                        <Lock size={9} />
                        {tlx('system')}
                      </span>
                    )}
                  </div>
                  {selectedRole.description && (
                    <p className="text-xs text-white/70 mt-1">{selectedRole.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-white/60 hover:text-white cursor-pointer transition-colors ml-3 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* System notice */}
              {selectedRole.is_system && (
                <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-[#FFF7ED] rounded-lg border border-[#FED7AA] flex-shrink-0">
                  <AlertCircle size={14} color="#C2410C" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#9A3412]">
                    {tlx('sys_notice')}
                  </p>
                </div>
              )}

              {/* Permission section title */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9] flex-shrink-0">
                <p className="text-sm font-semibold text-[#0D1F3C]">{tlx('assigned_perms')}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
                  {checkedIds.size} {tlx('selected')}
                </span>
              </div>

              {/* Permissions list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {groupedLoading ? (
                  [0,1,2].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-5 bg-[#E2E8F0] rounded w-24 animate-pulse" />
                      {[0,1,2].map(j => <div key={j} className="h-9 bg-[#F1F5F9] rounded-lg animate-pulse" />)}
                    </div>
                  ))
                ) : (
                  Object.entries(grouped).map(([module, perms]) => {
                    const mc = MODULE_COLORS[module] ?? { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', headerBg: '#F8FAFC' };
                    return (
                      <div key={module}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                            style={{ backgroundColor: mc.bg, color: mc.text, borderColor: mc.border }}
                          >
                            {module}
                          </span>
                          <div className="flex-1 h-px bg-[#F1F5F9]" />
                        </div>
                        <div className="space-y-1">
                          {perms.map(perm => (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-100 ${
                                selectedRole.is_system
                                  ? 'opacity-60 cursor-not-allowed bg-[#F8FAFC] border-transparent'
                                  : checkedIds.has(perm.id)
                                  ? 'bg-[#EFF6FF] border-[#BFDBFE] cursor-pointer'
                                  : 'bg-white border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0] cursor-pointer'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checkedIds.has(perm.id)}
                                onChange={() => !selectedRole.is_system && togglePerm(perm.id)}
                                disabled={selectedRole.is_system}
                                className="w-3.5 h-3.5 rounded accent-[#0D1F3C] flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-[#0D1F3C] truncate">{perm.label}</p>
                                <p className="text-[10px] font-mono text-[#9CA3AF] truncate">{perm.name}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Save button */}
              {!selectedRole.is_system && (
                <div className="px-4 pb-4 pt-3 border-t border-[#F1F5F9] flex-shrink-0">
                  <button
                    onClick={() => syncMut.mutate({ roleId: selectedRole.id, ids: Array.from(checkedIds) })}
                    disabled={syncMut.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: '#C9A84C' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b8923e')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C9A84C')}
                  >
                    <Save size={15} />
                    {syncMut.isPending ? tlx('saving') : tlx('save_perms')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — CATALOGUE DES PERMISSIONS
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'permissions' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Module filter tabs */}
          {!groupedLoading && catalogueModules.length > 0 && (
            <div className="bg-white border-b border-[#E2E8F0] px-6 py-3 flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => setCatalogueModule('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  catalogueModule === 'all'
                    ? 'bg-[#0D1F3C] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F8FAFC]'
                }`}
              >
                {tlx('all')} ({totalPermCount})
              </button>
              {catalogueModules.map(m => {
                const mc = MODULE_COLORS[m];
                const count = grouped[m]?.length ?? 0;
                return (
                  <button
                    key={m}
                    onClick={() => setCatalogueModule(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      catalogueModule === m ? 'text-white' : 'bg-white text-[#6B7280] hover:bg-[#F8FAFC]'
                    }`}
                    style={catalogueModule === m
                      ? { backgroundColor: mc?.text ?? '#0D1F3C', borderColor: mc?.text ?? '#0D1F3C' }
                      : { borderColor: '#E2E8F0' }
                    }
                  >
                    {MODULE_LABELS_TR[m]?.[lang] ?? m} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-6">
            {groupedLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : visibleModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
                <Lock size={40} className="mb-3 opacity-30" />
                <p className="font-medium">{tlx('no_perms')}</p>
              </div>
            ) : (
              visibleModules.map(module => {
                const perms = grouped[module] ?? [];
                const mc = MODULE_COLORS[module];
                return (
                  <div key={module} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 overflow-hidden">

                    {/* Card header — #0D1F3C fond, texte blanc */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ background: '#0D1F3C' }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                          style={mc
                            ? { backgroundColor: mc.bg, color: mc.text, borderColor: mc.border }
                            : { backgroundColor: '#F1F5F9', color: '#475569', borderColor: '#E2E8F0' }
                          }
                        >
                          {module}
                        </span>
                        <span className="text-sm font-bold text-white uppercase tracking-wide">
                          {MODULE_LABELS_TR[module]?.[lang] ?? module}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                        {perms.length} {perms.length !== 1 ? tlx('subtitle_perms_p') : tlx('subtitle_perms')}
                      </span>
                    </div>

                    {/* Inner table */}
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[40%]">
                            {tlx('col_id')}
                          </th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[35%]">
                            {tlx('col_label')}
                          </th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell w-[25%]">
                            {tlx('col_desc')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        {perms.map((perm, idx) => (
                          <tr
                            key={perm.id}
                            className={`transition-colors hover:bg-[#EFF6FF] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}`}
                          >
                            <td className="px-5 py-3">
                              <span className="font-mono text-xs bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">
                                {perm.name}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-medium text-[#0D1F3C] text-sm">{perm.label}</span>
                            </td>
                            <td className="px-5 py-3 hidden md:table-cell">
                              <span className="text-sm text-[#9CA3AF] italic">{perm.description ?? '—'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Create modal ── */}
      {showCreate && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ background: '#0D1F3C' }}>
              <div className="flex items-center gap-2">
                <Plus size={16} color="white" />
                <h2 className="text-sm font-bold text-white">{tlx('new_role')}</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-white/60 hover:text-white cursor-pointer transition-colors">
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
