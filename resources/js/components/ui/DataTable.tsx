import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, Download, InboxIcon } from 'lucide-react';
import { TableSkeleton } from './Skeleton';

export interface Column<T> {
  key: string;
  /** Translated label — pass t('table.col_name') from the parent */
  label: string;
  sortable?: boolean;
  width?: string | number;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  /** Already-paginated data from the server (data.data array) */
  data: T[];
  isLoading?: boolean;
  /** Full custom empty state node — shown when data is empty and not loading */
  emptyState?: ReactNode;
  rowKey: (row: T) => string | number;
  onExport?: () => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  emptyState,
  rowKey,
  onExport,
}: DataTableProps<T>) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Client-side sort applies only within the current server page
  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '');
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : data;

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <InboxIcon className="w-10 h-10 text-[#CBD5E1] mb-3" aria-hidden="true" />
      <p className="text-sm font-semibold text-[#6B7280]">{t('common.empty_state')}</p>
      <p className="text-xs text-[#94A3B8] mt-1">{t('common.empty_state_hint')}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">

      {/* Optional export toolbar */}
      {onExport && (
        <div className={`px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <button
            onClick={onExport}
            aria-label={t('common.export')}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-[#CFA030] text-[#CFA030] rounded-lg bg-white hover:bg-[#CFA030] hover:text-white transition-colors duration-150"
          >
            <Download size={13} aria-hidden="true" />
            {t('common.export')}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" role="grid">
          <thead>
            <tr className="bg-[#EDF2F7] border-b border-[#E2E8F0]">
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => col.sortable && toggleSort(col.key)}
                  style={{ width: col.width }}
                  className={[
                    'px-4 py-3 text-xs font-bold text-[#0D1F3C] uppercase tracking-wider whitespace-nowrap',
                    'select-none',
                    col.sortable ? 'cursor-pointer hover:bg-[#E2E8F0] transition-colors duration-100' : '',
                    isRTL ? 'text-right' : 'text-left',
                    col.className ?? '',
                  ].join(' ')}
                >
                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span
                        className={sortKey === col.key ? 'text-[#0D1F3C]' : 'text-[#CBD5E1]'}
                        aria-hidden="true"
                      >
                        {sortKey === col.key && sortDir === 'desc'
                          ? <ChevronDown size={12} />
                          : <ChevronUp size={12} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={columns.length} />
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState ?? defaultEmptyState}
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  className={[
                    'border-b border-[#F1F5F9] transition-colors duration-100',
                    idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]',
                    'hover:bg-[#EBF4FF]',
                  ].join(' ')}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={[
                        'px-4 py-3 text-sm text-[#1E293B] align-middle',
                        isRTL ? 'text-right' : 'text-left',
                        col.className ?? '',
                      ].join(' ')}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
