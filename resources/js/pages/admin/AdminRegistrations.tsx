import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Search, Check, X, Clock, Building2, User, Mail, Phone,
  ChevronDown, Loader2, AlertCircle, Eye, CheckCircle, XCircle,
  FileText, Calendar, MapPin, Briefcase, Trash2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { apiClient } from '../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClientUser {
  id: number; nom: string; prenom: string; email: string; statut: string;
}
interface Registration {
  id: number;
  raison_sociale: string;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  type_client: string | null;
  adresse: string | null;
  ville: string | null;
  pays: { id: number; nom: string } | null;
  telephone: string | null;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_fonction: string | null;
  contact_telephone: string | null;
  statut: string;
  motif_rejet: string | null;
  created_at: string;
  user: ClientUser | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { fr: string; en: string; ar: string; ring: string; dot: string; text: string; bg: string }> = {
  EN_ATTENTE_VALIDATION: { fr: 'En attente',   en: 'Pending',   ar: 'قيد الانتظار', ring: 'ring-yellow-200', dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  APPROUVE:              { fr: 'Approuvé',     en: 'Approved',  ar: 'معتمد',          ring: 'ring-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  REJETE:                { fr: 'Rejeté',       en: 'Rejected',  ar: 'مرفوض',          ring: 'ring-rose-200', dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
};

const TEXTS: Record<string, Record<'fr' | 'en' | 'ar', string>> = {
  title:           { fr: 'Demandes d\'inscription', en: 'Registration Requests', ar: 'طلبات التسجيل' },
  subtitle:        { fr: 'demandes',                en: 'requests',              ar: 'طلبات' },
  search:          { fr: 'Rechercher...',           en: 'Search...',             ar: 'بحث...' },
  all_statuses:    { fr: 'Tous les statuts',        en: 'All statuses',          ar: 'جميع الحالات' },
  pending:         { fr: 'En attente',              en: 'Pending',               ar: 'قيد الانتظار' },
  approved:        { fr: 'Approuvé',               en: 'Approved',              ar: 'معتمد' },
  rejected:        { fr: 'Rejeté',                 en: 'Rejected',              ar: 'مرفوض' },
  approve:         { fr: 'Approuver',              en: 'Approve',               ar: 'قبول' },
  reject:          { fr: 'Rejeter',                en: 'Reject',                ar: 'رفض' },
  view:            { fr: 'Voir détails',           en: 'View details',          ar: 'عرض التفاصيل' },
  cancel:          { fr: 'Annuler',                en: 'Cancel',                ar: 'إلغاء' },
  confirm:         { fr: 'Confirmer',              en: 'Confirm',               ar: 'تأكيد' },
  no_results:      { fr: 'Aucune demande trouvée', en: 'No requests found',     ar: 'لم يتم العثور على طلبات' },
  approve_title:   { fr: 'Confirmer l\'approbation', en: 'Confirm approval',    ar: 'تأكيد القبول' },
  approve_desc:    { fr: 'Vous êtes sur le point d\'approuver l\'inscription de', en: 'You are about to approve the registration of', ar: 'أنت على وشك قبول تسجيل' },
  approve_note:    { fr: 'Le client recevra un email de confirmation et pourra se connecter.', en: 'The client will receive a confirmation email and can log in.', ar: 'سيتلقى العميل بريدًا إلكترونيًا للتأكيد ويمكنه تسجيل الدخول.' },
  reject_title:    { fr: 'Rejeter la demande',    en: 'Reject request',         ar: 'رفض الطلب' },
  reject_motif:    { fr: 'Motif de rejet *',      en: 'Rejection reason *',     ar: 'سبب الرفض *' },
  reject_note:     { fr: 'Le client sera notifié par email avec ce motif.', en: 'The client will be notified by email with this reason.', ar: 'سيتم إخطار العميل بالبريد الإلكتروني بهذا السبب.' },
  detail_title:    { fr: 'Détails du dossier',    en: 'Application details',    ar: 'تفاصيل الملف' },
  company:         { fr: 'Société',               en: 'Company',                ar: 'الشركة' },
  contact:         { fr: 'Contact',               en: 'Contact',                ar: 'جهة الاتصال' },
  address:         { fr: 'Adresse',               en: 'Address',                ar: 'العنوان' },
  documents:       { fr: 'Documents fiscaux',     en: 'Tax documents',          ar: 'الوثائق الضريبية' },
  submitted:       { fr: 'Soumis le',             en: 'Submitted on',           ar: 'تاريخ التقديم' },
  error_load:      { fr: 'Erreur de chargement',  en: 'Loading error',          ar: 'خطأ في التحميل' },
  retry:           { fr: 'Réessayer',             en: 'Retry',                  ar: 'إعادة المحاولة' },
  approve_success: { fr: 'Inscription approuvée avec succès', en: 'Registration approved successfully', ar: 'تم قبول التسجيل بنجاح' },
  reject_success:  { fr: 'Inscription rejetée',   en: 'Registration rejected',  ar: 'تم رفض التسجيل' },
  motif_required:  { fr: 'Le motif est obligatoire', en: 'Reason is required',  ar: 'السبب مطلوب' },
  close:           { fr: 'Fermer',                en: 'Close',                  ar: 'إغلاق' },
  delete:          { fr: 'Supprimer',            en: 'Delete',                 ar: 'حذف' },
  delete_title:    { fr: 'Supprimer la demande', en: 'Delete request',         ar: 'حذف الطلب' },
  delete_desc:     { fr: 'Êtes-vous sûr de vouloir supprimer définitivement la demande de', en: 'Are you sure you want to permanently delete the request from', ar: 'هل أنت متأكد من حذف طلب' },
  delete_success:  { fr: 'Demande supprimée avec succès', en: 'Request deleted successfully', ar: 'تم حذف الطلب بنجاح' },
};

const TABLE_HEADERS: Record<string, string[]> = {
  fr: ['Entreprise', 'Contact', 'Email', 'Ville', 'Soumis le', 'Statut', 'Actions'],
  en: ['Company',    'Contact', 'Email', 'City',  'Submitted', 'Status', 'Actions'],
  ar: ['الشركة',     'جهة الاتصال', 'البريد', 'المدينة', 'تاريخ التقديم', 'الحالة', 'الإجراءات'],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminRegistrations() {
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0]?.split('_')[0] ?? 'fr') as 'fr' | 'en' | 'ar';
  const isRTL = lang === 'ar';
  const qc = useQueryClient();

  const [searchParams] = useSearchParams();
  const highlightId = Number(searchParams.get('highlight')) || null;

  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [detailTarget, setDetailTarget] = useState<Registration | null>(null);
  const [approveTarget, setApproveTarget] = useState<Registration | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Registration | null>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [motifError, setMotifError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;
  const tl = (rec: Record<string, string>) => rec[lang] ?? rec['fr'] ?? '';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Data fetch (all statuses merged) ───────────────────────────────────────

  const safeArray = (res: any): Registration[] => {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (d?.data && Array.isArray(d.data.data)) return d.data.data;
    return [];
  };

  const { data: pending = [], isLoading: loadingPending }  = useQuery<Registration[]>({
    queryKey: ['admin-registrations', 'EN_ATTENTE_VALIDATION'],
    queryFn: async () => safeArray(await adminService.getRegistrations('EN_ATTENTE_VALIDATION')),
  });

  useEffect(() => {
    if (!highlightId || !pending) return;
    setHighlightedId(highlightId);
    // Attendre que React rende les lignes avant de scroller
    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(`reg-row-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
    // Fade out après 3.5 secondes
    const fadeTimer = setTimeout(() => {
      setHighlightedId(null);
    }, 3500);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(fadeTimer);
    };
  }, [highlightId, pending]);

  const { data: approved = [], isLoading: loadingApproved } = useQuery<Registration[]>({
    queryKey: ['admin-registrations', 'APPROUVE'],
    queryFn: async () => safeArray(await adminService.getRegistrations('APPROUVE')),
  });
  const { data: rejected = [], isLoading: loadingRejected } = useQuery<Registration[]>({
    queryKey: ['admin-registrations', 'REJETE'],
    queryFn: async () => safeArray(await adminService.getRegistrations('REJETE')),
  });

  const isLoading = loadingPending || loadingApproved || loadingRejected;
  const isError   = false;

  const allRegistrations = useMemo(() => [...pending, ...approved, ...rejected], [pending, approved, rejected]);

  const filtered = useMemo(() => {
    let list = allRegistrations;
    if (statutFilter) list = list.filter(r => r.statut === statutFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.raison_sociale?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.ville?.toLowerCase().includes(q) ||
        r.contact_nom?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allRegistrations, statutFilter, search]);

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const approveMut = useMutation({
    mutationFn: (id: number) => apiClient.post(`/api/admin/registrations/${id}/approve`, { lang }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      showToast(tlx('approve_success'), 'success');
      setApproveTarget(null);
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? t('common.error'), 'error'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, motif }: { id: number; motif: string }) =>
      adminService.rejectRegistration(id, motif),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      showToast(tlx('reject_success'), 'success');
      setRejectTarget(null);
      setRejectMotif('');
      setMotifError(false);
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? t('common.error'), 'error'),
  });

  const handleReject = () => {
    if (!rejectMotif.trim()) { setMotifError(true); return; }
    if (rejectTarget) rejectMut.mutate({ id: rejectTarget.id, motif: rejectMotif });
  };

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/admin/registrations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registrations'] });
      showToast(tlx('delete_success'), 'success');
      setDeleteTarget(null);
    },
    onError: (err: any) => showToast(err?.response?.data?.message ?? 'Erreur lors de la suppression', 'error'),
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const initials = (r: Registration) =>
    (r.raison_sociale ?? '?').slice(0, 2).toUpperCase();

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR') : '—';

  const pendingCount  = pending.length;
  const approvedCount = approved.length;
  const rejectedCount = rejected.length;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Toast */}
      {toast && typeof document !== 'undefined' && createPortal(
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${toast.type === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]' : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'} animate-in fade-in slide-in-from-top-6 duration-300`}>
          <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center shadow-sm ${toast.type === 'success' ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
            {toast.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertCircle className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <p className="text-[15px] font-semibold pr-2">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-1 p-1.5 rounded-xl opacity-60 hover:opacity-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3C]">{tlx('title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} / {allRegistrations.length} {tlx('subtitle')}
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: tlx('pending'),  count: pendingCount,  color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
          { label: tlx('approved'), count: approvedCount, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
          { label: tlx('rejected'), count: rejectedCount, color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.color}`}>
            <span className={`w-3 h-3 rounded-full ${s.dot} flex-shrink-0`} />
            <div>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-medium opacity-80">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tlx('search')}
            className={`w-full py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
          />
        </div>
        {/* Status filter */}
        <div className="relative min-w-[160px]">
          <select
            value={statutFilter}
            onChange={e => setStatutFilter(e.target.value)}
            className={`w-full appearance-none py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C] ${isRTL ? 'pr-3 pl-8' : 'pl-3 pr-8'}`}
          >
            <option value="">{tlx('all_statuses')}</option>
            <option value="EN_ATTENTE_VALIDATION">{tlx('pending')}</option>
            <option value="APPROUVE">{tlx('approved')}</option>
            <option value="REJETE">{tlx('rejected')}</option>
          </select>
          <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none ${isRTL ? 'left-2.5' : 'right-2.5'}`} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-500">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">{tlx('error_load')}</p>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ['admin-registrations'] })}
              className="text-xs px-4 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition"
            >
              {tlx('retry')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <FileText className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium">{tlx('no_results')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {TABLE_HEADERS[lang].map(h => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(reg => {
                  const sm = STATUS_META[reg.statut];
                  return (
                    <tr
                      key={reg.id}
                      id={`reg-row-${reg.id}`}
                      className="transition-all duration-700 hover:bg-gray-50/50"
                      style={highlightedId === reg.id ? {
                        backgroundColor: '#FFFBEB',
                        boxShadow: 'inset 0 0 0 2px #CFA030',
                      } : {}}
                    >
                      {/* Company */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D1F3C] to-[#1a3360] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials(reg)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-xs leading-tight">{reg.raison_sociale ?? '—'}</p>
                            {reg.type_client && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{reg.type_client}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-gray-800 text-xs">{reg.contact_nom} {reg.contact_prenom}</p>
                        {reg.contact_fonction && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{reg.contact_fonction}</p>
                        )}
                      </td>
                      {/* Email */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs text-gray-600 font-mono">{reg.user?.email ?? '—'}</p>
                      </td>
                      {/* Ville */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs text-gray-600">{reg.ville ?? '—'}</p>
                      </td>
                      {/* Date */}
                      <td className={`px-4 py-3 text-xs text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(reg.created_at)}
                      </td>
                      {/* Status */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {sm ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${sm.bg} ${sm.text} ${sm.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sm.dot}`} />
                            {tl(sm)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{reg.statut}</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {/* View detail */}
                          <button
                            onClick={() => setDetailTarget(reg)}
                            title={tlx('view')}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Approve */}
                          {reg.statut === 'EN_ATTENTE_VALIDATION' && (
                            <button
                              onClick={() => setApproveTarget(reg)}
                              title={tlx('approve')}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Reject */}
                          {reg.statut === 'EN_ATTENTE_VALIDATION' && (
                            <button
                              onClick={() => { setRejectTarget(reg); setRejectMotif(''); setMotifError(false); }}
                              title={tlx('reject')}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-700 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Delete — only for processed (approved or rejected) registrations */}
                          {(reg.statut === 'APPROUVE' || reg.statut === 'REJETE') && (
                            <button
                              onClick={() => setDeleteTarget(reg)}
                              title={tlx('delete')}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setDetailTarget(null); }}
        >
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D1F3C] to-[#1a3360] flex items-center justify-center text-white font-bold">
                  {initials(detailTarget)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0D1F3C]">{detailTarget.raison_sociale}</h2>
                  <p className="text-xs text-gray-400">{tlx('detail_title')}</p>
                </div>
              </div>
              <button onClick={() => setDetailTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Status badge */}
              {STATUS_META[detailTarget.statut] && (
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ring-1 ${STATUS_META[detailTarget.statut].bg} ${STATUS_META[detailTarget.statut].text} ${STATUS_META[detailTarget.statut].ring}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[detailTarget.statut].dot}`} />
                  {tl(STATUS_META[detailTarget.statut])}
                </div>
              )}

              {/* Company section */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{tlx('company')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[11px] text-gray-400">NIF</p><p className="font-medium text-gray-800">{detailTarget.nif ?? '—'}</p></div>
                  <div><p className="text-[11px] text-gray-400">NIS</p><p className="font-medium text-gray-800">{detailTarget.nis ?? '—'}</p></div>
                  <div><p className="text-[11px] text-gray-400">RC</p><p className="font-medium text-gray-800">{detailTarget.rc ?? '—'}</p></div>
                  <div><p className="text-[11px] text-gray-400">Type</p><p className="font-medium text-gray-800">{detailTarget.type_client ?? '—'}</p></div>
                </div>
              </div>

              {/* Contact section */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{tlx('contact')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[11px] text-gray-400">Nom</p><p className="font-medium text-gray-800">{detailTarget.contact_nom} {detailTarget.contact_prenom}</p></div>
                  <div><p className="text-[11px] text-gray-400">Fonction</p><p className="font-medium text-gray-800">{detailTarget.contact_fonction ?? '—'}</p></div>
                  <div><p className="text-[11px] text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />Email</p><p className="font-medium text-gray-800 text-xs">{detailTarget.user?.email ?? '—'}</p></div>
                  <div><p className="text-[11px] text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />Tél.</p><p className="font-medium text-gray-800">{detailTarget.contact_telephone ?? detailTarget.telephone ?? '—'}</p></div>
                </div>
              </div>

              {/* Address section */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{tlx('address')}</p>
                <div className="text-sm space-y-1">
                  <p className="font-medium text-gray-800">{detailTarget.adresse ?? '—'}</p>
                  <p className="text-gray-600">{[detailTarget.ville, detailTarget.pays?.nom].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>

              {/* Submitted date */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{tlx('submitted')} : {formatDate(detailTarget.created_at)}</span>
              </div>

              {/* Rejection reason if rejected */}
              {detailTarget.statut === 'REJETE' && detailTarget.motif_rejet && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-rose-700 mb-1">{tlx('reject_motif').replace(' *', '')}</p>
                  <p className="text-sm text-rose-800 whitespace-pre-wrap">{detailTarget.motif_rejet}</p>
                </div>
              )}
            </div>
            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0 justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
              <button onClick={() => setDetailTarget(null)} className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600">
                {tlx('close')}
              </button>
              {detailTarget.statut === 'EN_ATTENTE_VALIDATION' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDetailTarget(null); setRejectTarget(detailTarget); setRejectMotif(''); setMotifError(false); }}
                    className="px-4 py-2 text-sm font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 transition"
                  >
                    {tlx('reject')}
                  </button>
                  <button
                    onClick={() => { setDetailTarget(null); setApproveTarget(detailTarget); }}
                    className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                  >
                    {tlx('approve')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Approve Confirm Modal ── */}
      {approveTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setApproveTarget(null); }}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{tlx('approve_title')}</h3>
            <p className="text-sm text-gray-500 mb-1">{tlx('approve_desc')}</p>
            <p className="text-sm font-semibold text-gray-800 mb-2">{approveTarget.raison_sociale} ?</p>
            <p className="text-xs text-gray-400 mb-6">{tlx('approve_note')}</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setApproveTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {tlx('cancel')}
              </button>
              <button
                onClick={() => approveMut.mutate(approveTarget.id)}
                disabled={approveMut.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {approveMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {tlx('approve')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Reject Modal ── */}
      {rejectTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setRejectTarget(null); }}
        >
          <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{tlx('reject_title')}</h3>
                  <p className="text-xs text-gray-400">{rejectTarget.raison_sociale}</p>
                </div>
              </div>
              <button onClick={() => setRejectTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-4 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{tlx('reject_motif')}</label>
                <textarea
                  rows={8}
                  value={rejectMotif}
                  onChange={e => { setRejectMotif(e.target.value); setMotifError(false); }}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none leading-relaxed ${
                    motifError
                      ? 'border-rose-400 focus:ring-rose-300/30'
                      : 'border-gray-200 focus:ring-[#0D1F3C]/20 focus:border-[#0D1F3C]'
                  }`}
                  placeholder="Ex: Documents manquants, NIF/NIS non fournis..."
                />
                {motifError && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{tlx('motif_required')}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />{tlx('reject_note')}
              </p>
            </div>
            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0 justify-end" dir={isRTL ? 'rtl' : 'ltr'}>
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {tlx('cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMut.isPending}
                className="px-5 py-2 text-sm font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {rejectMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {tlx('reject')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          style={{ zIndex: 999999 }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">{tlx('delete_title')}</h3>
            <p className="text-sm text-gray-500 mb-1">{tlx('delete_desc')}</p>
            <p className="text-sm font-semibold text-gray-800 mb-6">{deleteTarget.raison_sociale} ?</p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
              >
                {tlx('cancel')}
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteTarget.id)}
                disabled={deleteMut.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteMut.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {tlx('delete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
