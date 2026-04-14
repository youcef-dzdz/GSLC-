import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditRow {
  id: number;
  utilisateur: string;
  action: string;
  table_cible: string;
  enregistrement_id: string | null;
  description: string;
  adresse_ip: string | null;
  resultat: string;
  date_action: string;
}

interface PaginatedAudit {
  data: AuditRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_OPTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'BLOCK', 'EXPORT'];

const ACTION_BADGE: Record<string, string> = {
  LOGIN:  'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  LOGOUT: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  CREATE: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  UPDATE: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  DELETE: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  BLOCK:  'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
  EXPORT: 'bg-teal-100 text-teal-700 ring-1 ring-teal-200',
};

// ACTION_LABELS replaced by t() calls — kept for fallback key reference only
const ACTION_LABEL_KEYS: Record<string, string> = {
  LOGIN:  'admin.audit.action_login',
  LOGOUT: 'admin.audit.action_system',
  CREATE: 'admin.audit.action_create',
  UPDATE: 'admin.audit.action_update',
  DELETE: 'admin.audit.action_delete',
  BLOCK:  'admin.audit.action_block',
  EXPORT: 'admin.audit.action_system',
};

const TABLE_LABELS: Record<string, string> = {
  users:       'Utilisateurs',
  departments: 'Départements',
  positions:   'Postes',
  roles:       'Rôles',
  clients:     'Clients',
  devis:       'Devis',
  contrats:    'Contrats',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { t } = useTranslation();
  const { hasPermission, isAdmin } = usePermission();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin && !hasPermission('audit.view')) {
      navigate('/admin/dashboard');
    }
  }, []);

  const [userSearch, setUserSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(1);

  // Submitted filter state (applied on search click or Enter)
  const [appliedUser, setAppliedUser]     = useState('');
  const [appliedAction, setAppliedAction] = useState('');
  const [appliedDebut, setAppliedDebut]   = useState('');
  const [appliedFin, setAppliedFin]       = useState('');

  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {};
      if (appliedUser)   params.user       = appliedUser;
      if (appliedAction) params.action     = appliedAction;
      if (appliedDebut)  params.date_debut = appliedDebut;
      if (appliedFin)    params.date_fin   = appliedFin;

      const res = await apiClient.get('/api/admin/audit-logs/export', {
        params,
        responseType: 'blob',
      });

      const today = new Date().toISOString().slice(0, 10);
      const url   = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link  = document.createElement('a');
      link.href        = url;
      link.download    = `audit_log_${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const applyFilters = () => {
    setAppliedUser(userSearch);
    setAppliedAction(actionFilter);
    setAppliedDebut(dateDebut);
    setAppliedFin(dateFin);
    setPage(1);
  };

  const resetFilters = () => {
    setUserSearch(''); setActionFilter(''); setDateDebut(''); setDateFin('');
    setAppliedUser(''); setAppliedAction(''); setAppliedDebut(''); setAppliedFin('');
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery<PaginatedAudit>({
    queryKey: ['admin-audit', appliedUser, appliedAction, appliedDebut, appliedFin, page],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (appliedUser)   params.user       = appliedUser;
      if (appliedAction) params.action     = appliedAction;
      if (appliedDebut)  params.date_debut = appliedDebut;
      if (appliedFin)    params.date_fin   = appliedFin;
      const res = await apiClient.get('/api/admin/audit-logs', { params });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  const rows       = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;
  const total      = data?.total ?? 0;

  const formatDate = (raw: string) => {
    const d = new Date(raw);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const tableLabel = (tbl: string) => TABLE_LABELS[tbl] ?? tbl;
  const actionBadge = (a: string) => ACTION_BADGE[a] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
  const actionLabel = (a: string) => ACTION_LABEL_KEYS[a] ? t(ACTION_LABEL_KEYS[a]) : a;

  // ── Pagination helpers ───────────────────────────────────────────────────────
  const pageNumbers = (): (number | '…')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 border-l-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF, #FFFBEB)',
          borderLeftColor: '#CFA030',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3C]">{t('admin.audit.title')}</h1>
            <p className="text-sm text-[#6B7280] mt-1">
              {total > 0 ? `${total.toLocaleString('fr-FR')} ${t('admin.audit.entries')}` : t('admin.audit.title')}
            </p>
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            disabled={isExporting}
            title="Exporter le journal en CSV"
            className="btn-gold disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? t('admin.audit.exporting') : t('admin.audit.export_csv')}
          </button>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white p-4">
        <div className="filter-bar">

          {/* Search user */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              {t('admin.audit.label_user')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                placeholder="Rechercher..."
                className="w-full"
              />
            </div>
          </div>

          {/* Action select */}
          <div className="min-w-[160px]">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              {t('admin.audit.label_action')}
            </label>
            <div className="relative">
              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="w-full appearance-none"
              >
                <option value="">{t('admin.audit.all_actions')}</option>
                {ACTION_OPTIONS.map(a => (
                  <option key={a} value={a}>{actionLabel(a)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date début */}
          <div className="min-w-[150px]">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              {t('admin.audit.label_date_start')}
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Date fin */}
          <div className="min-w-[150px]">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              {t('admin.audit.label_date_end')}
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 self-end">
            <button
              onClick={applyFilters}
              className="btn-gold"
            >
              {t('admin.audit.filter')}
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-[#E2E8F0]
                         text-[#6B7280] hover:bg-gray-50 transition-all duration-150 cursor-pointer"
            >
              {t('admin.audit.reset')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white overflow-hidden">

        {isLoading && (
          <div className="flex items-center justify-center h-48 text-[#94A3B8] text-sm">
            {t('common.loading')}
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center h-48 text-red-500 text-sm">
            {t('admin.audit.error_load')}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>{t('admin.audit.col_user')}</th>
                  <th className="col-status">{t('admin.audit.col_action')}</th>
                  <th>{t('admin.audit.col_table')}</th>
                  <th>{t('admin.audit.col_description')}</th>
                  <th>{t('admin.audit.col_ip')}</th>
                  <th className="col-date">{t('admin.audit.col_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#94A3B8]">
                      {t('admin.audit.empty')}
                    </td>
                  </tr>
                ) : rows.map(row => (
                  <tr
                    key={row.id}
                  >
                    {/* Utilisateur */}
                    <td>
                      <span className="font-medium">{row.utilisateur}</span>
                    </td>

                    {/* Action badge */}
                    <td className="col-status">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${actionBadge(row.action)}`}>
                        {actionLabel(row.action)}
                      </span>
                    </td>

                    {/* Table cible */}
                    <td>
                      <span className="font-mono text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5">
                        {tableLabel(row.table_cible)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="max-w-[280px]">
                      <span className="line-clamp-2" title={row.description}>
                        {row.description}
                      </span>
                    </td>

                    {/* IP */}
                    <td>
                      <span className="font-mono text-[12px] text-[#94A3B8]">
                        {row.adresse_ip ?? '—'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="col-date">
                      {formatDate(row.date_action)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-[#6B7280]">
            Page <span className="font-semibold text-[#0D1F3C]">{page}</span> sur{' '}
            <span className="font-semibold text-[#0D1F3C]">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-[#E2E8F0] text-[#6B7280]
                         hover:bg-[#F0F7FF] hover:text-[#0D1F3C] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {pageNumbers().map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-[#94A3B8] text-sm select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer flex items-center justify-center
                    ${p === page
                      ? 'btn-gold shadow-sm'
                      : 'border border-[#E2E8F0] text-[#475569] hover:bg-[#F0F7FF]'
                    }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl border border-[#E2E8F0] text-[#6B7280]
                         hover:bg-[#F0F7FF] hover:text-[#0D1F3C] disabled:opacity-40
                         disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
