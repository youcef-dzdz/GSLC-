import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, X, Tag, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TypeConteneur {
  id: number;
  code_type: string;
  libelle: string;
}

interface Tarif {
  id: number;
  code_tarif: string;
  libelle_service: string;
  type_conteneur_id: number | null;
  type_conteneur: TypeConteneur | null;
  montant_unitaire: string;
  unite: string;
  tva_applicable: boolean;
  date_debut: string | null;
  date_fin: string | null;
  actif: boolean;
}

interface TarifForm {
  code_tarif: string;
  libelle_service: string;
  type_conteneur_id: string;
  montant_unitaire: string;
  unite: string;
  tva_applicable: boolean;
  date_debut: string;
  date_fin: string;
  actif: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const UNITE_OPTIONS = [
  { value: 'par jour',       fr: 'Par jour',       en: 'Per day',       ar: 'في اليوم' },
  { value: 'par conteneur',  fr: 'Par conteneur',  en: 'Per container', ar: 'لكل حاوية' },
  { value: 'par tonne',      fr: 'Par tonne',      en: 'Per tonne',     ar: 'في الطن' },
  { value: 'forfait',        fr: 'Forfait',        en: 'Flat rate',     ar: 'مبلغ ثابت' },
];

const EMPTY_FORM: TarifForm = {
  code_tarif: '',
  libelle_service: '',
  type_conteneur_id: '',
  montant_unitaire: '',
  unite: 'par jour',
  tva_applicable: true,
  date_debut: '',
  date_fin: '',
  actif: true,
};

const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  title:            { fr: 'Tarifs de service',           en: 'Service Rates',           ar: 'تعريفات الخدمة' },
  subtitle:         { fr: 'tarifs',                      en: 'rates',                   ar: 'تعريفات' },
  new_title:        { fr: 'Nouveau tarif',               en: 'New rate',                ar: 'تعريفة جديدة' },
  edit_title:       { fr: 'Modifier le tarif',           en: 'Edit rate',               ar: 'تعديل التعريفة' },
  create:           { fr: 'Créer',                       en: 'Create',                  ar: 'إنشاء' },
  save:             { fr: 'Enregistrer',                 en: 'Save',                    ar: 'حفظ' },
  cancel:           { fr: 'Annuler',                     en: 'Cancel',                  ar: 'إلغاء' },
  delete:           { fr: 'Supprimer',                   en: 'Delete',                  ar: 'حذف' },
  search:           { fr: 'Rechercher...',               en: 'Search...',               ar: 'بحث...' },
  all_types:        { fr: 'Tous les types',              en: 'All types',               ar: 'جميع الأنواع' },
  all_statuses:     { fr: 'Tous les statuts',            en: 'All statuses',            ar: 'جميع الحالات' },
  reset_filters:    { fr: 'Réinitialiser',               en: 'Reset',                   ar: 'إعادة تعيين' },
  no_tarifs:        { fr: 'Aucun tarif trouvé',          en: 'No rates found',          ar: 'لم يتم العثور على تعريفات' },
  error_load:       { fr: 'Erreur de chargement',        en: 'Loading error',           ar: 'خطأ في التحميل' },
  retry:            { fr: 'Réessayer',                   en: 'Retry',                   ar: 'إعادة المحاولة' },
  create_ok:        { fr: 'Tarif créé avec succès',      en: 'Rate created',            ar: 'تم إنشاء التعريفة' },
  update_ok:        { fr: 'Tarif mis à jour',            en: 'Rate updated',            ar: 'تم تحديث التعريفة' },
  delete_ok:        { fr: 'Tarif supprimé',              en: 'Rate deleted',            ar: 'تم حذف التعريفة' },
  confirm_del:      { fr: 'Confirmer la suppression',    en: 'Confirm deletion',        ar: 'تأكيد الحذف' },
  confirm_del_msg:  { fr: 'Supprimer le tarif',          en: 'Delete rate',             ar: 'حذف التعريفة' },
  f_code:           { fr: 'Code tarif',                  en: 'Rate code',               ar: 'رمز التعريفة' },
  f_libelle:        { fr: 'Libellé du service',          en: 'Service label',           ar: 'تسمية الخدمة' },
  f_type:           { fr: 'Type de conteneur',           en: 'Container type',          ar: 'نوع الحاوية' },
  f_type_all:       { fr: 'Tous types (universel)',      en: 'All types (universal)',   ar: 'جميع الأنواع (شامل)' },
  f_montant:        { fr: 'Montant unitaire (DZD)',      en: 'Unit amount (DZD)',       ar: 'المبلغ الوحدوي (دج)' },
  f_unite:          { fr: 'Unité',                       en: 'Unit',                    ar: 'الوحدة' },
  f_tva:            { fr: 'TVA applicable (19%)',        en: 'TVA applicable (19%)',    ar: 'ضريبة القيمة المضافة (19%)' },
  f_date_debut:     { fr: 'Date de début',               en: 'Start date',              ar: 'تاريخ البداية' },
  f_date_fin:       { fr: 'Date de fin',                 en: 'End date',                ar: 'تاريخ النهاية' },
  f_actif:          { fr: 'Tarif actif',                 en: 'Active rate',             ar: 'التعريفة نشطة' },
  col_code:         { fr: 'Code',                        en: 'Code',                    ar: 'الرمز' },
  col_service:      { fr: 'Service',                     en: 'Service',                 ar: 'الخدمة' },
  col_type:         { fr: 'Type',                        en: 'Type',                    ar: 'النوع' },
  col_montant:      { fr: 'Montant / Unité',             en: 'Amount / Unit',           ar: 'المبلغ / الوحدة' },
  col_tva:          { fr: 'TVA',                         en: 'VAT',                     ar: 'الضريبة' },
  col_validite:     { fr: 'Validité',                    en: 'Validity',                ar: 'الصلاحية' },
  col_statut:       { fr: 'Statut',                      en: 'Status',                  ar: 'الحالة' },
  col_actions:      { fr: 'Actions',                     en: 'Actions',                 ar: 'إجراءات' },
  actif:            { fr: 'Actif',                       en: 'Active',                  ar: 'نشط' },
  inactif:          { fr: 'Inactif',                     en: 'Inactive',                ar: 'غير نشط' },
  tva_yes:          { fr: 'TVA 19%',                     en: 'VAT 19%',                 ar: 'ضريبة 19%' },
  tva_no:           { fr: 'Exonéré',                     en: 'Exempt',                  ar: 'معفى' },
  tous_types:       { fr: 'Tous types',                  en: 'All types',               ar: 'جميع الأنواع' },
  statut_actif:     { fr: 'Actifs',                      en: 'Active',                  ar: 'نشط' },
  statut_inactif:   { fr: 'Inactifs',                    en: 'Inactive',                ar: 'غير نشط' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminTarifs() {
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
  const [editing,      setEditing]      = useState<Tarif|null>(null);
  const [form,         setForm]         = useState<TarifForm>(EMPTY_FORM);
  const [toDelete,     setToDelete]     = useState<Tarif|null>(null);
  const [toast,        setToast]        = useState<{msg:string;type:'success'|'error'}|null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang) : '—';

  const formatMontant = (m: string, unite: string) => {
    const label = UNITE_OPTIONS.find(u => u.value === unite)?.[lang] ?? unite;
    return `${parseFloat(m).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD / ${label}`;
  };

  const resetFilters = () => { setSearch(''); setTypeFilter(''); setStatFilter(''); };

  // ── Data ───────────────────────────────────────────────────────────────────

  const safeArray = (res: any, key: string): any[] => {
    const d = res?.data ?? res;
    return Array.isArray(d?.[key]) ? d[key] : Array.isArray(d) ? d : [];
  };

  const { data: allTarifs = [], isLoading, isError } = useQuery<Tarif[]>({
    queryKey: ['admin-tarifs'],
    queryFn: async () => safeArray(await adminService.getTarifs(), 'tarifs'),
  });

  const { data: typeConteneurs = [] } = useQuery<TypeConteneur[]>({
    queryKey: ['admin-type-conteneurs'],
    queryFn: async () => safeArray(await adminService.getTypeConteneurs(), 'types'),
    select: (data: any[]) => data.filter((t: any) => t.actif),
  });

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allTarifs];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.code_tarif.toLowerCase().includes(q) ||
        t.libelle_service.toLowerCase().includes(q)
      );
    }
    if (typeFilter) {
      list = list.filter(t =>
        typeFilter === '__null__'
          ? t.type_conteneur_id === null
          : String(t.type_conteneur_id) === typeFilter
      );
    }
    if (statFilter) {
      list = list.filter(t =>
        statFilter === 'actif' ? t.actif : !t.actif
      );
    }
    return list;
  }, [allTarifs, search, typeFilter, statFilter]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      editing
        ? adminService.updateTarif(editing.id, payload)
        : adminService.createTarif(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tarifs'] });
      showToast(editing ? tlx('update_ok') : tlx('create_ok'));
      closeModal();
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? err?.message ?? 'Erreur', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteTarif(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tarifs'] });
      showToast(tlx('delete_ok'));
      setToDelete(null);
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Impossible de supprimer ce tarif.', 'error'),
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: Tarif) => {
    setEditing(t);
    setForm({
      code_tarif:         t.code_tarif,
      libelle_service:    t.libelle_service,
      type_conteneur_id:  t.type_conteneur_id ? String(t.type_conteneur_id) : '',
      montant_unitaire:   t.montant_unitaire,
      unite:              t.unite,
      tva_applicable:     t.tva_applicable,
      date_debut:         t.date_debut ?? '',
      date_fin:           t.date_fin ?? '',
      actif:              t.actif,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      libelle_service:   form.libelle_service,
      type_conteneur_id: form.type_conteneur_id ? Number(form.type_conteneur_id) : null,
      montant_unitaire:  Number(form.montant_unitaire),
      unite:             form.unite,
      tva_applicable:    form.tva_applicable,
      date_debut:        form.date_debut || null,
      date_fin:          form.date_fin || null,
      actif:             form.actif,
    };
    if (!editing) payload.code_tarif = form.code_tarif;
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
      <p className="text-[#8A2020] font-medium">{tlx('error_load')}</p>
      <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-tarifs'] })}
        className="px-4 py-2 bg-[#0D2A5E] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3360] transition">
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
            {filtered.length} / {allTarifs.length} {tlx('subtitle')}
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
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tlx('search')}
              className={`w-full border border-[#C5D8F5] rounded-xl py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
            />
          </div>

          {/* Type conteneur filter */}
          <div className="relative min-w-[180px]">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{tlx('all_types')}</option>
              <option value="__null__">{tlx('tous_types')}</option>
              {typeConteneurs.map(tc => (
                <option key={tc.id} value={String(tc.id)}>{tc.libelle} ({tc.code_type})</option>
              ))}
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
          </div>

          {/* Statut filter */}
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
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_code')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_service')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_type')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_montant')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_tva')}</th>
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
                    <Tag className="w-8 h-8 opacity-40" />
                    <span className="text-sm">{tlx('no_tarifs')}</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(tarif => (
              <tr key={tarif.id} className="hover:bg-[#F4F9FF] transition-colors">

                {/* Code */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#EEF5FF] text-[#0D2A5E]">
                    {tarif.code_tarif}
                  </span>
                </td>

                {/* Service */}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0D2A5E] leading-tight">{tarif.libelle_service}</p>
                </td>

                {/* Type conteneur */}
                <td className="px-4 py-3">
                  {tarif.type_conteneur ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E0EEFF] text-[#1A4A9A]">
                      {tarif.type_conteneur.code_type}
                    </span>
                  ) : (
                    <span className="text-xs text-[#88A8D0] italic">{tlx('tous_types')}</span>
                  )}
                </td>

                {/* Montant / unité */}
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-[#0D2A5E]">
                    {parseFloat(tarif.montant_unitaire).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD
                  </p>
                  <p className="text-[11px] text-[#88A8D0] mt-0.5">
                    {UNITE_OPTIONS.find(u => u.value === tarif.unite)?.[lang] ?? tarif.unite}
                  </p>
                </td>

                {/* TVA */}
                <td className="px-4 py-3">
                  {tarif.tva_applicable ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E6F7F0] text-[#2A8A5A]">
                      {tlx('tva_yes')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#5A80BB]">
                      {tlx('tva_no')}
                    </span>
                  )}
                </td>

                {/* Validité */}
                <td className="px-4 py-3">
                  <p className="text-xs text-[#3A5A8A]">
                    {tarif.date_debut ? formatDate(tarif.date_debut) : '—'}
                    {(tarif.date_debut || tarif.date_fin) && ' → '}
                    {tarif.date_fin ? formatDate(tarif.date_fin) : tarif.date_debut ? '∞' : ''}
                  </p>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  {tarif.actif ? (
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
                      <button onClick={() => openEdit(tarif)} title={tlx('edit_title')}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setToDelete(tarif)} title={tlx('delete')}
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
                <h3 className="text-base font-bold text-[#0D2A5E] mb-1">{tlx('confirm_del')}</h3>
                <p className="text-sm text-[#3A5A8A]">
                  {tlx('confirm_del_msg')} <span className="font-bold text-[#0D2A5E]">{toDelete.code_tarif}</span> ?
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

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#EEF5FF] shrink-0">
              <h2 className="text-base font-bold text-[#0D2A5E]">
                {editing ? tlx('edit_title') : tlx('new_title')}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#88A8D0] hover:text-[#0D2A5E] transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4">
              <form id="tarif-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Code tarif — readonly on edit */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_code')} *</label>
                  <input type="text" required disabled={!!editing}
                    value={form.code_tarif}
                    onChange={e => setForm(f => ({...f, code_tarif: e.target.value.toUpperCase()}))}
                    placeholder="ex: MANUT-20HC"
                    className={`w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent font-mono ${editing ? 'bg-[#F8FAFC] cursor-not-allowed opacity-60' : ''}`}
                  />
                </div>

                {/* Libellé */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_libelle')} *</label>
                  <input type="text" required
                    value={form.libelle_service}
                    onChange={e => setForm(f => ({...f, libelle_service: e.target.value}))}
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* Type conteneur */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_type')}</label>
                  <div className="relative">
                    <select value={form.type_conteneur_id}
                      onChange={e => setForm(f => ({...f, type_conteneur_id: e.target.value}))}
                      className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                      <option value="">{tlx('f_type_all')}</option>
                      {typeConteneurs.map(tc => (
                        <option key={tc.id} value={String(tc.id)}>{tc.libelle} — {tc.code_type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                  </div>
                </div>

                {/* Montant + Unité — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_montant')} *</label>
                    <input type="number" required min="0" step="0.01"
                      value={form.montant_unitaire}
                      onChange={e => setForm(f => ({...f, montant_unitaire: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_unite')} *</label>
                    <div className="relative">
                      <select value={form.unite}
                        onChange={e => setForm(f => ({...f, unite: e.target.value}))}
                        className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                        {UNITE_OPTIONS.map(u => (
                          <option key={u.value} value={u.value}>{u[lang]}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Dates de validité */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_date_debut')}</label>
                    <input type="date"
                      value={form.date_debut}
                      onChange={e => setForm(f => ({...f, date_debut: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_date_fin')}</label>
                    <input type="date"
                      value={form.date_fin}
                      onChange={e => setForm(f => ({...f, date_fin: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* TVA + Actif — checkboxes */}
                <div className="flex gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.tva_applicable}
                      onChange={e => setForm(f => ({...f, tva_applicable: e.target.checked}))}
                      className="w-4 h-4 rounded border-[#C5D8F5] accent-[#C8960A]"
                    />
                    <span className="text-sm text-[#3A5A8A] font-medium">{tlx('f_tva')}</span>
                  </label>
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

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#EEF5FF] justify-end shrink-0">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]">
                {tlx('cancel')}
              </button>
              <button type="submit" form="tarif-form" disabled={saveMut.isPending}
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
