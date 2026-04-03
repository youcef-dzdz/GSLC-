import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, perPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalItems);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btn = (active: boolean) => ({
    minWidth: 36, height: 36, border: active ? 'none' : '1px solid #e2e8f0',
    borderRadius: 8, background: active ? '#0D1F3C' : '#fff',
    color: active ? '#fff' : '#475569', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', flexWrap: 'wrap', gap: 12 }}>
      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
        Affichage <strong style={{ color: '#0D1F3C' }}>{from}–{to}</strong> sur <strong style={{ color: '#0D1F3C' }}>{totalItems}</strong> enregistrements
      </p>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button style={btn(false)} disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 13 }}>···</span>
          ) : (
            <button key={p} style={btn(p === currentPage)} onClick={() => onPageChange(p as number)}>{p}</button>
          )
        )}
        <button style={btn(false)} disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
