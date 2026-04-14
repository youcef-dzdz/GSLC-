import React from 'react';
import { usePermission } from '../../hooks/usePermission';
import type { RoleLabel } from '../../types/auth';

interface CanProps {
  /** Rôles autorisés à voir le contenu */
  roles: RoleLabel[];
  /** Contenu à afficher si autorisé */
  children: React.ReactNode;
  /** Contenu alternatif si non autorisé (optionnel) */
  fallback?: React.ReactNode;
}

/**
 * Composant d'autorisation déclaratif.
 *
 * Utilisation :
 *   <Can roles={['admin', 'it_agent']}>
 *     <button>Supprimer</button>
 *   </Can>
 *
 *   <Can roles={['admin']} fallback={<span>Lecture seule</span>}>
 *     <button>Modifier</button>
 *   </Can>
 */
export function Can({ roles, children, fallback = null }: CanProps) {
  const { can } = usePermission();
  return can(...roles) ? <>{children}</> : <>{fallback}</>;
}
