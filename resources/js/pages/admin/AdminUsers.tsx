import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Edit2, Trash2, Lock, Unlock, Key, X, Building2, Briefcase, Loader2, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';

interface Department { id: number; code: string; name: string; }
interface Role { id: number; nom_role: string; label: string; niveau: number; }
interface PositionOption { id: number; title: string; department_id: number | null; }
interface AdminUser {
  id: number; nom: string; prenom: string; email: string;
  statut: string; created_at: string;
  department: Department | null; department_id: number | null;
  role: Role | null;
  /** Resolved position title — from accessor (normalized or legacy string) */
  position: string | null;
  position_id: number | null;
}
interface FormData {
  nom: string; prenom: string; email: string; password: string;
  department_code: string; poste: string; role_nom: string; statut: string;
}

const DEPT_TRANSLATIONS: Record<string, Record<string,string>> = {
  'Administration':     { fr:'Administration',    en:'Administration',        ar:'الإدارة' },
  'Direction':          { fr:'Direction',          en:'Direction',             ar:'الإدارة العامة' },
  'Service Commercial': { fr:'Service Commercial', en:'Commercial Department', ar:'القسم التجاري' },
  'Service Financier':  { fr:'Service Financier',  en:'Finance Department',    ar:'القسم المالي' },
  'Service Logistique': { fr:'Service Logistique', en:'Logistics Department',  ar:'قسم اللوجستيك' },
};
const NIVEAU_LABELS: Record<number, Record<string,string>> = {
  3: { fr:'Responsable', en:'Manager',   ar:'مسؤول' },
  4: { fr:'Agent',       en:'Agent',     ar:'عون' },
  5: { fr:'Secrétaire',  en:'Secretary', ar:'أمين السر' },
};
const STATUS_META: Record<string,{fr:string;en:string;ar:string;ring:string;dot:string;text:string;bg:string}> = {
  ACTIF:                  { fr:'Actif',                    en:'Active',             ar:'نشط',                    ring:'ring-emerald-200', dot:'bg-emerald-500', text:'text-emerald-700', bg:'bg-emerald-50' },
  SUSPENDU:               { fr:'Suspendu',                 en:'Suspended',          ar:'موقوف',                  ring:'ring-red-200',     dot:'bg-red-500',     text:'text-red-700',     bg:'bg-red-50' },
  VERROUILLE:             { fr:'Verrouillé',              en:'Locked',             ar:'مقفل',                   ring:'ring-orange-200',  dot:'bg-orange-500',  text:'text-orange-700',  bg:'bg-orange-50' },
  REJETE:                 { fr:'Rejeté',                  en:'Rejected',           ar:'مرفوض',                  ring:'ring-rose-200',    dot:'bg-rose-500',    text:'text-rose-700',    bg:'bg-rose-50' },
  EN_ATTENTE_VALIDATION:  { fr:'En attente',               en:'Pending',            ar:'قيد التحقق',             ring:'ring-yellow-200',  dot:'bg-yellow-400',  text:'text-yellow-700',  bg:'bg-yellow-50' },
  APPROUVE:               { fr:'Approuvé',               en:'Approved',           ar:'معتمد',                  ring:'ring-teal-200',    dot:'bg-teal-500',    text:'text-teal-700',    bg:'bg-teal-50' },
};
const DEPT_GRADIENT: Record<string,string> = {
  COM:'from-blue-500 to-blue-600',     FIN:'from-emerald-500 to-emerald-600',
  LOG:'from-amber-500 to-amber-600',   ADMIN:'from-purple-500 to-purple-600',
  DIR:'from-indigo-500 to-indigo-600', '':'from-gray-400 to-gray-500',
};
const DEPT_BADGE: Record<string,string> = {
  COM:'bg-blue-50 text-blue-700',     FIN:'bg-emerald-50 text-emerald-700',
  LOG:'bg-amber-50 text-amber-700',   ADMIN:'bg-purple-50 text-purple-700',
  DIR:'bg-indigo-50 text-indigo-700', '':'bg-gray-100 text-gray-600',
};
const LABEL_TO_CODE: Record<string,string> = {
  commercial:'COM', financier:'FIN', logistique:'LOG',
  admin:'ADMIN', administrateur:'ADMIN', directeur:'DIR',
};
const EMPTY_FORM: FormData = { nom:'', prenom:'', email:'', password:'', department_code:'', poste:'', role_nom:'', statut:'ACTIF' };

const TABLE_HEADERS: Record<string, string[]> = {
  fr: ['Utilisateur', 'Service', 'Poste', 'Statut', 'Créé le', 'Actions'],
  en: ['User', 'Department', 'Position', 'Status', 'Created', 'Actions'],
  ar: ['المستخدم', 'القسم', 'المنصب', 'الحالة', 'تاريخ الإنشاء', 'إجراءات'],
};

const FILTER_LABELS = {
  all_services:  { fr:'Tous les services',  en:'All departments', ar:'جميع الأقسام' },
  all_positions: { fr:'Tous les postes',    en:'All positions',   ar:'جميع المناصب' },
  all_statuses:  { fr:'Tous les statuts',   en:'All statuses',    ar:'جميع الحالات' },
  search:        { fr:'Rechercher...',      en:'Search...',       ar:'بحث...' },
};

const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  create_success: { fr: 'Utilisateur créé avec succès', en: 'User created successfully', ar: 'تم إنشاء المستخدم بنجاح' },
  edit_success: { fr: 'Utilisateur modifié avec succès', en: 'User edited successfully', ar: 'تم تعديل المستخدم بنجاح' },
  delete_success: { fr: 'Utilisateur supprimé avec succès', en: 'User deleted successfully', ar: 'تم حذف المستخدم بنجاح' },
  delete_error: { fr: 'Erreur lors de la suppression', en: 'Error deleting user', ar: 'خطأ أثناء الحذف' },
  block_success: { fr: 'Utilisateur suspendu', en: 'User suspended', ar: 'تم تعليق حساب المستخدم' },
  unblock_success: { fr: 'Utilisateur activé', en: 'User activated', ar: 'تم تفعيل حساب المستخدم' },
  block_error: { fr: 'Erreur lors du blocage', en: 'Error blocking user', ar: 'خطأ أثناء التعليق' },
  reset_success: { fr: 'Mot de passe réinitialisé', en: 'Password reset successfully', ar: 'تم تغيير كلمة المرور' },
  reset_error: { fr: 'Erreur lors de la réinitialisation', en: 'Error resetting password', ar: 'خطأ أثناء إعادة التعيين' },
  reset_title: { fr: 'Changer le mot de passe', en: 'Change Password', ar: 'تغيير كلمة المرور' },
  reset_desc: { fr: 'Définir un nouveau mot de passe pour', en: 'Set a new password for', ar: 'تعيين كلمة مرور جديدة لـ' },
  new_pass: { fr: 'Nouveau mot de passe', en: 'New password', ar: 'كلمة المرور الجديدة' },
  reset_confirm: { fr: 'Réinitialiser', en: 'Reset', ar: 'إعادة تعيين' },
  temp_pass_msg: { fr: 'Mot de passe temporaire généré', en: 'Temporary password generated', ar: 'كلمة المرور المؤقتة' },
  copy: { fr: 'Copier', en: 'Copy', ar: 'نسخ' },
  copied: { fr: 'Copié !', en: 'Copied!', ar: 'تم النسخ!' },
  confirm_del_title: { fr: 'Confirmer la suppression', en: 'Confirm deletion', ar: 'تأكيد الحذف' },
  confirm_del_desc: { fr: "Êtes-vous sûr de vouloir supprimer l'utilisateur", en: 'Are you sure you want to delete user', ar: 'هل أنت متأكد من حذف المستخدم' },
  cancel: { fr: 'Annuler', en: 'Cancel', ar: 'إلغاء' },
  delete: { fr: 'Supprimer', en: 'Delete', ar: 'حذف' },
  edit_title: { fr: 'Modifier utilisateur', en: 'Edit user', ar: 'تعديل المستخدم' },
  new_title: { fr: 'Nouvel utilisateur', en: 'New user', ar: 'مستخدم جديد' },
  save: { fr: 'Enregistrer', en: 'Save', ar: 'حفظ' },
  create: { fr: 'Créer', en: 'Create', ar: 'إنشاء' },
  pass_req: { fr: 'Mot de passe obligatoire', en: 'Password required', ar: 'كلمة المرور مطلوبة' },
  pos_req: { fr: 'Veuillez sélectionner un poste', en: 'Please select a position', ar: 'يرجى تحديد المنصب' },
  no_users: { fr: 'Aucun utilisateur trouvé', en: 'No users found', ar: 'لم يتم العثور على مستخدمين' },
  nom: { fr: 'Nom', en: 'Last Name', ar: 'اللقب' },
  prenom: { fr: 'Prénom', en: 'First Name', ar: 'الاسم' },
  pass: { fr: 'Mot de passe', en: 'Password', ar: 'كلمة المرور' },
  pass_hint: { fr: '(laisser vide = inchangé)', en: '(leave blank = unchanged)', ar: '(اتركه فارغاً = بدون تغيير)' },
  service: { fr: 'Service', en: 'Department', ar: 'القسم' },
  poste: { fr: 'Poste', en: 'Position', ar: 'المنصب' },
  statut: { fr: 'Statut', en: 'Status', ar: 'الحالة' },
  sel_service: { fr: 'Sélectionner un service', en: 'Select a department', ar: 'اختر قسم' },
  sel_poste: { fr: 'Sélectionner un poste', en: 'Select a position', ar: 'اختر منصب' },
  users: { fr: 'Utilisateurs', en: 'Users', ar: 'المستخدمين' },
  members: { fr: 'membres', en: 'members', ar: 'أعضاء' },
  error_load: { fr: 'Erreur de chargement', en: 'Loading error', ar: 'خطأ في التحميل' },
  retry: { fr: 'Réessayer', en: 'Retry', ar: 'إعادة المحاولة' },
  active: { fr: 'Actif', en: 'Active', ar: 'نشط' },
  suspended: { fr: 'Suspendu', en: 'Suspended', ar: 'موقوف' },
  locked: { fr: 'Verrouillé', en: 'Locked', ar: 'مقفل' },
  close: { fr: 'Fermer', en: 'Close', ar: 'إغلاق' },
};

export default function AdminUsers() {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0]?.split('_')[0] ?? 'fr') as 'fr'|'en'|'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [niveauFilter, setNiveauFilter] = useState<number|''>('');
  const [statFilter, setStatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser|null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resettingId, setResettingId] = useState<number|null>(null);
  const [blockingId, setBlockingId] = useState<number|null>(null);
  const [deletingId, setDeletingId] = useState<number|null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser|null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  // Password reset modal state
  const [resetTarget, setResetTarget] = useState<AdminUser|null>(null);
  const [resetPwd, setResetPwd] = useState('');
  const [generatedPwd, setGeneratedPwd] = useState<string|null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setNiveauFilter('');
    setStatFilter('');
  };

  /* ── Data helpers ── */
  const safeArray = (res: any): any[] => {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.departments)) return d.departments;
    return [];
  };

  const { data: allUsers = [], isLoading, isError } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: async () => safeArray(await adminService.getUsers()),
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: async () => safeArray(await adminService.getDepartments()),
    select: (d: unknown): Department[] =>
      Array.isArray(d) ? d : (d as any)?.data ?? [],
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => safeArray(await adminService.getRoles()),
  });

  const { data: allPositions = [] } = useQuery<PositionOption[]>({
    queryKey: ['admin-positions'],
    queryFn: async () => {
      const res = await adminService.getPositions();
      const d = res?.data;
      if (Array.isArray(d?.positions)) return d.positions;
      if (Array.isArray(d)) return d;
      return [];
    },
    retry: false,
    initialData: { positions: [] },
  });

  /* ── Derived ── */
  // Positions filtered by the currently selected department (or all if none selected)
  const availablePositions = useMemo<PositionOption[]>(() => {
    if (!form.department_code) return allPositions;
    const dept = departments.find(d => d.code === form.department_code);
    if (!dept) return allPositions;
    return allPositions.filter(p => p.department_id === dept.id || p.department_id === null);
  }, [allPositions, departments, form.department_code]);

  // Keep roles dropdown for system access level — exclude client role from staff modal
  const availableRolesForModal = roles.filter(r => r.niveau !== 6);

  const filtered = useMemo(() => {
    let list = [...allUsers];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.nom.toLowerCase().includes(q) ||
        u.prenom.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (deptFilter) {
      list = list.filter(u =>
        u.department?.code === deptFilter ||
        String(u.department_id) === String(deptFilter)
      );
    }
    if (niveauFilter !== '') {
      list = list.filter(u => Number(u.role?.niveau) === Number(niveauFilter));
    }
    if (statFilter) {
      list = list.filter(u =>
        u.statut?.trim().toUpperCase() === statFilter.trim().toUpperCase()
      );
    }
    return list;
  }, [allUsers, search, deptFilter, niveauFilter, statFilter]);

  /* ── Mutations ── */
  const resetMut = useMutation({
    mutationFn: ({ id, password }: { id: number; password?: string }) =>
      adminService.resetPassword(id, password),
    onMutate: ({ id }) => setResettingId(id),
    onSuccess: (res: any) => {
      const newPwd = res?.data?.new_password;
      if (newPwd) setGeneratedPwd(newPwd);
      showToast(TEXTS.reset_success[lang], 'success');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? TEXTS.reset_error[lang], 'error'),
    onSettled: () => setResettingId(null),
  });

  const blockMut = useMutation({
    mutationFn: (id: number) => adminService.blockUser(id),
    onMutate: (id) => setBlockingId(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: (err: any) => showToast(err?.response?.data?.message ?? TEXTS.block_error[lang], 'error'),
    onSettled: () => setBlockingId(null),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: (error: any) => {
      alert(error?.response?.data?.message ?? 'Impossible de supprimer cet utilisateur.');
    },
    onSettled: () => setDeletingId(null),
  });

  const saveMut = useMutation({
    mutationFn: (payload: any) =>
      editingUser ? adminService.updateUser(editingUser.id, payload) : adminService.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-positions'] }); // refresh in case a new position was auto-created
      showToast(editingUser ? TEXTS.edit_success[lang] : TEXTS.create_success[lang], 'success');
      closeModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? 'Erreur';
      showToast(msg, 'error');
    },
    onSettled: () => setIsSubmitting(false),
  });

  /* ── Helpers ── */
  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;
  const tl = (rec: Record<string,string>) => rec[lang] ?? rec['fr'] ?? '';

  const translateDept = (name: string | null) =>
    name ? (DEPT_TRANSLATIONS[name]?.[lang] ?? name) : '—';

  const translateStatus = (s: string) => {
    const m = STATUS_META[s];
    return m ? tl(m) : s;
  };

  const translateNiveau = (n: number) => {
    const m = NIVEAU_LABELS[n];
    return m ? tl(m) : `Niveau ${n}`;
  };

  const getNiveauLabel = (user: AdminUser): string => {
    if (!user.role) return '';
    const label = user.role.label?.toLowerCase();
    if (label === 'client')    return lang === 'ar' ? 'عميل'       : lang === 'en' ? 'Client'      : 'Client';
    if (label === 'directeur') return lang === 'ar' ? 'مدير'       : lang === 'en' ? 'Director'    : 'Directeur';
    if (label === 'admin' || label === 'administrateur')
                               return lang === 'ar' ? 'مدير النظام': lang === 'en' ? 'System Admin' : 'Administrateur';
    return NIVEAU_LABELS[user.role.niveau] ? tl(NIVEAU_LABELS[user.role.niveau]) : '';
  };

  const initials = (u: AdminUser) =>
    `${u.nom?.[0] ?? ''}${u.prenom?.[0] ?? ''}`.toUpperCase();

  const isClient = (u: AdminUser | null) => {
    if (!u) return false;
    return u.role?.label?.toLowerCase() === 'client' || u.role?.niveau === 6;
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '',
      department_code: user.department?.code ?? '',
      poste: user.position ?? '',          // normalized position title (from accessor or legacy)
      role_nom: user.role?.nom_role ?? '', // system role stays separate
      statut: user.statut,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
  };

  const openResetModal = (user: AdminUser) => {
    setResetTarget(user);
    setResetPwd('');
    setGeneratedPwd(null);
    setCopied(false);
  };

  const closeResetModal = () => {
    setResetTarget(null);
    setResetPwd('');
    setGeneratedPwd(null);
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResetSubmit = () => {
    if (!resetTarget) return;
    resetMut.mutate({ id: resetTarget.id, password: resetPwd || undefined });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    const payload: any = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      statut: form.statut,
    };
    if (form.password) payload.password = form.password;

    if (!editingUser || !isClient(editingUser)) {
      const selectedRole = roles.find(r => r.nom_role === form.role_nom);
      const selectedDept = departments.find(d => d.code === form.department_code);

      if (selectedRole) payload.role_id = selectedRole.id;
      if (selectedDept) payload.department_id = selectedDept.id;
      if (form.poste)   payload.position    = form.poste;  // position title → backend normalizes to position_id

      if (!editingUser && !payload.role_id) {
        setIsSubmitting(false);
        return showToast(tlx('pos_req'), 'error');
      }
    }
    
    saveMut.mutate(payload);
  };

  /* ── Guards ── */
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-[#0D1F3C]" />
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-red-600 font-medium">{tlx('error_load')}</p>
      <button
        onClick={() => qc.invalidateQueries({ queryKey: ['admin-users'] })}
        className="px-4 py-2 bg-[#0D1F3C] text-white rounded-lg text-sm hover:bg-[#1a3360] transition"
      >
        {tlx('retry')}
      </button>
    </div>
  );

  /* ── Render ── */
  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${toast.type === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'} animate-in fade-in slide-in-from-top-6 duration-300`}>
          <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm ${toast.type === 'success' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertCircle className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <p className="text-[15px] font-semibold pr-2">{toast.message}</p>
          <button onClick={() => setToast(null)} className={`ml-1 p-1.5 rounded-xl opacity-60 hover:opacity-100 transition ${toast.type === 'success' ? 'hover:bg-[#dcfce7]' : 'hover:bg-[#fee2e2]'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">{tlx('users')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} / {allUsers.length} {t('admin.users.members_count')}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1F3C] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3360] transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {tlx('new_title')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('admin.users.search_placeholder')}
              className={`w-full py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          {/* Service */}
          <div className="relative min-w-[170px]">
            <Building2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setNiveauFilter(''); }}
              className={`w-full appearance-none py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'}`}
            >
              <option value="">{t('admin.users.all_services')}</option>
              {departments.map(d => (
                <option key={d.id} value={d.code}>{translateDept(d.name)}</option>
              ))}
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>

          {/* Poste niveau */}
          <div className="relative">
            <select
              value={niveauFilter}
              onChange={e => setNiveauFilter(e.target.value === '' ? '' : Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] bg-white min-w-[150px]"
            >
              <option value="">{t('admin.users.all_positions')}</option>
              <option value={3}>{NIVEAU_LABELS[3][lang]}</option>
              <option value={4}>{NIVEAU_LABELS[4][lang]}</option>
              <option value={5}>{NIVEAU_LABELS[5][lang]}</option>
            </select>
          </div>

          {/* Statut */}
          <div className="relative min-w-[150px]">
            <select
              value={statFilter}
              onChange={e => setStatFilter(e.target.value)}
              className={`w-full appearance-none py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'pr-3 pl-8' : 'pl-3 pr-8'}`}
            >
              <option value="">{t('admin.users.all_statuses')}</option>
              <option value="ACTIF">{translateStatus('ACTIF')}</option>
              <option value="SUSPENDU">{translateStatus('SUSPENDU')}</option>
              <option value="VERROUILLE">{translateStatus('VERROUILLE')}</option>
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>

          {/* Reset filters */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 cursor-pointer whitespace-nowrap"
          >
            {t('admin.users.reset_filters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div>
          <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_user')}</th>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_service')}</th>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_position')}</th>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_status')}</th>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_created')}</th>
                <th className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>{t('admin.users.col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="w-8 h-8 opacity-40" />
                      <span className="text-sm">{tlx('no_users')}</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(user => {
                const code = user.department?.code ?? '';
                const gradient = DEPT_GRADIENT[code] ?? DEPT_GRADIENT[''];
                const badge = DEPT_BADGE[code] ?? DEPT_BADGE[''];
                const sm = STATUS_META[user.statut];

                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Utilisateur — avatar + name + email */}
                    <td className={`px-3 py-3`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm`}>
                          {initials(user)}
                        </div>
                        <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <p className="font-semibold text-gray-800 text-xs leading-tight truncate">{user.nom} {user.prenom}</p>
                          <p className="text-[11px] text-gray-400 font-mono leading-tight mt-0.5 truncate" dir="ltr">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className={`px-3 py-3 truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge}`}>
                        {translateDept(user.department?.name ?? null)}
                      </span>
                    </td>

                    {/* Poste */}
                    <td className={`px-3 py-3 truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                      <p className="font-medium text-gray-800 text-xs leading-tight truncate">
                        {user.position ?? user.role?.nom_role ?? '—'}
                      </p>
                      {user.role?.nom_role && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{user.role.nom_role}</p>
                      )}
                    </td>

                    {/* Statut */}
                    <td className={`px-3 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {sm ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${sm.bg} ${sm.text} ${sm.ring}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sm.dot}`} />
                          {tl(sm)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{user.statut}</span>
                      )}
                    </td>

                    {/* Créé le */}
                    <td className={`px-3 py-3 text-xs text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang) : '—'}
                    </td>

                    {/* Actions */}
                    <td className={`px-3 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(user)}
                          title={t('admin.users.edit')}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset password */}
                        <button
                          onClick={() => openResetModal(user)}
                          disabled={resettingId === user.id}
                          title={tlx('reset_title')}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-400 hover:text-indigo-700 transition disabled:opacity-40"
                        >
                          {resettingId === user.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Key className="w-3.5 h-3.5" />
                          }
                        </button>

                        {/* Block / unblock */}
                        <button
                          onClick={() => blockMut.mutate(user.id)}
                          disabled={blockingId === user.id}
                          className={`text-xs px-2 py-1 rounded transition font-medium whitespace-nowrap
                            ${user.statut === 'ACTIF'
                              ? 'bg-red-50 hover:bg-red-100 text-red-600'
                              : 'bg-green-50 hover:bg-green-100 text-green-600'
                            }`}
                        >
                          {blockingId === user.id
                            ? '...'
                            : user.statut === 'ACTIF' ? t('admin.users.block') : t('admin.users.unblock')}
                        </button>

                        {/* Delete */}
                        {user.role?.nom_role !== 'Administrateur Système' && (
                          <button
                            onClick={() => setUserToDelete(user)}
                            disabled={deletingId === user.id}
                            title={t('common.delete')}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-700 transition disabled:opacity-40"
                          >
                            {deletingId === user.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center transform transition-all">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{tlx('confirm_del_title')}</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {tlx('confirm_del_desc')} <br/>
              <span className="font-semibold text-gray-800">{userToDelete.nom} {userToDelete.prenom}</span> ?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {tlx('cancel')}
              </button>
              <button
                onClick={() => {
                  deleteMut.mutate(userToDelete.id);
                  setUserToDelete(null);
                }}
                disabled={deletingId === userToDelete.id}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                {tlx('delete')}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Password Reset Modal ── */}
      {resetTarget && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setResetTarget(null); }}
        >
          <div className="bg-white w-full max-w-sm max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1 min-h-0 p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{tlx('reset_title')}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{resetTarget.nom} {resetTarget.prenom}</p>
                </div>
              </div>
              <button onClick={closeResetModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated password result box */}
            {generatedPwd && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-indigo-500 font-medium mb-0.5">{tlx('temp_pass_msg')}</p>
                  <p className="font-mono text-indigo-900 font-bold text-base tracking-widest">{generatedPwd}</p>
                </div>
                <button
                  onClick={() => handleCopy(generatedPwd)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium"
                >
                  {copied ? <><Check className="w-3 h-3" />{tlx('copied')}</> : <>{tlx('copy')}</>}
                </button>
              </div>
            )}

            {/* If no generated pwd yet, show input */}
            {!generatedPwd && (
              <>
                <p className="text-sm text-gray-500">
                  {tlx('reset_desc')} <span className="font-semibold text-gray-700">{resetTarget.nom} {resetTarget.prenom}</span>.
                  <br/><span className="text-xs text-gray-400">{tlx('pass_hint')}</span>
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('new_pass')}</label>
                  <input
                    type="text"
                    value={resetPwd}
                    onChange={e => setResetPwd(e.target.value)}
                    placeholder="(laisser vide = générer automatiquement)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-500"
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeResetModal}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {generatedPwd ? tlx('close') : tlx('cancel')}
              </button>
              {!generatedPwd && (
                <button
                  onClick={handleResetSubmit}
                  disabled={resettingId === resetTarget.id}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resettingId === resetTarget.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {tlx('reset_confirm')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
      )}

      {/* Modal User Form */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-[#0D1F3C]">
                {editingUser ? tlx('edit_title') : tlx('new_title')}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Nom + Prénom */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('nom')} *</label>
                    <input
                      type="text"
                      required
                      value={form.nom}
                      onChange={e => setForm(f => ({...f, nom: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('prenom')} *</label>
                    <input
                      type="text"
                      required
                      value={form.prenom}
                      onChange={e => setForm(f => ({...f, prenom: e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {tlx('pass')} {editingUser ? <span className="font-normal text-gray-400">{tlx('pass_hint')}</span> : '*'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.password}
                    onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    placeholder={editingUser ? '••••••••' : ''}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]"
                  />
                </div>

                {/* Service + Poste (staff only) */}
                {(!editingUser || !isClient(editingUser)) && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('service')} *</label>
                      <div className="relative">
                        <select
                          required={!editingUser}
                          value={form.department_code}
                          onChange={e => setForm(f => ({...f, department_code: e.target.value, poste: ''}))}
                          className={`w-full appearance-none border border-gray-200 rounded-lg py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'px-3 pl-8' : 'px-3 pr-8'}`}
                        >
                          <option value="">{tlx('sel_service')}</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.code}>{translateDept(d.name)}</option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
                      </div>
                    </div>

                    {/* Poste (normalized position) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('poste')}</label>
                      <div className="relative">
                        <select
                          value={form.poste}
                          onChange={e => setForm(f => ({...f, poste: e.target.value}))}
                          className={`w-full appearance-none border border-gray-200 rounded-lg py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'px-3 pl-8' : 'px-3 pr-8'}`}
                        >
                          <option value="">{tlx('sel_poste')}</option>
                          {availablePositions.map(p => (
                            <option key={p.id} value={p.title}>{p.title}</option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
                      </div>
                    </div>

                    {/* Rôle système (access level) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t('admin.users.field_role')} *
                      </label>
                      <div className="relative">
                        <select
                          required={!editingUser}
                          value={form.role_nom}
                          onChange={e => setForm(f => ({...f, role_nom: e.target.value}))}
                          className={`w-full appearance-none border border-gray-200 rounded-lg py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'px-3 pl-8' : 'px-3 pr-8'}`}
                        >
                          <option value="">{t('admin.users.select_role')}</option>
                          {availableRolesForModal.map(r => (
                            <option key={r.id} value={r.nom_role}>{r.nom_role}</option>
                          ))}
                        </select>
                        <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
                      </div>
                    </div>
                  </>
                )}

                {/* Statut */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{tlx('statut')} *</label>
                  <div className="relative">
                    <select
                      required
                      value={form.statut}
                      onChange={e => setForm(f => ({...f, statut: e.target.value}))}
                      className={`w-full appearance-none border border-gray-200 rounded-lg py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'px-3 pl-8' : 'px-3 pr-8'}`}
                    >
                      <option value="ACTIF">{tlx('active')}</option>
                      <option value="SUSPENDU">{tlx('suspended')}</option>
                      <option value="VERROUILLE">{tlx('locked')}</option>
                    </select>
                    <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 justify-end shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {tlx('cancel')}
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-semibold bg-[#0D1F3C] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50 transition flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingUser ? tlx('save') : tlx('create')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
