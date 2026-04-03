import React from 'react';

type StatusKey = string;

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  // Demandes
  BROUILLON:        { label: 'Brouillon',        bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  EN_ATTENTE:       { label: 'En attente',        bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  EN_COURS:         { label: 'En cours',          bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  APPROUVE:         { label: 'Approuvé',          bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  REJETE:           { label: 'Rejeté',            bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  VALIDE:           { label: 'Validé',            bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  SIGNEE:           { label: 'Signée',            bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  ANNULE:           { label: 'Annulé',            bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  // Conteneurs
  EN_PORT:          { label: 'En port',           bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
  EN_ENTREPOT:      { label: 'En entrepôt',       bg: '#f5f3ff', color: '#5b21b6', dot: '#8b5cf6' },
  EN_LIVRAISON:     { label: 'En livraison',      bg: '#fff7ed', color: '#9a3412', dot: '#f97316' },
  LIVRE:            { label: 'Livré',             bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  // Factures
  EMISE:            { label: 'Émise',             bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  PAYEE:            { label: 'Payée',             bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  EN_RETARD:        { label: 'En retard',         bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
  CONTENTIEUX:      { label: 'Contentieux',       bg: '#fdf4ff', color: '#7e22ce', dot: '#a855f7' },
  // Clients
  EN_ATTENTE_VALIDATION: { label: 'En attente',   bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  SUSPENDU:         { label: 'Suspendu',          bg: '#fff1f2', color: '#9f1239', dot: '#f43f5e' },
  // Utilisateurs
  ACTIF:            { label: 'Actif',             bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  INACTIF:          { label: 'Inactif',           bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  BLOQUE:           { label: 'Bloqué',            bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

interface StatusBadgeProps { status: StatusKey; size?: 'sm' | 'md'; }

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = STATUS_MAP[status] ?? { label: status, bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' };
  const fs = size === 'sm' ? 10 : 11;
  const px = size === 'sm' ? '6px 10px' : '5px 12px';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.bg, color: cfg.color, fontSize: fs, fontWeight: 700, padding: px, borderRadius: 20, letterSpacing: '.03em', whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};
