import React from 'react';

export const Skeleton = ({ w = '100%', h = 16, radius = 6, className = '' }: { w?: string | number; h?: number; radius?: number; className?: string }) => (
  <div style={{ width: w, height: h, borderRadius: radius, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} className={className} />
);

export const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <Skeleton h={14} w={i === 0 ? '60%' : i === cols - 1 ? 80 : '80%'} />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Skeleton h={12} w="40%" />
    <Skeleton h={32} w="60%" />
    <Skeleton h={10} w="80%" />
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <>
    <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}
  </>
);
