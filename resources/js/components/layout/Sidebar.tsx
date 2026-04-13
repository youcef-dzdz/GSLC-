import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Anchor, Truck,
  CreditCard, Box, Settings, ClipboardList, Briefcase,
  BarChart2, MapPin, Receipt, Package, Ship, Bell,
} from 'lucide-react';

interface NavLinkDef {
  to: string;
  icon: React.ElementType;
  labelKey: string;
}

const getNavLinks = (role: string): NavLinkDef[] => {
  const dashboard: NavLinkDef = { to: `/${rolePrefix(role)}/dashboard`, icon: LayoutDashboard, labelKey: 'nav.dashboard' };

  switch (role) {
    case 'admin':
      return [
        dashboard,
        { to: '/admin/users',         icon: Users,         labelKey: 'nav.users' },
        { to: '/admin/departments',   icon: Briefcase,     labelKey: 'nav.departments' },
        { to: '/admin/positions',     icon: Briefcase,     labelKey: 'nav.positions' },
        { to: '/admin/registrations', icon: ClipboardList, labelKey: 'nav.registrations' },
        { to: '/admin/audit',         icon: FileText,      labelKey: 'nav.audit' },
        { to: '/admin/config',        icon: Settings,      labelKey: 'nav.config' },
        { to: '/admin/notifications', icon: Bell,          labelKey: 'nav.notifications.title' },
      ];
    case 'client':
      return [
        dashboard,
        { to: '/client/demands',    icon: ClipboardList, labelKey: 'nav.demands' },
        { to: '/client/quotes',     icon: Receipt,       labelKey: 'nav.quotes' },
        { to: '/client/contracts',  icon: FileText,      labelKey: 'nav.contracts' },
        { to: '/client/invoices',   icon: CreditCard,    labelKey: 'nav.invoices' },
        { to: '/client/containers', icon: Box,           labelKey: 'nav.containers' },
      ];
    case 'commercial':
      return [
        dashboard,
        { to: '/commercial/demands',   icon: ClipboardList, labelKey: 'nav.demands' },
        { to: '/commercial/quotes',    icon: Receipt,       labelKey: 'nav.quotes' },
        { to: '/commercial/contracts', icon: FileText,      labelKey: 'nav.contracts' },
        { to: '/commercial/clients',   icon: Users,         labelKey: 'nav.clients' },
        { to: '/commercial/vessels',   icon: Ship,          labelKey: 'nav.vessels' },
        { to: '/commercial/archive',   icon: Package,       labelKey: 'nav.archive' },
      ];
    case 'logistique':
      return [
        dashboard,
        { to: '/logistics/containers', icon: Box,           labelKey: 'nav.containers' },
        { to: '/logistics/warehouse',  icon: MapPin,        labelKey: 'nav.warehouse' },
        { to: '/logistics/vessels',    icon: Ship,          labelKey: 'nav.vessels' },
        { to: '/logistics/customs',    icon: Briefcase,     labelKey: 'nav.customs' },
        { to: '/logistics/movements',  icon: Truck,         labelKey: 'nav.movements' },
      ];
    case 'financier':
      return [
        dashboard,
        { to: '/finance/invoices',  icon: Receipt,   labelKey: 'nav.invoices' },
        { to: '/finance/payments',  icon: CreditCard, labelKey: 'nav.payments' },
      ];
    case 'directeur':
      return [
        dashboard,
        { to: '/director/contracts',  icon: FileText,   labelKey: 'nav.contracts_pending' },
        { to: '/director/reports',    icon: BarChart2,  labelKey: 'nav.reports' },
        { to: '/director/risk-map',   icon: Anchor,     labelKey: 'nav.risk_map' },
      ];
    default:
      return [dashboard];
  }
};

function rolePrefix(role: string): string {
  switch (role) {
    case 'logistique': return 'logistics';
    case 'directeur':  return 'director';
    case 'financier':  return 'finance';
    default:           return role;
  }
}

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language.startsWith('ar');

  if (!user) return null;

  const links = getNavLinks(user.role.label);

  // Physical positioning — flips based on language direction
  const sideStyle: React.CSSProperties = {
    position: 'fixed',
    top: 64,
    bottom: 0,
    ...(isRTL
      ? { right: 0, left: 'auto', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: 'none' }
      : { left: 0, right: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)', borderLeft: 'none' }),
    width: 240,
    background: 'linear-gradient(180deg, #0D1F3C 0%, #081828 100%)',
    zIndex: 40,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'translateX(0)' : isRTL ? 'translateX(100%)' : 'translateX(-100%)',
    transition: 'transform 0.28s ease',
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.55)' }}
        />
      )}

      <aside style={sideStyle} className="lg:!translate-x-0">

        {/* Role + user identity */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          textAlign: isRTL ? 'right' : 'left',
          background: 'rgba(207,160,48,0.05)',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: '#CFA030',
            textTransform: 'uppercase', letterSpacing: '0.15em',
            display: 'block',
          }}>
            {t(`roles.${user.role.label}`)}
          </span>
          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.5)',
            margin: '3px 0 0', fontWeight: 400,
          }}>
            {user.prenom} {user.nom}
          </p>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#CBD5E1',
                  background: isActive ? 'rgba(207,160,48,0.18)' : 'transparent',
                  boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
                  ...(isRTL
                    ? { borderRight: isActive ? '3px solid #CFA030' : '3px solid transparent', borderLeft: 'none' }
                    : { borderLeft: isActive ? '3px solid #CFA030' : '3px solid transparent', borderRight: 'none' }),
                  transition: 'all 0.15s',
                })}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  if (!el.style.background.includes('207,160,48')) {
                    el.style.background = 'rgba(255,255,255,0.09)';
                    el.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  if (!el.style.background.includes('207,160,48')) {
                    el.style.background = 'transparent';
                    el.style.color = '#CBD5E1';
                  }
                }}
              >
                <Icon size={16} style={{ flexShrink: 0, color: '#94A3B8' }} />
                <span>{t(link.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </>
  );
};
