import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

const DASHBOARD_ROUTE: Record<string, string> = {
  admin:      '/admin/dashboard',
  directeur:  '/director/dashboard',
  commercial: '/commercial/dashboard',
  logistique: '/logistics/dashboard',
  financier:  '/finance/dashboard',
  client:     '/client/dashboard',
};

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
  { code: 'en', label: 'EN' },
];

export const Navbar = ({ onMenuClick, sidebarOpen }: { onMenuClick?: () => void; sidebarOpen?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome   = location.pathname === '/';
  const isRTL    = i18n.language.startsWith('ar');
  const activeLang = i18n.language.substring(0, 2);

  const handleLogoClick = () => {
    if (user) {
      navigate(DASHBOARD_ROUTE[user.role.label] ?? '/');
    } else if (!isHome) {
      navigate('/');
    } else {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollTo = (id: string) => {
    if (!isHome) {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLangChange = (code: string) => {
    i18n.changeLanguage(code);
    // i18n/index.ts handles document.dir + document.lang + localStorage
  };

  return (
    <nav
      dir="ltr"
      style={{
        background: '#0D1F3C',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 200, height: 64,
      }}
    >
      {/* Force tel/email/number inputs to stay LTR in RTL pages */}
      <style>{`
        [dir="rtl"] input[type="tel"],
        [dir="rtl"] input[type="email"],
        [dir="rtl"] input[type="number"],
        [dir="rtl"] input[dir="ltr"] { direction: ltr; text-align: left; }
        .num-ltr { direction: ltr; unicode-bidi: embed; display: inline-block; }
      `}</style>

      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── LEFT: hamburger + logo ─────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              aria-label={t('common.menu')}
              className="lg:hidden"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 7, padding: 7,
                cursor: 'pointer', color: '#fff', display: 'flex',
              }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <button
            onClick={handleLogoClick}
            aria-label="NASHCO GSLC — Accueil"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Logo size="md" textClassName="text-[#CFA030]" />
          </button>
        </div>

        {/* ── CENTER: landing nav links (home page only) ─────────── */}
        {isHome && (
          <div className="hidden lg:flex" style={{ gap: '2rem', alignItems: 'center' }}>
            {(t('landing.nav', { returnObjects: true }) as string[]).map((label, i) => (
              <button
                key={i}
                onClick={() => scrollTo(['home', 'about', 'services', 'catalogue', 'contact'][i])}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  color: 'rgba(255,255,255,0.75)',
                  transition: 'color .18s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#CFA030'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── RIGHT: language switcher + user ────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Language pill switcher */}
          <div style={{
            display: 'flex',
            border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 24, overflow: 'hidden',
            fontSize: 11, fontWeight: 700,
          }}>
            {LANGS.map((l, idx) => (
              <button
                key={l.code}
                onClick={() => handleLangChange(l.code)}
                aria-label={`Switch to ${l.label}`}
                style={{
                  padding: '5px 13px',
                  border: 'none',
                  borderLeft: idx > 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  cursor: 'pointer',
                  background: activeLang === l.code ? '#CFA030' : 'transparent',
                  color:      activeLang === l.code ? '#0D1F3C' : 'rgba(255,255,255,0.75)',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  if (activeLang !== l.code) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  if (activeLang !== l.code) e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Logged-in user info + logout */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderLeft: '1px solid rgba(255,255,255,0.12)',
              paddingLeft: 10,
            }}>
              <div className="hidden sm:block" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>
                  {user.prenom} {user.nom}
                </p>
                <p style={{ fontSize: 11, color: '#CFA030', margin: 0 }}>
                  {t(`roles.${user.role.label}`)}
                </p>
              </div>
              <button
                onClick={logout}
                title={t('auth.logout')}
                aria-label={t('auth.logout')}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.28)',
                  borderRadius: 7, padding: 7,
                  cursor: 'pointer', color: '#fca5a5',
                  display: 'flex', transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Guest buttons (not logged in) */}
          {!user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              borderLeft: '1px solid rgba(255,255,255,0.12)',
              paddingLeft: 10,
            }}>
              <Link
                to="/login"
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 700,
                  color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  borderRadius: 7, background: 'transparent',
                  textDecoration: 'none', transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 800,
                  color: '#0D1F3C', background: '#CFA030',
                  borderRadius: 7, textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(207,160,48,.35)',
                  transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e6b832'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#CFA030'; }}
              >
                {t('auth.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
