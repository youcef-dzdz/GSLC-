import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Anchor, Truck,
  CreditCard, Box, Settings, ClipboardList, Briefcase,
  BarChart2, MapPin, Receipt, Package, Ship, Bell,
  ShieldCheck, Building2, Tag, Lock,
} from 'lucide-react';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:            '#1E3A8A',          // deep navy
  bgFrom:        '#1E3A8A',
  bgTo:          '#1E40AF',
  border:        'rgba(255,255,255,0.08)',
  groupLabel:    '#FFFFFF',
  itemText:      'rgba(255,255,255,0.78)',
  itemTextHover: '#FFFFFF',
  activeText:    '#1E3A8A',
  activeBg:      '#FFFFFF',
  activeShadow:  '0 2px 10px rgba(0,0,0,0.15)',
  hoverBg:       'rgba(255,255,255,0.10)',
  iconColor:     'rgba(255,255,255,0.55)',
  iconActive:    '#1E40AF',
  accent:        '#F59E0B',
  accentDim:     'rgba(245,158,11,0.18)',
};

// ─── Types ──────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
}

interface NavGroup {
  groupKey:   string;
  groupLabel: string;
  items:      NavItem[];
}

type NavDef = NavItem | NavGroup;

const isNavGroup = (def: NavDef): def is NavGroup => 'items' in def;

// ─── Nav definitions ────────────────────────────────────────────────────────────

const getNavLinks = (role: string, permissions: string[] = []): NavDef[] => {
  const dashboard: NavItem = {
    to: `/${rolePrefix(role)}/dashboard`,
    icon: LayoutDashboard,
    labelKey: 'nav.dashboard',
  };

  const isAdmin = role === 'admin';
  const hasPerm = (p: string) => isAdmin || permissions.includes(p);

  switch (role) {
    case 'admin':
    case 'it_agent': {
      const accessItems: NavItem[] = [
        hasPerm('users.view')   ? { to: '/admin/users',       icon: Users,       labelKey: 'nav.users'       } : null,
        isAdmin                 ? { to: '/admin/roles',       icon: ShieldCheck, labelKey: 'nav.roles'       } : null,
        isAdmin                 ? { to: '/admin/permissions', icon: Lock,        labelKey: 'nav.permissions' } : null,
      ].filter(Boolean) as NavItem[];

      const structureItems: NavItem[] = [
        (hasPerm('departments.manage') || hasPerm('departments.view')) ? { to: '/admin/departments', icon: Building2, labelKey: 'nav.departments' } : null,
        (hasPerm('positions.manage') || hasPerm('positions.view'))     ? { to: '/admin/positions',   icon: Tag,       labelKey: 'nav.positions'   } : null,
      ].filter(Boolean) as NavItem[];

      const operationsItems: NavItem[] = [
        (hasPerm('registrations.manage') || hasPerm('registrations.view')) ? { to: '/admin/registrations', icon: ClipboardList, labelKey: 'nav.registrations' } : null,
      ].filter(Boolean) as NavItem[];

      const systemItems: NavItem[] = [
        (isAdmin || hasPerm('audit.view'))         ? { to: '/admin/audit',         icon: FileText, labelKey: 'nav.audit'                } : null,
        (isAdmin || hasPerm('config.view') || hasPerm('config.manage')) ? { to: '/admin/config',        icon: Settings, labelKey: 'nav.config'               } : null,
        (isAdmin || hasPerm('notifications.view')) ? { to: '/admin/notifications', icon: Bell,     labelKey: 'nav.notifications.title' } : null,
      ].filter(Boolean) as NavItem[];

      const groups = [
        dashboard,
        accessItems.length     ? { groupLabel: 'Gestion des Accès',        groupKey: 'nav.group_access',     items: accessItems     } : null,
        structureItems.length  ? { groupLabel: "Structure de l'Entreprise", groupKey: 'nav.group_structure',  items: structureItems  } : null,
        operationsItems.length ? { groupLabel: 'Opérations',                groupKey: 'nav.group_operations', items: operationsItems } : null,
        systemItems.length     ? { groupLabel: 'Système',                   groupKey: 'nav.group_system',     items: systemItems     } : null,
      ].filter(Boolean);

      return groups as NavGroup[];
    }
    case 'client':
      return [
        dashboard,
        { to: '/client/demands',    icon: ClipboardList, labelKey: 'nav.demands'   },
        { to: '/client/quotes',     icon: Receipt,       labelKey: 'nav.quotes'    },
        { to: '/client/contracts',  icon: FileText,      labelKey: 'nav.contracts' },
        { to: '/client/invoices',   icon: CreditCard,    labelKey: 'nav.invoices'  },
        { to: '/client/containers', icon: Box,           labelKey: 'nav.containers'},
      ];
    case 'commercial': {
      const commercialItems: NavItem[] = [
        hasPerm('demands.view')   ? { to: '/commercial/demands',   icon: ClipboardList, labelKey: 'nav.demands'   } : null,
        hasPerm('quotes.manage')  ? { to: '/commercial/quotes',    icon: Receipt,       labelKey: 'nav.quotes'    } : null,
        hasPerm('contracts.view') ? { to: '/commercial/contracts', icon: FileText,      labelKey: 'nav.contracts' } : null,
        hasPerm('clients.manage') ? { to: '/commercial/clients',   icon: Users,         labelKey: 'nav.clients'   } : null,
        hasPerm('vessels.view')   ? { to: '/commercial/vessels',   icon: Ship,          labelKey: 'nav.vessels'   } : null,
        hasPerm('archive.view')   ? { to: '/commercial/archive',   icon: Package,       labelKey: 'nav.archive'   } : null,
      ].filter(Boolean) as NavItem[];
      return [dashboard, ...commercialItems];
    }
    case 'logistique': {
      const logistiqueItems: NavItem[] = [
        hasPerm('containers.manage') ? { to: '/logistics/containers', icon: Box,       labelKey: 'nav.containers' } : null,
        hasPerm('warehouse.manage')  ? { to: '/logistics/warehouse',  icon: MapPin,    labelKey: 'nav.warehouse'  } : null,
        hasPerm('vessels.view')      ? { to: '/logistics/vessels',    icon: Ship,      labelKey: 'nav.vessels'    } : null,
        hasPerm('customs.manage')    ? { to: '/logistics/customs',    icon: Briefcase, labelKey: 'nav.customs'    } : null,
        hasPerm('movements.manage')  ? { to: '/logistics/movements',  icon: Truck,     labelKey: 'nav.movements'  } : null,
      ].filter(Boolean) as NavItem[];
      return [dashboard, ...logistiqueItems];
    }
    case 'financier': {
      const financierItems: NavItem[] = [
        hasPerm('invoices.manage') ? { to: '/finance/invoices',  icon: Receipt,    labelKey: 'nav.invoices'  } : null,
        hasPerm('payments.manage') ? { to: '/finance/payments',  icon: CreditCard, labelKey: 'nav.payments'  } : null,
      ].filter(Boolean) as NavItem[];
      return [dashboard, ...financierItems];
    }
    case 'directeur': {
      const directeurItems: NavItem[] = [
        hasPerm('contracts.approve') ? { to: '/director/contracts', icon: FileText,  labelKey: 'nav.contracts_pending' } : null,
        hasPerm('reports.view')      ? { to: '/director/reports',   icon: BarChart2, labelKey: 'nav.reports'           } : null,
        hasPerm('risk.view')         ? { to: '/director/risk-map',  icon: Anchor,    labelKey: 'nav.risk_map'          } : null,
      ].filter(Boolean) as NavItem[];
      return [dashboard, ...directeurItems];
    }
    default:
      return [dashboard];
  }
};


function rolePrefix(role: string): string {
  switch (role) {
    case 'logistique': return 'logistics';
    case 'directeur':  return 'director';
    case 'financier':  return 'finance';
    case 'it_agent':   return 'admin';
    default:           return 'admin'; // Rôles custom → fallback admin dashboard
  }
}

// ─── Component ──────────────────────────────────────────────────────────────────

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language.startsWith('ar');

  if (!user) return null;

  const links = getNavLinks(user.role.label, user.role.permissions ?? []);

  const sideStyle: React.CSSProperties = {
    position:  'fixed',
    top: 64, bottom: 0,
    ...(isRTL
      ? { right: 0, left: 'auto' }
      : { left:  0, right: 'auto' }),
    width: 256,
    background: `linear-gradient(160deg, ${C.bgFrom} 0%, ${C.bgTo} 100%)`,
    borderRight: isRTL ? 'none' : `1px solid ${C.border}`,
    borderLeft:  isRTL ? `1px solid ${C.border}` : 'none',
    boxShadow: isRTL
      ? '-4px 0 24px rgba(30,58,138,0.25)'
      : '4px 0 24px rgba(30,58,138,0.25)',
    zIndex: 40,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
    transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
    direction: isRTL ? 'rtl' : 'ltr',
  };

  // ── NavLink style ──
  const navLinkStyle = (isActive: boolean, grouped = false): React.CSSProperties => ({
    display:       'flex',
    alignItems:    'center',
    flexDirection: 'row',
    gap: 10,
    padding: grouped
      ? (isRTL ? '9px 24px 9px 12px' : '9px 12px 9px 24px')
      : '10px 12px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    textDecoration: 'none',
    width: '100%',
    color:      isActive ? C.activeText : C.itemText,
    background: isActive ? C.activeBg  : 'transparent',
    boxShadow:  isActive ? C.activeShadow : 'none',
    ...(isRTL
      ? { borderRight: isActive ? `3px solid ${C.accent}` : '3px solid transparent', borderLeft: 'none' }
      : { borderLeft:  isActive ? `3px solid ${C.accent}` : '3px solid transparent', borderRight: 'none' }),
    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
    letterSpacing: '0.01em',
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    // Check if it's already white (active state) to avoid overriding it with hover background
    const isSolidActive = el.style.background.includes('rgb(255, 255, 255)') || el.style.background.includes('#ffffff');
    if (!isSolidActive) {
      el.style.background = C.hoverBg;
      el.style.color      = C.itemTextHover;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const isSolidActive = el.style.background.includes('rgb(255, 255, 255)') || el.style.background.includes('#ffffff');
    if (!isSolidActive) {
      el.style.background = 'transparent';
      el.style.color      = C.itemText;
    }
  };

  // ── Icon color helper ──
  const iconStyle = (isActive: boolean): React.CSSProperties => ({
    flexShrink: 0,
    color: isActive ? C.iconActive : C.iconColor,
    transition: 'color 0.18s',
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside style={sideStyle} className="lg:!translate-x-0">

        {/* Subtle top separator */}
        <div style={{ height: 1, background: C.border, flexShrink: 0 }} />

        {/* ── Nav ── */}
        <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map((def, idx) => {

            // ── Group ──
            if (isNavGroup(def)) {
              return (
                <div key={idx} style={{ marginTop: idx === 0 ? 0 : 10, marginBottom: 2 }}>
                  {/* Section label */}
                  <p style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: C.groupLabel,
                    padding: isRTL ? '8px 14px 4px' : '8px 14px 4px',
                    margin: 0,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                    {t(def.groupKey, def.groupLabel)}
                  </p>

                  {/* Thin divider */}
                  <div style={{ height: 1, background: C.border, margin: '2px 4px 6px' }} />

                  {/* Items */}
                  {def.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                        style={({ isActive }) => navLinkStyle(isActive, true)}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={15} style={iconStyle(isActive)} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t(item.labelKey)}
                            </span>
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            // ── Plain item (dashboard) ──
            const Icon = def.icon;
            return (
              <NavLink
                key={def.to}
                to={def.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                style={({ isActive }) => navLinkStyle(isActive, false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} style={iconStyle(isActive)} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t(def.labelKey)}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Bottom accent strip ── */}
        <div style={{
          margin: '0 10px 12px',
          borderRadius: 10,
          padding: '10px 14px',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.22)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#F59E0B',
            boxShadow: '0 0 6px rgba(245,158,11,0.6)',
            animation: 'sidebarPulse 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,158,11,0.9)', letterSpacing: '0.05em' }}>
            NASHCO · GSLC
          </span>
        </div>

        <style>{`
          @keyframes sidebarPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.85); }
          }
          /* Custom scrollbar for sidebar */
          aside::-webkit-scrollbar { width: 4px; }
          aside::-webkit-scrollbar-track { background: transparent; }
          aside::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
          aside::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

          /* ================= GLOBAL BACKGROUND (Scoped) ================= */
          body.gslc-premium-theme-active, 
          body.gslc-premium-theme-active #root, 
          body.gslc-premium-theme-active .min-h-screen {
            background: linear-gradient(135deg, #EFF6FF, #FFFBEB) !important;
          }

          /* ================= GOLD DESIGN SYSTEM ================= */
          
          /* Primary Gold Button (.btn-gold) */
          .btn-gold {
            background-color: white !important;
            color: #C9A646 !important;
            border: 2px solid #C9A646 !important;
            padding: 6px 16px !important;
            border-radius: 10px !important;
            font-weight: 700 !important;
            font-size: 13px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.02em !important;
          }

          .btn-gold:hover, .btn-gold:focus {
            background-color: #C9A646 !important;
            color: white !important;
            box-shadow: 0 4px 12px rgba(201, 166, 70, 0.3) !important;
          }

          .btn-gold:active {
            transform: scale(0.97) !important;
          }

          /* Premium Layout Table Styles */
          .gslc-premium-theme table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: separate !important;
            border-spacing: 0 !important;
            border: 1px solid #C9A646 !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }

          /* RTL Support for Table Direction */
          [dir="rtl"] .gslc-premium-theme table {
            direction: rtl !important;
          }

          .gslc-premium-theme thead tr {
            background-color: #C9A646 !important;
          }

          .gslc-premium-theme th, 
          .gslc-premium-theme td {
            padding: 10px 14px !important;
            text-align: start !important;
            vertical-align: middle !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }

          .gslc-premium-theme th {
            color: white !important;
            font-weight: 800 !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            border-bottom: 2px solid #a8842f !important;
            white-space: nowrap !important;
          }

          .gslc-premium-theme td {
            border-bottom: 1px solid rgba(201, 166, 70, 0.1) !important;
            color: #0D1F3C !important;
          }

          /* Content Normalization */
          .gslc-premium-theme .cell-content {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            max-width: 100% !important;
          }

          /* Column Alignment Utilities */
          .gslc-premium-theme .col-center { text-align: center !important; }
          .gslc-premium-theme .col-end { text-align: end !important; }
          
          /* Force specific widths for predictable layout */
          .gslc-premium-theme .col-actions { width: 220px !important; text-align: center !important; }
          .gslc-premium-theme .col-status { width: 100px !important; text-align: center !important; }
          .gslc-premium-theme .col-date { width: 110px !important; }

          /* ONLY highlight body rows to preserve header golden color */
          .gslc-premium-theme tbody tr {
            background-color: white !important;
            transition: background-color 0.2s ease !important;
          }
          
          .gslc-premium-theme tbody tr:hover {
            background-color: #fcf9ee !important;
          }

          /* Highlight text in blue on hover */
          .gslc-premium-theme tbody tr:hover td {
            color: #1E40AF !important; 
          }

          /* Global Page Text Colors */
          .gslc-premium-theme h1, 
          .gslc-premium-theme p, 
          .gslc-premium-theme label {
            color: #0D1F3C !important;
          }

          /* Premium Layout Dropdowns and Inputs */
          .gslc-premium-theme select, 
          .gslc-premium-theme input:not([type="checkbox"]) {
            background-color: white !important;
            color: #0D1F3C !important;
            border: 2px solid #C9A646 !important;
            padding: 6px 10px !important;
            border-radius: 8px !important;
            transition: all 0.2s ease !important;
            font-size: 13px !important;
          }

          /* Filter Bar Fluidity */
          .gslc-premium-theme .filter-bar {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
            align-items: center !important;
            overflow-x: visible !important;
          }
          
          .gslc-premium-theme .filter-bar > * {
            flex-shrink: 1 !important;
            white-space: nowrap !important;
          }
          
          .gslc-premium-theme .filter-bar input[type="text"] {
            flex: 2 !important;
            min-width: 150px !important;
          }

          /* Specific padding for search inputs and selects */
          .gslc-premium-theme input[placeholder*="Rechercher"],
          .gslc-premium-theme input[placeholder*="Search"] {
            padding-inline-start: 2.5rem !important; 
          }

          /* Selects need padding on BOTH sides */
          .gslc-premium-theme select {
            padding-inline-start: 2.5rem !important;
            padding-inline-end: 2.5rem !important;
          }

          .gslc-premium-theme select option {
            color: #0D1F3C !important;
          }

          .gslc-premium-theme input:focus, 
          .gslc-premium-theme select:focus {
            outline: none !important;
            border-color: #a8842f !important;
            box-shadow: 0 0 0 3px rgba(168, 132, 47, 0.1) !important;
          }
        `}</style>

      </aside>
    </>
  );
};
