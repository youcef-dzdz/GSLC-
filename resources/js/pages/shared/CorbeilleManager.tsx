import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw, Eye, Inbox, RefreshCw, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CorbeilleItem {
  id: number;
  model_type: string;
  model_id: number;
  snapshot: object;
  deleted_by: number;
  deleted_by_name: string;
  deleted_by_email: string;
  deleted_by_role: string;
  deleted_by_ip: string;
  deleted_at_audit: string;
  expires_at: string;
  restored_at: string | null;
  restored_by_name: string | null;
  restored_by_ip: string | null;
  is_expired: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractModelName(modelType: string): string {
  const parts = modelType.split('\\');
  return parts[parts.length - 1] ?? modelType;
}

function formatDateTime(raw: string, locale: string): string {
  const d = new Date(raw);
  return (
    d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  );
}

function formatDate(raw: string, locale: string): string {
  return new Date(raw).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function expiresColorClass(item: CorbeilleItem): string {
  if (item.is_expired) return 'text-red-500';
  const msUntilExpiry = new Date(item.expires_at).getTime() - Date.now();
  if (msUntilExpiry < 48 * 60 * 60 * 1000) return 'text-amber-500';
  return 'text-gray-600';
}

function getItemLabel(item: CorbeilleItem): string {
  const s = item.snapshot as Record<string, unknown>;
  const modelName = extractModelName(item.model_type);
  if (modelName === 'User') {
    const nom    = (s.nom    as string) ?? '';
    const prenom = (s.prenom as string) ?? '';
    const email  = (s.email  as string) ?? '';
    return `${nom} ${prenom} (${email})`.trim();
  }
  return String(s.nom ?? s.name ?? s.titre ?? s.numero ?? s.code ?? `ID #${item.model_id}`);
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CorbeilleManager() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CorbeilleItem | null>(null);
  const [filter, setFilter]             = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const {
    data,
    isLoading: loading,
    isError: isQueryError,
    refetch,
  } = useQuery({
    queryKey: ['admin-corbeille', appliedFilter],
    queryFn:  () =>
      adminService.getCorbeilleItems(appliedFilter || undefined)
        .then(r => (r.data.data ?? []) as CorbeilleItem[]),
  });

  const items: CorbeilleItem[] = data ?? [];

  // Success auto-dismiss (UI timer — not an API call, useEffect allowed)
  useEffect(() => {
    if (!success) return;
    const tid = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(tid);
  }, [success]);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const total      = items.length;
  const expired    = items.filter(i => i.is_expired).length;
  const restorable = items.filter(i => !i.is_expired && i.restored_at === null).length;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const restoreMut = useMutation({
    mutationFn: (id: number) => adminService.restoreCorbeille(id),
    onMutate:   (id) => setActionLoading(id),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin-corbeille', appliedFilter] });
      setSuccess(t('corbeille.success_restored'));
      setError(null);
    },
    onError: (err: any) =>
      setError(err?.response?.data?.message ?? t('corbeille.error_restore')),
    onSettled: () => setActionLoading(null),
  });

  const forceDeleteMut = useMutation({
    mutationFn: (id: number) => adminService.forceDeleteCorbeille(id),
    onMutate:   (id) => { setConfirmDeleteId(null); setActionLoading(id); },
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin-corbeille', appliedFilter] });
      setSuccess(t('corbeille.success_deleted'));
      setError(null);
    },
    onError: (err: any) =>
      setError(err?.response?.data?.message ?? t('corbeille.error_delete')),
    onSettled: () => setActionLoading(null),
  });

  const handleRestore     = (id: number) => restoreMut.mutate(id);
  const handleForceDelete = (id: number) => forceDeleteMut.mutate(id);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 border-l-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #EFF6FF, #FFF5F5)',
          borderLeftColor: '#1A4A8C',
        }}
      >
        <div className="flex items-center gap-3">
          <Trash2 className="w-7 h-7 text-[#1A4A8C]" />
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3C]">{t('corbeille.title')}</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">
              {t('corbeille.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Error state ────────────────────────────────────────────────────── */}
      {(error || isQueryError) && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm flex-1">{error ?? t('corbeille.error_load')}</span>
          <button
            onClick={() => { setError(null); refetch(); }}
            className="text-sm font-medium underline hover:no-underline"
          >
            {t('corbeille.retry')}
          </button>
        </div>
      )}

      {/* ── Success state ──────────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
          <span className="text-sm flex-1">{success}</span>
        </div>
      )}

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
              {t('corbeille.filter_label')}
            </label>
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setAppliedFilter(filter); }}
              placeholder={t('corbeille.filter_placeholder')}
              className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm
                         text-[#0D1F3C] focus:outline-none focus:ring-2 focus:ring-[#1A4A8C]/30"
            />
          </div>

          <button
            onClick={() => setAppliedFilter(filter)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A4A8C] text-white
                       rounded-xl text-sm font-medium hover:bg-[#163d78] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('corbeille.refresh')}
          </button>

          {appliedFilter && (
            <button
              onClick={() => { setFilter(''); setAppliedFilter(''); }}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-[#E2E8F0]
                         text-[#6B7280] hover:bg-gray-50 transition-colors"
            >
              {t('corbeille.clear')}
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('corbeille.total'),        value: total,      color: 'text-[#0D1F3C]' },
            { label: t('corbeille.expired_count'),      value: expired,    color: 'text-red-500'   },
            { label: t('corbeille.restorable'), value: restorable, color: 'text-emerald-600' },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-[#6B7280] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl shadow-md border border-[#E2E8F0] bg-white">

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
            <Inbox className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-base font-medium">{t('corbeille.empty_title')}</p>
            <p className="text-sm mt-1">{t('corbeille.empty_subtitle')}</p>
          </div>
        )}

        {(loading || items.length > 0) && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  {[
                    t('corbeille.col_type'), 'ID', t('corbeille.col_label'), t('corbeille.col_deleted_by'), t('corbeille.col_date'),
                    t('corbeille.col_expires'), t('corbeille.col_status'), t('corbeille.col_actions'),
                  ].map((col, idx, arr) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-left text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider whitespace-nowrap${idx === arr.length - 1 ? ' min-w-[200px]' : ''}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F1F5F9]">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : items.map(item => {
                  const modelName = extractModelName(item.model_type);
                  const expColor  = expiresColorClass(item);
                  const isActing  = actionLoading === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="bg-[#F0F4F8] text-[#0D1F3C] font-mono text-xs px-2 py-1 rounded">
                          {modelName}
                        </span>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3 text-sm text-[#6B7280] font-mono">
                        #{item.model_id}
                      </td>

                      {/* Nom / Intitulé */}
                      <td className="px-4 py-3 text-sm text-[#0D1F3C] max-w-[180px] truncate">
                        {getItemLabel(item)}
                      </td>

                      {/* Supprimé par */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#0D1F3C]">
                          {item.deleted_by_name}
                        </p>
                        <p className="text-xs text-[#94A3B8]">{item.deleted_by_role}</p>
                      </td>

                      {/* Date suppression */}
                      <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap">
                        {formatDateTime(item.deleted_at_audit, i18n.language)}
                      </td>

                      {/* Expire le */}
                      <td className={`px-4 py-3 text-sm whitespace-nowrap ${expColor}`}>
                        {formatDate(item.expires_at, i18n.language)}
                        {item.is_expired && (
                          <span className="ml-1">{t('corbeille.expired_suffix')}</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        {item.is_expired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                           text-xs font-semibold bg-red-100 text-red-700
                                           ring-1 ring-red-200">
                            {t('corbeille.status_expired')}
                          </span>
                        ) : item.restored_at !== null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                           text-xs font-semibold bg-emerald-100 text-emerald-700
                                           ring-1 ring-emerald-200">
                            {t('corbeille.status_restored')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                           text-xs font-semibold bg-blue-100 text-blue-700
                                           ring-1 ring-blue-200">
                            {t('corbeille.status_active')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">

                          {/* Aperçu */}
                          <button
                            onClick={() => setSelectedItem(item)}
                            title="Aperçu du snapshot"
                            className="p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F0F4F8]
                                       hover:text-[#0D1F3C] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Restaurer — visible only when eligible */}
                          {!item.is_expired && item.restored_at === null && (
                            <button
                              onClick={() => handleRestore(item.id)}
                              disabled={isActing}
                              title={t('corbeille.restore')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50
                                         disabled:opacity-40 disabled:cursor-not-allowed
                                         transition-colors"
                            >
                              <RotateCcw
                                className={`w-4 h-4 ${isActing ? 'animate-spin' : ''}`}
                              />
                            </button>
                          )}

                          {/* Supprimer définitivement */}
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              disabled={isActing}
                              title={t('corbeille.delete_permanent')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50
                                         disabled:opacity-40 disabled:cursor-not-allowed
                                         transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {confirmDeleteId !== null && createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteId(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-[#0D2A5E] text-center mb-2">
              {t('corbeille.delete_permanent')}
            </h3>
            <p className="text-sm text-[#64748B] text-center mb-6">
              {t('corbeille.confirm_delete_msg')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                {t('corbeille.cancel')}
              </button>
              <button
                onClick={() => handleForceDelete(confirmDeleteId)}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                {t('corbeille.confirm_delete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Snapshot Modal ─────────────────────────────────────────────────── */}
      {selectedItem !== null && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
          onClick={e => { if (e.target === e.currentTarget) setSelectedItem(null); }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6
                          max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0D1F3C]">
                Aperçu —{' '}
                {extractModelName(selectedItem.model_type)} #{selectedItem.model_id}
              </h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#94A3B8] hover:text-[#0D1F3C] text-xl leading-none
                           transition-colors"
                aria-label={t('corbeille.modal_close')}
              >
                ✕
              </button>
            </div>

            {/* Snapshot key-value grid */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 max-h-64 overflow-y-auto">
              {selectedItem.snapshot && typeof selectedItem.snapshot === 'object'
                ? Object.entries(selectedItem.snapshot)
                    .filter(([, v]) => v !== null && v !== undefined)
                    .map(([k, v]) => (
                      <div key={k} className="flex gap-3 py-1 border-b border-[#EEF5FF] last:border-0">
                        <span className="text-[11px] font-semibold text-[#5A80BB] w-36 flex-shrink-0 capitalize">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-[#0D2A5E] break-all">
                          {typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : String(v)}
                        </span>
                      </div>
                    ))
                : <span className="text-[11px] text-[#88A8D0]">Aucune donnée</span>
              }
            </div>

            {/* Metadata grid */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                { label: t('corbeille.modal_deleted_by'), value: selectedItem.deleted_by_name },
                { label: 'Email',        value: selectedItem.deleted_by_email },
                { label: 'Rôle',         value: selectedItem.deleted_by_role  ?? '—' },
                { label: 'IP',           value: selectedItem.deleted_by_ip    ?? '—' },
                { label: 'Date',         value: formatDateTime(selectedItem.deleted_at_audit, i18n.language) },
                { label: t('corbeille.col_expires'),    value: formatDate(selectedItem.expires_at, i18n.language) },
              ].map(meta => (
                <div key={meta.label} className="bg-[#F8FAFC] rounded-lg p-3">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase
                                tracking-wider mb-0.5">
                    {meta.label}
                  </p>
                  <p className="text-[#0D1F3C] font-mono text-xs truncate">
                    {meta.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Close */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#6B7280]
                           hover:bg-gray-50 text-sm transition-colors"
              >
                {t('corbeille.modal_close')}
              </button>
            </div>

          </div>
        </div>
      , document.getElementById('portal-root') ?? document.body)}

    </div>
  );
}
