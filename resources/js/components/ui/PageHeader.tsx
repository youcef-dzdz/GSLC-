import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  createLabel?: string;
  createHref?: string;
  onCreate?: () => void;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title, subtitle, createLabel, createHref, onCreate, actions,
}) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0D1F3C', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>{subtitle}</p>}
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {actions}
      {(createLabel && createHref) && (
        <Link
          to={createHref}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0D1F3C', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 14px rgba(13,31,60,.25)', transition: 'all .2s', border: '2px solid #0D1F3C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1a4a8c'; e.currentTarget.style.borderColor = '#1a4a8c'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0D1F3C'; e.currentTarget.style.borderColor = '#0D1F3C'; }}
        >
          <Plus size={16} /> {createLabel}
        </Link>
      )}
      {(createLabel && onCreate) && (
        <button
          onClick={onCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0D1F3C', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,31,60,.25)', transition: 'all .2s', border: '2px solid #0D1F3C' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#CFA030'; e.currentTarget.style.borderColor = '#CFA030'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#0D1F3C'; e.currentTarget.style.borderColor = '#0D1F3C'; }}
        >
          <Plus size={16} /> {createLabel}
        </button>
      )}
    </div>
  </div>
);
