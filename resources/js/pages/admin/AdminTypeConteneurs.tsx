import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, X, Box, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { usePermission } from '../../hooks/usePermission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TypeConteneur {
  id: number;
  code_type: string;
  libelle: string;
  longueur_pieds: number;
  est_frigo: boolean;
  poids_tare: string;
  charge_utile: string | null;
  volume: string | null;
  tarif_journalier_defaut: string;
  actif: boolean;
}

interface TCForm {
  code_type: string;
  libelle: string;
  longueur_pieds: string;
  est_frigo: boolean;
  poids_tare: string;
  charge_utile: string;
  volume: string;
  tarif_journalier_defaut: string;
  actif: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LONGUEUR_OPTIONS = [
  { value: '20', fr: '20 pieds', en: '20 feet', ar: '20 قدم' },
  { value: '40', fr: '40 pieds', en: '40 feet', ar: '40 قدم' },
  { value: '45', fr: '45 pieds', en: '45 feet', ar: '45 قدم' },
];

const EMPTY_FORM: TCForm = {
  code_type: '',
  libelle: '',
  longueur_pieds: '20',
  est_frigo: false,
  poids_tare: '',
  charge_utile: '',
  volume: '',
  tarif_journalier_defaut: '0',
  actif: true,
};

const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  title:            { fr: 'Types de conteneur',              en: 'Container Types',               ar: 'أنواع الحاويات' },
  subtitle:         { fr: 'types',                           en: 'types',                         ar: 'أنواع' },
  new_title:        { fr: 'Nouveau type',                    en: 'New type',                      ar: 'نوع جديد' },
  edit_title:       { fr: 'Modifier le type',                en: 'Edit type',                     ar: 'تعديل النوع' },
  create:           { fr: 'Créer',                           en: 'Create',                        ar: 'إنشاء' },
  save:             { fr: 'Enregistrer',                     en: 'Save',                          ar: 'حفظ' },
  cancel:           { fr: 'Annuler',                         en: 'Cancel',                        ar: 'إلغاء' },
  delete:           { fr: 'Supprimer',                       en: 'Delete',                        ar: 'حذف' },
  search:           { fr: 'Rechercher...',                   en: 'Search...',                     ar: 'بحث...' },
  all_types:        { fr: 'Tous les types',                  en: 'All types',                     ar: 'جميع الأنواع' },
  all_statuses:     { fr: 'Tous les statuts',                en: 'All statuses',                  ar: 'جميع الحالات' },
  reset_filters:    { fr: 'Réinitialiser',                   en: 'Reset',                         ar: 'إعادة تعيين' },
  no_types:         { fr: 'Aucun type trouvé',               en: 'No types found',                ar: 'لم يتم العثور على أنواع' },
  error_load:       { fr: 'Erreur de chargement',            en: 'Loading error',                 ar: 'خطأ في التحميل' },
  retry:            { fr: 'Réessayer',                       en: 'Retry',                         ar: 'إعادة المحاولة' },
  create_ok:        { fr: 'Type créé avec succès',           en: 'Type created',                  ar: 'تم إنشاء النوع' },
  update_ok:        { fr: 'Type mis à jour',                 en: 'Type updated',                  ar: 'تم تحديث النوع' },
  delete_ok:        { fr: 'Type supprimé',                   en: 'Type deleted',                  ar: 'تم حذف النوع' },
  confirm_del:      { fr: 'Confirmer la suppression',        en: 'Confirm deletion',              ar: 'تأكيد الحذف' },
  confirm_del_msg:  { fr: 'Supprimer le type',               en: 'Delete type',                   ar: 'حذف النوع' },
  f_code:           { fr: 'Code type',                       en: 'Type code',                     ar: 'رمز النوع' },
  f_libelle:        { fr: 'Libellé',                         en: 'Label',                         ar: 'التسمية' },
  f_longueur:       { fr: 'Longueur',                        en: 'Length',                        ar: 'الطول' },
  f_frigo:          { fr: 'Conteneur réfrigéré (REEFER)',    en: 'Refrigerated container (REEFER)', ar: 'حاوية مبردة (ريفر)' },
  f_poids_tare:     { fr: 'Poids à vide (tonnes)',           en: 'Tare weight (tonnes)',          ar: 'الوزن الفارغ (أطنان)' },
  f_charge_utile:   { fr: 'Charge utile max (tonnes)',       en: 'Max payload (tonnes)',          ar: 'الحمولة القصوى (أطنان)' },
  f_volume:         { fr: 'Volume (m³)',                     en: 'Volume (m³)',                   ar: 'الحجم (م³)' },
  f_tarif:          { fr: 'Tarif journalier défaut (DZD)',   en: 'Default daily rate (DZD)',      ar: 'التعريفة اليومية الافتراضية (دج)' },
  f_actif:          { fr: 'Type actif',                      en: 'Active type',                   ar: 'النوع نشط' },
  col_code:         { fr: 'Code',                            en: 'Code',                          ar: 'الرمز' },
  col_libelle:      { fr: 'Libellé',                         en: 'Label',                         ar: 'التسمية' },
  col_taille:       { fr: 'Taille',                          en: 'Size',                          ar: 'الحجم' },
  col_frigo:        { fr: 'Type',                            en: 'Type',                          ar: 'النوع' },
  col_tarif:        { fr: 'Tarif/jour',                      en: 'Rate/day',                      ar: 'التعريفة/اليوم' },
  col_specs:        { fr: 'Volume / Charge',                 en: 'Volume / Payload',              ar: 'الحجم / الحمولة' },
  col_statut:       { fr: 'Statut',                          en: 'Status',                        ar: 'الحالة' },
  col_actions:      { fr: 'Actions',                         en: 'Actions',                       ar: 'إجراءات' },
  actif:            { fr: 'Actif',                           en: 'Active',                        ar: 'نشط' },
  inactif:          { fr: 'Inactif',                         en: 'Inactive',                      ar: 'غير نشط' },
  refrigere:        { fr: 'Réfrigéré',                       en: 'Refrigerated',                  ar: 'مبرد' },
  standard:         { fr: 'Standard',                        en: 'Standard',                      ar: 'قياسي' },
  filter_refrigere: { fr: 'Réfrigéré',                       en: 'Refrigerated',                  ar: 'مبرد' },
  filter_standard:  { fr: 'Standard',                        en: 'Standard',                      ar: 'قياسي' },
  statut_actif:     { fr: 'Actifs',                          en: 'Active',                        ar: 'نشط' },
  statut_inactif:   { fr: 'Inactifs',                        en: 'Inactive',                      ar: 'غير نشط' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminTypeConteneurs() {
  const lang = (navigator.language?.split('-')[0] ?? 'fr') as 'fr'|'en'|'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();
  const { isAdmin } = usePermission();
  const canEdit = isAdmin;

  // ── State ──────────────────────────────────────────────────────────────────

  const [search,     setSearch]     = useState('');
  const [frigoFilter, setFrigoFilter] = useState('');
  const [statFilter, setStatFilter] = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState<TypeConteneur|null>(null);
  const [form,       setForm]       = useState<TCForm>(EMPTY_FORM);
  const [toDelete,   setToDelete]   = useState<TypeConteneur|null>(null);
  const [toast,      setToast]      = useState<{msg:string;type:'success'|'error'}|null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resetFilters = () => { setSearch(''); setFrigoFilter(''); setStatFilter(''); };

  const fmt = (val: string | null, unit: string) =>
    val && parseFloat(val) > 0
      ? `${parseFloat(val).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} ${unit}`
      : '—';

  // ── Data ───────────────────────────────────────────────────────────────────

  const safeArray = (res: any): any[] => {
    const d = res?.data ?? res;
    return Array.isArray(d?.types) ? d.types : Array.isArray(d) ? d : [];
  };

  const { data: allTypes = [], isLoading, isError } = useQuery<TypeConteneur[]>({
    queryKey: ['admin-type-conteneurs'],
    queryFn: async () => safeArray(await adminService.getTypeConteneurs()),
  });

  // ── Filtered ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = [...allTypes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.code_type.toLowerCase().includes(q) ||
        t.libelle.toLowerCase().includes(q)
      );
    }
    if (frigoFilter === 'frigo')    list = list.filter(t => t.est_frigo);
    if (frigoFilter === 'standard') list = list.filter(t => !t.est_frigo);
    if (statFilter === 'actif')     list = list.filter(t => t.actif);
    if (statFilter === 'inactif')   list = list.filter(t => !t.actif);
    return list;
  }, [allTypes, search, frigoFilter, statFilter]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMut = useMutation({
    mutationFn: (payload: Record<string, any>) =>
      editing
        ? adminService.updateTypeConteneur(editing.id, payload)
        : adminService.createTypeConteneur(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-type-conteneurs'] });
      showToast(editing ? tlx('update_ok') : tlx('create_ok'));
      closeModal();
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? err?.message ?? 'Erreur', 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deleteTypeConteneur(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-type-conteneurs'] });
      showToast(tlx('delete_ok'));
      setToDelete(null);
    },
    onError: (err: any) =>
      showToast(err?.response?.data?.message ?? 'Impossible de supprimer ce type.', 'error'),
  });

  // ── Modal ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: TypeConteneur) => {
    setEditing(t);
    setForm({
      code_type:                t.code_type,
      libelle:                  t.libelle,
      longueur_pieds:           String(t.longueur_pieds),
      est_frigo:                t.est_frigo,
      poids_tare:               t.poids_tare,
      charge_utile:             t.charge_utile ?? '',
      volume:                   t.volume ?? '',
      tarif_journalier_defaut:  t.tarif_journalier_defaut,
      actif:                    t.actif,
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, any> = {
      libelle:                 form.libelle,
      longueur_pieds:          Number(form.longueur_pieds),
      est_frigo:               form.est_frigo,
      poids_tare:              Number(form.poids_tare),
      charge_utile:            form.charge_utile ? Number(form.charge_utile) : null,
      volume:                  form.volume ? Number(form.volume) : null,
      tarif_journalier_defaut: Number(form.tarif_journalier_defaut),
      actif:                   form.actif,
    };
    if (!editing) payload.code_type = form.code_type.toUpperCase();
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
      <button onClick={() => qc.invalidateQueries({ queryKey: ['admin-type-conteneurs'] })}
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
            {filtered.length} / {allTypes.length} {tlx('subtitle')}
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

          {/* Frigo filter */}
          <div className="relative min-w-[160px]">
            <select value={frigoFilter} onChange={e => setFrigoFilter(e.target.value)}
              className="w-full appearance-none border border-[#C5D8F5] rounded-xl py-2 px-3 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent">
              <option value="">{tlx('all_types')}</option>
              <option value="frigo">{tlx('filter_refrigere')}</option>
              <option value="standard">{tlx('filter_standard')}</option>
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
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_libelle')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_taille')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_frigo')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_tarif')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_specs')}</th>
              <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_statut')}</th>
              {canEdit && <th className="text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left">{tlx('col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF5FF]">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#88A8D0]">
                    <Box className="w-8 h-8 opacity-40" />
                    <span className="text-sm">{tlx('no_types')}</span>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(tc => (
              <tr key={tc.id} className="hover:bg-[#F4F9FF] transition-colors">

                {/* Code */}
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-[#EEF5FF] text-[#0D2A5E]">
                    {tc.code_type}
                  </span>
                </td>

                {/* Libellé */}
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-[#0D2A5E] leading-tight">{tc.libelle}</p>
                </td>

                {/* Taille */}
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#3A5A8A]">
                    {tc.longueur_pieds} ft
                  </span>
                </td>

                {/* Réfrigéré / Standard */}
                <td className="px-4 py-3">
                  {tc.est_frigo ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#E0EEFF] text-[#1A4A9A]">
                      {tlx('refrigere')}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF5FF] text-[#5A80BB]">
                      {tlx('standard')}
                    </span>
                  )}
                </td>

                {/* Tarif/jour */}
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-[#0D2A5E]">
                    {parseFloat(tc.tarif_journalier_defaut).toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DZD
                  </p>
                  <p className="text-[11px] text-[#88A8D0]">/ jour</p>
                </td>

                {/* Volume / Charge */}
                <td className="px-4 py-3">
                  <p className="text-xs text-[#3A5A8A]">{fmt(tc.volume, 'm³')}</p>
                  <p className="text-xs text-[#88A8D0]">{fmt(tc.charge_utile, 't')}</p>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  {tc.actif ? (
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
                      <button onClick={() => openEdit(tc)} title={tlx('edit_title')}
                        className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#5A80BB] hover:text-[#0D2A5E] transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setToDelete(tc)} title={tlx('delete')}
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
                  {tlx('confirm_del_msg')} <span className="font-bold text-[#0D2A5E]">{toDelete.code_type}</span> ?
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
              <form id="tc-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Code type — readonly on edit */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_code')} *</label>
                  <input type="text" required disabled={!!editing}
                    value={form.code_type}
                    onChange={e => setForm(f => ({...f, code_type: e.target.value.toUpperCase()}))}
                    placeholder="ex: 40HC"
                    className={`w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent font-mono uppercase ${editing ? 'bg-[#F8FAFC] cursor-not-allowed opacity-60' : ''}`}
                  />
                </div>

                {/* Libellé */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_libelle')} *</label>
                  <input type="text" required
                    value={form.libelle}
                    onChange={e => setForm(f => ({...f, libelle: e.target.value}))}
                    placeholder="ex: 40 pieds High Cube"
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* Longueur + Tarif journalier — same row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_longueur')} *</label>
                    <div className="relative">
                      <select value={form.longueur_pieds}
                        onChange={e => setForm(f => ({...f, longueur_pieds: e.target.value}))}
                        className="w-full appearance-none border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent pr-8">
                        {LONGUEUR_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o[lang]}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88A8D0] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_tarif')} *</label>
                    <input type="number" required min="0" step="0.01"
                      value={form.tarif_journalier_defaut}
                      onChange={e => setForm(f => ({...f, tarif_journalier_defaut: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Poids tare + Charge utile */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_poids_tare')} *</label>
                    <input type="number" required min="0" step="0.01"
                      value={form.poids_tare}
                      onChange={e => setForm(f => ({...f, poids_tare: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_charge_utile')}</label>
                    <input type="number" min="0" step="0.01"
                      value={form.charge_utile}
                      onChange={e => setForm(f => ({...f, charge_utile: e.target.value}))}
                      className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-xs font-semibold text-[#3A5A8A] mb-1">{tlx('f_volume')}</label>
                  <input type="number" min="0" step="0.01"
                    value={form.volume}
                    onChange={e => setForm(f => ({...f, volume: e.target.value}))}
                    className="w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.est_frigo}
                      onChange={e => setForm(f => ({...f, est_frigo: e.target.checked}))}
                      className="w-4 h-4 rounded border-[#C5D8F5] accent-[#C8960A]"
                    />
                    <span className="text-sm text-[#3A5A8A] font-medium">{tlx('f_frigo')}</span>
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
              <button type="submit" form="tc-form" disabled={saveMut.isPending}
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
