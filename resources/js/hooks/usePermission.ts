import { useAuth } from '../context/AuthContext';
import type { RoleLabel } from '../types/auth';

/**
 * Hook d'autorisation basé sur le rôle ET les permissions réelles de l'utilisateur.
 *
 * Utilisation :
 *   const { can, hasPermission, isAdmin } = usePermission();
 *   if (can('admin', 'it_agent')) { ... }
 *   if (hasPermission('users.view')) { ... }
 */
export function usePermission() {
  const { user } = useAuth();
  const role = user?.role?.label as RoleLabel | undefined;
  const permissions: string[] = user?.role?.permissions ?? [];

  /**
   * Retourne true si le rôle actuel est dans la liste fournie.
   * Sans argument → retourne true si l'utilisateur est connecté.
   */
  const can = (...roles: RoleLabel[]): boolean => {
    if (!role) return false;
    if (roles.length === 0) return true;
    return roles.includes(role);
  };

  /**
   * Retourne true si le rôle actuel N'EST PAS dans la liste fournie.
   */
  const cannot = (...roles: RoleLabel[]): boolean => !can(...roles);

  /**
   * true si admin OU si la permission est dans la liste du rôle.
   */
  const hasPermission = (permission: string): boolean => {
    if (role === 'admin') return true;
    return permissions.includes(permission);
  };

  /**
   * true si admin OU si AU MOINS UNE permission est présente.
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    if (role === 'admin') return true;
    return perms.some(p => permissions.includes(p));
  };

  /**
   * true si admin OU si TOUTES les permissions sont présentes.
   */
  const hasAllPermissions = (...perms: string[]): boolean => {
    if (role === 'admin') return true;
    return perms.every(p => permissions.includes(p));
  };

  return {
    role,
    permissions,
    can,
    cannot,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin:      role === 'admin',
    isItAgent:    role === 'it_agent',
    isDirecteur:  role === 'directeur',
    isCommercial: role === 'commercial',
    isLogistique: role === 'logistique',
    isFinancier:  role === 'financier',
    isClient:     role === 'client',
    isStaff:      role !== undefined && role !== 'client',
  };
}
