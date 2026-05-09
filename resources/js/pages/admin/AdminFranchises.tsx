import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, X, Clock, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TypeConteneur  { id: number; code_type: string; libelle: string; }
interface PortItem       { id: number; nom_port: string; code_port: string; }
interface ClientItem     { id: number; raison_sociale: string; }

interface Franchise {
  id: number;
  type_franchise: 'DEMURRAGE' | 'DETENTION';
  type_conteneur_id: number;
  type_conteneur: TypeConteneur | null;
  port_id: number | null;
  port: PortItem | null;
  client_id: number | null;
  client: ClientItem | null;
  jours_franchise: number;
  description: string | null;
  date_debut_validite: string;
  date_fin_validite: string | null;
  actif: boolean;
}

interface FranchiseForm {
  type_franchise: string;
  type_conteneur_id: string;
  port_id: string;
  client_id: string;
  jours_franchise: string;
  description: string;
  date_debut_validite: string;
  date_fin_validite: string;
  actif: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM: FranchiseForm = {
  type_franchise: 'DEMURRAGE',
  type_conteneur_id: '',
  port_id: '',
  client_id: '',
  jours_franchise: '',
  description: '',
  date_debut_validite: '',
  date_fin_validite: '',
  actif: true,
};

const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  title:            { fr: 'Franchises',                          en: 'Free Days',                         ar: 'أيام الإعفاء' },
  subtitle:         { fr: 'franchises',                          en: 'free day rules',                    ar: 'قواعد' },
  new_title:        { fr: 'Nouvelle franchise',                  en: 'New free day rule',                 ar: 'قاعدة جديدة' },
  edit_title:       { fr: 'Modifier la franchise',               en: 'Edit free day rule',                ar: 'تعديل القاعدة' },
  create:           { fr: 'Créer',                               en: 'Create',                            ar: 'إنشاء' },
  save:             { fr: 'Enregistrer',                         en: 'Save',                              ar: 'حفظ' },
  cancel:           { fr: 'Annuler',                             en: 'Cancel',                            ar: 'إلغاء' },
  delete:           { fr: 'Supprimer',                           en: 'Delete',                            ar: 'حذف' },
  search:           { fr: 'Rechercher...',                       en: 'Search...',                         ar: 'بحث...' },
  all_types:        { fr: 'Tous les types',                      en: 'All types',                         ar: 'جميع الأنواع' },
  all_statuses:     { fr: 'Tous les statuts',                    en: 'All statuses',                      ar: 'جميع الحالات' },
  reset_filters:    { fr: 'Réinitialiser',                       en: 'Reset',                             ar: 'إعادة تعيين' },
  no_franchises:    { fr: 'Aucune franchise trouvée',            en: 'No free day rules found',           ar: 'لم يتم العثور على قواعد' },
  error_load:       { fr: 'Erreur de chargement',                en: 'Loading error',                     ar: 'خطأ في التحميل' },
  retry:            { fr: 'Réessayer',                           en: 'Retry',                             ar: 'إعادة المحاولة' },
  create_ok:        { fr: 'Franchise créée',                     en: 'Rule created',                      ar: 'تم إنشاء القاعدة' },
  update_ok:        { fr: 'Franchise mise à jour',               en: 'Rule updated',                      ar: 'تم تحديث القاعدة' },
  delete_ok:        { fr: 'Franchise supprimée',                 en: 'Rule deleted',                      ar: 'تم حذف القاعدة' },
  confirm_del:      { fr: 'Confirmer la suppression',            en: 'Confirm deletion',                  ar: 'تأكيد الحذف' },
  confirm_del_msg:  { fr: 'Supprimer la franchise',              en: 'Delete rule',                       ar: 'حذف القاعدة' },
  f_type:           { fr: 'Type de franchise',                   en: 'Free day type',                     ar: 'نوع الإعفاء' },
  f_conteneur:      { fr: 'Type de conteneur',                   en: 'Container type',                    ar: 'نوع الحاوية' },
  f_port:           { fr: 'Port (laisser vide = tous les ports)','en': 'Port (leave empty = all ports)',  ar: 'الميناء (اتركه فارغاً = جميع الموانئ)' },
  f_client:         { fr: 'Client (laisser vide = tous les clients)', en: 'Client (leave empty = all clients)', ar: 'العميل (اتركه فارغاً = جميع العملاء)' },
  f_jours:          { fr: 'Jours de franchise',                  en: 'Free days',                         ar: 'أيام الإعفاء' },
  f_date_debut:     { fr: 'Date de début de validité',           en: 'Valid from',                        ar: 'صالح من' },
  f_date_fin:       { fr: 'Date de fin de validité',             en: 'Valid until',                       ar: 'صالح حتى' },
  f_description:    { fr: 'Description (optionnel)',             en: 'Description (optional)',            ar: 'الوصف (اختياري)' },
  f_actif:          { fr: 'Franchise active',                    en: 'Active rule',                       ar: 'القاعدة نشطة' },
  col_type:         { fr: 'Type',                                en: 'Type',                              ar: 'النوع' },
  col_conteneur:    { fr: 'Conteneur',                           en: 'Container',                         ar: 'الحاوية' },
  col_port:         { fr: 'Port',                                en: 'Port',                              ar: 'الميناء' },
  col_client:       { fr: 'Client',                              en: 'Client',                            ar: 'العميل' },
  col_jours:        { fr: 'Jours',                               en: 'Days',                              ar: 'الأيام' },
  col_validite:     { fr: 'Validité',                            en: 'Validity',                          ar: 'الصلاحية' },
  col_statut:       { fr: 'Statut',                              en: 'Status',                            ar: 'الحالة' },
  col_actions:      { fr: 'Actions',                             en: 'Actions',                           ar: 'إجراءات' },
  actif:            { fr: 'Actif',                               en: 'Active',                            ar: 'نشط' },
  inactif:          { fr: 'Inactif',                             en: 'Inactive',                          ar: 'غير نشط' },
  tous_ports:       { fr: 'Tous ports',                          en: 'All ports',                         ar: 'جميع الموانئ' },
  tous_clients:     { fr: 'Tous clients',                        en: 'All clients',                       ar: 'جميع العملاء' },
  sel_conteneur:    { fr: 'Sélectionner un type',                en: 'Select a type',                     ar: 'اختر نوعاً' },
  sel_port:         { fr: 'Tous les ports (défaut)',             en: 'All ports (default)',               ar: 'جميع الموانئ (افتراضي)' },
  sel_client:       { fr: 'Tous les clients (défaut)',           en: 'All clients (default)',             ar: 'جميع العملاء (افتراضي)' },
  statut_actif:     { fr: 'Actives',                             en: 'Active',                            ar: 'نشط' },
  statut_inactif:   { fr: 'Inactives',                           en: 'Inactive',                          ar: 'غير نشط' },
  demurrage_label:  { fr: 'DEMURRAGE',                           en: 'DEMURRAGE',                         ar: 'DEMURRAGE' },
  detention_label:  { fr: 'DETENTION',                           en: 'DETENTION',                         ar: 'DETENTION' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminFranchises() {
  const lang = (navigator.language?.split('-')[0] ?? 'fr') as 'fr'|'en'|'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();
  const { isAdmin } = usePermission();
  const canEdit = isAdmin;

  // ── State ──────────────────────────────────────────────────────────────────

  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statFilter,   setStatFilter]   = useState('');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState<Franchise|null>(null);
  const [form,         setForm]         = useState<FranchiseForm>(EMPTY_FORM);
  const [toDelete,     setToDelete]     = useState<Franchise|null>(null);
  const [toast,        setToast]        = useState<{msg:string;type:'success'|'error'}|null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFilters = () => { setSearch(''); setTypeFilter(''); setStatFilter(''); };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang) : '—';

  // ── Data ───────────────────────────────────────────────────────────────────

  const safeArray = (res: any, key: string): any[] => {
    const d = res?.data ?? res;
    return Array.isArray(d?.[key]) ? d[key] : Array.isArray(d) ? d : [];
  };

  const { data: allFranchises = [], isLoading, isError } = useQuery<Franchise[]>({
    queryKey: ['admin-franchises'],
    queryFn: async () => safeArray(await adminService.getFranchises(), 'franchises'),
  });

  const { data: typeConteneurs = [] } = useQuery<TypeConteneur[]>({
    queryKey: ['admin-type-conteneurs'],
    queryFn: async () => safeArray(await adminService.getTypeConteneurs(), 'types'),
    select: (data: any[]) => data.filter((t: any) => t.actif),
  });

  const { data: ports = [] } = useQuery<PortItem[]>({
    queryKey: ['admin-ports-list'],
    queryFn: async () => safeArray(await adminService.getPortsList(), 'ports'),
    select: (data: any[]) => data.filter((p: any) => p.actif),
  });

  const { data: clients = [] } = useQuery<ClientItem[]>({
    queryKey: ['admin-clients-list'],
    queryFn: async () => safeArray(await adminService.getClientsList(), 'data'),
  });

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allFranchises];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f =>
        (f.type_conteneur?.code_type ?? '').toLowerCase().includes(q) ||
        (f.port?.nom_port ?? '').toLowerCase().includes(q) ||
        (f.client?.raison_sociale ?? '').toLowerCase().includes(q)
      );
    }
    if (typeFilter)                   list = list.filter(f => f.type_franchise === typeFilter);
    if (statFilter === 'actif')       list = list.filter(f => f.actif);
    if (statFilter === 'inactif')     list = list.filter(f => !f.actif);
    return list;
  }, [allFranchises, search, typeFilter, statFilter]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      editing
        ? adminService.updateFranchise(editing.id, payload)
        : adminService.createFranchise(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-franchises'] });
      showToast(editing ? tlx('update_ok') : tlx('create_ok'));
      closeModal();
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Erreur', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteFranchise(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-franchises'] });
      showToast(tlx('delete_ok'));
      setToDelete(null);
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message ?? 'Impossible de supprimer.', 'error');
      setToDelete(null);
    },
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (f: Franchise) => {
    setEditing(f);
    setForm({
      type_franchise:      f.type_franchise,
      type_conteneur_id:   String(f.type_conteneur_id),
      port_id:             f.port_id ? String(f.port_id) : '',
      client_id:           f.client_id ? String(f.client_id) : '',
      jours_franchise:     String(f.jours_franchise),
      description:         f.description ?? '',
      date_debut_validite: f.date_debut_validite,
      date_fin_validite:   f.date_fin_validite ?? '',
      actif:               f.actif,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMut.mutate({
      type_franchise:      form.type_franchise,
      type_conteneur_id:   Number(form.type_conteneur_id),
      port_id:             form.port_id    ? Number(form.port_id)    : null,
      client_id:           form.client_id  ? Number(form.client_id)  : null,
      jours_franchise:     Number(form.jours_franchise),
      description:         form.description  || null,
      date_debut_validite: form.date_debut_validite,
      date_fin_validite:   form.date_fin_validite || null,
      actif:               form.actif,
    });
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
      <p className="text-[#8A2020] font-medium">{tlx('error_load')}</p>
      <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-franchises'] })}
        className="px-4 py-2 bg-[#0D2A5E] text-white rounded-xl text-sm font-semibold hover:bg-[#0D2A5E] transition">
        {tlx('retry')}
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
          <h1 className="text-xl font-extrabold text-[#0D2A5E]">{tlx('title')}</h1>
          <p className="text-[11px] text-[#88A8D0] mt-0.5">
            {filtered.length} / {allFranchises.length} {tlx('subtitle')}
          </p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#C8960A] text-white rounded-xl text-sm font-semibold hover:bg-[#A87A08] transition">
            <Plus className="w-4 h-4" />
            {tlx('new_title')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tlx('search')}
              className={`w-full border border-[#C5D8F5] rounded-xl py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>
          <div className="relative min-w-[160px]">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{tlx('all_types')}</option>
              <option value="DEMURRAGE">DEMURRAGE</option>
              <option value="DETENTION">DETENTION</option>
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>
          <div className="relative min-w-[150px]">
            <select value={statFilter} onChange={e => setStatFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{tlx('all_statuses')}</option>
              <option value="actif">{tlx('statut_actif')}</option>
              <option value="inactif">{tlx('statut_inactif')}</option>
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>
          <button onClick={resetFilters}
            className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
            {tlx('reset_filters')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        <table className="w-full text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_type')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_conteneur')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_port')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_client')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_jours')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_validite')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_statut')}</th>
              {canEdit && <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF5FF]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#88A8D0]">
                    <Clock className="w-8 h-8 opacity-40" />
                    <span className="text-sm">{tlx('no_franchises')}</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-[#F4F9FF] transition-colors">

                {/* Type */}
                <td className="px-4 py-3">
                  {f.type_franchise === 'DEMURRAGE' ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E0EEFF] text-[#1A4A9A]">
                      DEMURRAGE
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF3C0] text-[#7A5800]">
                      DETENTION
                    </span>
                  )}
                </td>

                {/* Conteneur */}
                <td className="px-4 py-3">
                  {f.type_conteneur ? (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#EEF5FF] text-[#0D2A5E]">
                      {f.type_conteneur.code_type}
                    </span>
                  ) : (
                    <span className="text-xs text-[#88A8D0]">—</span>
                  )}
                </td>

                {/* Port */}
                <td className="px-4 py-3">
                  {f.port ? (
                    <p className="text-xs text-[#3A5A8A] font-medium">{f.port.nom_port}</p>
                  ) : (
                    <span className="text-xs text-[#88A8D0] italic">{tlx('tous_ports')}</span>
                  )}
                </td>

                {/* Client */}
                <td className="px-4 py-3 max-w-[160px]">
                  {f.client ? (
                    <p className="text-xs text-[#3A5A8A] font-medium truncate">{f.client.raison_sociale}</p>
                  ) : (
                    <span className="text-xs text-[#88A8D0] italic">{tlx('tous_clients')}</span>
                  )}
                </td>

                {/* Jours */}
                <td className="px-4 py-3">
                  <span className="text-sm font-extrabold text-[#0D2A5E]">{f.jours_franchise}</span>
                  <span className="text-xs text-[#88A8D0] ml-1">j</span>
                </td>

                {/* Validité */}
                <td className="px-4 py-3">
                  <p className="text-xs text-[#3A5A8A]">
                    {formatDate(f.date_debut_validite)}
                    <span className="mx-1 text-[#88A8D0]">→</span>
                    {f.date_fin_validite ? formatDate(f.date_fin_validite) : <span className="text-[#88A8D0]">∞</span>}
                  </p>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  {f.actif ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FFF3C0] text-[#7A5800]">
                      {tlx('actif')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#88A8D0]">
                      {tlx('inactif')}
                    </span>
                  )}
                </td>

                {/* Actions */}
                {canEdit && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(f)} title={tlx('edit_title')}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setToDelete(f)} title={tlx('delete')}
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
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF0F0] text-[#8A2020] flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D2A5E] mb-1">{tlx('confirm_del')}</h3>
                <p className="text-sm text-[#3A5A8A]">
                  {tlx('confirm_del_msg')}{' '}
                  <span className="font-bold text-[#0D2A5E]">
                    {toDelete.type_franchise} — {toDelete.jours_franchise}j — {toDelete.type_conteneur?.code_type}
                  </span> ?
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setToDelete(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                  {tlx('cancel')}
                </button>
                <button onClick={() => deleteMut.mutate(toDelete.id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[#8A2020] text-white rounded-xl hover:bg-[#6A1010] transition disabled:opacity-50">
                  {tlx('delete')}
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
                {editing ? tlx('edit_title') : tlx('new_title')}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#88A8D0] hover:text-[#0D2A5E] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
              <form id="franchise-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Type franchise + Jours — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_type')} *</label>
                    <div className="relative">
                      <select value={form.type_franchise}
                        onChange={e => setForm(f => ({...f, type_franchise: e.target.value}))}
                        className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                        <option value="DEMURRAGE">DEMURRAGE</option>
                        <option value="DETENTION">DETENTION</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_jours')} *</label>
                    <input type="number" required min="1"
                      value={form.jours_franchise}
                      onChange={e => setForm(f => ({...f, jours_franchise: e.target.value}))}
                      placeholder="ex: 10"
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Type conteneur */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_conteneur')} *</label>
                  <div className="relative">
                    <select required value={form.type_conteneur_id}
                      onChange={e => setForm(f => ({...f, type_conteneur_id: e.target.value}))}
                      className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                      <option value="">{tlx('sel_conteneur')}</option>
                      {typeConteneurs.map(tc => (
                        <option key={tc.id} value={String(tc.id)}>{tc.libelle} — {tc.code_type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                  </div>
                </div>

                {/* Port */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_port')}</label>
                  <div className="relative">
                    <select value={form.port_id}
                      onChange={e => setForm(f => ({...f, port_id: e.target.value}))}
                      className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                      <option value="">{tlx('sel_port')}</option>
                      {ports.map(p => (
                        <option key={p.id} value={String(p.id)}>{p.nom_port} ({p.code_port})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                  </div>
                </div>

                {/* Client */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_client')}</label>
                  <div className="relative">
                    <select value={form.client_id}
                      onChange={e => setForm(f => ({...f, client_id: e.target.value}))}
                      className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                      <option value="">{tlx('sel_client')}</option>
                      {clients.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.raison_sociale}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                  </div>
                </div>

                {/* Dates — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_date_debut')} *</label>
                    <input type="date" required
                      value={form.date_debut_validite}
                      onChange={e => setForm(f => ({...f, date_debut_validite: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_date_fin')}</label>
                    <input type="date"
                      value={form.date_fin_validite}
                      onChange={e => setForm(f => ({...f, date_fin_validite: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_description')}</label>
                  <textarea rows={3}
                    value={form.description}
                    onChange={e => setForm(f => ({...f, description: e.target.value}))}
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent resize-none"
                  />
                </div>

                {/* Actif */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.actif}
                      onChange={e => setForm(f => ({...f, actif: e.target.checked}))}
                      className="w-4 h-4 rounded border-[#C5D8F5] accent-[#C8960A]"
                    />
                    <span className="text-sm text-[#3A5A8A] font-medium">{tlx('f_actif')}</span>
                  </label>
                </div>

              </form>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-[#EEF5FF] justify-end shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                {tlx('cancel')}
              </button>
              <button type="submit" form="franchise-form" disabled={saveMut.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition disabled:opacity-50">
                {editing ? tlx('save') : tlx('create')}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('portal-root') ?? document.body
      )}
    </div>
  );
}
