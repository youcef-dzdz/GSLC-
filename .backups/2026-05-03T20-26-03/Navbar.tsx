import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { X, Bell, BellRing, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';

interface Notif {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  lien_action: string | null;
  date_creation: string;
  canal: string;
}

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

const ROUTE_LABELS: Record<string, { parent: string; pageKey: string }> = {
  '/admin/dashboard':      { parent: 'Admin',       pageKey: 'nav.dashboard' },
  '/admin/users':          { parent: 'Admin',       pageKey: 'nav.users' },
  '/admin/roles':          { parent: 'Admin',       pageKey: 'nav.roles' },
  '/admin/permissions':    { parent: 'Admin',       pageKey: 'nav.permissions' },
  '/admin/departments':    { parent: 'Admin',       pageKey: 'nav.departments' },
  '/admin/positions':      { parent: 'Admin',       pageKey: 'nav.positions' },
  '/admin/registrations':  { parent: 'Admin',       pageKey: 'nav.registrations' },
  '/admin/audit':          { parent: 'Admin',       pageKey: 'nav.audit' },
  '/admin/config':         { parent: 'Admin',       pageKey: 'nav.config' },
  '/admin/notifications':  { parent: 'Admin',       pageKey: 'nav.notifications.title' },
  '/admin/corbeille':      { parent: 'Admin',       pageKey: 'nav.corbeille' },
  '/commercial/dashboard': { parent: 'Commercial',  pageKey: 'nav.dashboard' },
  '/commercial/demands':   { parent: 'Commercial',  pageKey: 'nav.demands' },
  '/commercial/quotes':    { parent: 'Commercial',  pageKey: 'nav.quotes' },
  '/commercial/contracts': { parent: 'Commercial',  pageKey: 'nav.contracts' },
  '/commercial/clients':   { parent: 'Commercial',  pageKey: 'nav.clients' },
  '/commercial/vessels':   { parent: 'Commercial',  pageKey: 'nav.vessels' },
  '/client/dashboard':     { parent: 'Client',      pageKey: 'nav.dashboard' },
  '/client/demands':       { parent: 'Client',      pageKey: 'nav.demands' },
  '/client/quotes':        { parent: 'Client',      pageKey: 'nav.quotes' },
  '/client/contracts':     { parent: 'Client',      pageKey: 'nav.contracts' },
  '/client/invoices':      { parent: 'Client',      pageKey: 'nav.invoices' },
  '/client/containers':    { parent: 'Client',      pageKey: 'nav.containers' },
  '/logistics/dashboard':  { parent: 'Logistique',  pageKey: 'nav.dashboard' },
  '/logistics/containers': { parent: 'Logistique',  pageKey: 'nav.containers' },
  '/logistics/warehouse':  { parent: 'Logistique',  pageKey: 'nav.warehouse' },
  '/logistics/vessels':    { parent: 'Logistique',  pageKey: 'nav.vessels' },
  '/logistics/movements':  { parent: 'Logistique',  pageKey: 'nav.movements' },
  '/finance/dashboard':    { parent: 'Finance',     pageKey: 'nav.dashboard' },
  '/finance/invoices':     { parent: 'Finance',     pageKey: 'nav.invoices' },
  '/finance/payments':     { parent: 'Finance',     pageKey: 'nav.payments' },
  '/director/dashboard':   { parent: 'Directeur',   pageKey: 'nav.dashboard' },
  '/director/contracts':   { parent: 'Directeur',   pageKey: 'nav.contracts_pending' },
  '/director/reports':     { parent: 'Directeur',   pageKey: 'nav.reports' },
  '/director/risk-map':    { parent: 'Directeur',   pageKey: 'nav.risk_map' },
};

const getBreadcrumb = (pathname: string): { parent: string; pageKey: string } | null => {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const match = Object.keys(ROUTE_LABELS)
    .sort((a, b) => b.length - a.length)
    .find(r => pathname.startsWith(r + '/'));
  return match ? ROUTE_LABELS[match] : null;
};

export const Navbar = ({ onMenuClick, sidebarOpen }: { onMenuClick?: () => void; sidebarOpen?: boolean }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Notification state ──────────────────────────────────────────────────────
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifs,       setNotifs]       = useState<Notif[]>([]);
  const [unread,       setUnread]       = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [hoveredNotif, setHoveredNotif] = useState<number|null>(null);

  const fetchNotifs = async () => {
    setNotifLoading(true);
    try {
      const res = await apiClient.get('/api/admin/notifications');
      setNotifs(res.data.notifications ?? []);
      setUnread(res.data.unread_count ?? 0);
    } catch {
      // silencieux — ne pas bloquer la navbar
    } finally {
      setNotifLoading(false);
    }
  };

  const markRead = async (id: number) => {
    try {
      await apiClient.post(`/api/admin/notifications/${id}/read`);
      setNotifs(prev =>
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silencieux */ }
  };

  const markAllRead = async () => {
    try {
      await apiClient.post('/api/admin/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
      setUnread(0);
    } catch { /* silencieux */ }
  };

  const deleteNotif = async (id: number) => {
    try {
      const wasUnread = notifs.find(n => n.id === id)?.lu === false;
      await apiClient.delete(`/api/admin/notifications/${id}`);
      setNotifs(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silencieux */ }
  };

  useEffect(() => {
    if (user?.role?.label === 'admin') {
      fetchNotifs();
      const id = setInterval(fetchNotifs, 30_000);
      return () => clearInterval(id);
    }
  }, [user]);

  // ────────────────────────────────────────────────────────────────────────────

  const isHome     = location.pathname === '/';
  const isRTL      = i18n.language.startsWith('ar');
  const activeLang = i18n.language.substring(0, 2);
  const breadcrumb = (!isHome && user) ? getBreadcrumb(location.pathname) : null;

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
        background: '#FFFFFF',
        borderBottom: '1px solid #C5D8F5',
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 200, height: 52,
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
        maxWidth: 1400, margin: '0 auto', padding: '0 20px',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── LEFT: brand + breadcrumb + badges ─────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

          {/* Brand mark */}
          <button
            onClick={handleLogoClick}
            aria-label="NASHCO GSLC — Accueil"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <img
              src="/images/nashco_logo Company.jpg"
              alt="NASHCO Logo"
              style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain', flexShrink: 0 }}
            />
          </button>

          {/* Breadcrumb + badges (dashboard only) */}
          {user && !isHome && breadcrumb && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#88A8D0' }}>{breadcrumb.parent}</span>
                <span style={{ color: '#C5D8F5', fontSize: 14, margin: '0 6px', lineHeight: 1 }}>›</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0D2A5E' }}>{t(breadcrumb.pageKey)}</span>
              </div>
              {/* Role badge */}
              <span style={{
                fontSize: 10, fontWeight: 700,
                padding: '2px 9px', borderRadius: 9999,
                background: '#FFF3C0', color: '#7A5800',
              }}>
                {t(`roles.${user.role.label}`)}
              </span>
              {/* Système en ligne badge */}
              <span style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 10, fontWeight: 600, color: '#2A8A5A',
                padding: '2px 9px', borderRadius: 9999,
                background: '#E6F7F0', border: '1px solid #A8DFC4',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2A8A5A', display: 'block', flexShrink: 0 }} />
                {t('admin.dashboard.system_online')}
              </span>
            </div>
          )}
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
                  color: '#334155',
                  transition: 'color .18s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#CFA030'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#334155'; }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* ── RIGHT: date + notif + lang + avatar ─────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Date (dashboard only) */}
          {user && !isHome && (
            <span style={{ fontSize: 10, color: '#88A8D0', whiteSpace: 'nowrap' }}>
              {new Date().toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          )}

          {/* ── Notification bell (admin only) ─────────────────────────── */}
          {user?.role?.label === 'admin' && (
            <div className="relative">
              {/* Bouton cloche */}
              <button
                onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifs(); }}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                style={{ background: 'none', border: 'none' }}
                aria-label={t('nav.notifications.title')}
              >
                {unread > 0
                  ? <BellRing size={20} className="text-[#CFA030]" />
                  : <Bell size={20} style={{ color: '#4366BB' }} />
                }
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    minWidth: 18, height: 18,
                    background: '#EF4444', color: '#fff',
                    fontSize: 10, fontWeight: 900,
                    borderRadius: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px',
                  }}>
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {notifOpen && (
                <>
                  {/* Overlay transparent pour fermer */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setNotifOpen(false)}
                  />

                  {/* Panel */}
                  <div style={{
                    position: 'absolute', zIndex: 50, top: 48,
                    width: 320,
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    ...(isRTL ? { left: 0 } : { right: 0 }),
                  }}>

                    {/* Header panel */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: '1px solid #F1F5F9',
                      background: '#F8F9FB',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bell size={15} color="#0B1D3A" />
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#0B1D3A' }}>
                          {t('nav.notifications.title')}
                        </span>
                        {unread > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            padding: '1px 8px', borderRadius: 9999,
                            background: '#EF4444', color: '#fff',
                          }}>
                            {unread}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {unread > 0 && (
                          <button
                            onClick={markAllRead}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: 10, fontWeight: 700,
                              color: '#3B82F6', background: 'none', border: 'none',
                              cursor: 'pointer', padding: '2px 4px',
                            }}
                            title={t('nav.notifications.mark_all_read')}
                          >
                            <CheckCheck size={12} />
                            {t('nav.notifications.mark_all_read')}
                          </button>
                        )}
                        <button
                          onClick={() => setNotifOpen(false)}
                          style={{
                            padding: 4, borderRadius: 8,
                            background: 'none', border: 'none',
                            cursor: 'pointer', display: 'flex',
                          }}
                        >
                          <X size={14} color="#64748B" />
                        </button>
                      </div>
                    </div>

                    {/* Liste */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {notifLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                          <div style={{
                            width: 20, height: 20,
                            border: '2px solid #0B1D3A',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                          }} />
                        </div>
                      ) : notifs.length === 0 ? (
                        <div style={{
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', padding: '40px 0', gap: 8,
                          color: '#94A3B8',
                        }}>
                          <Bell size={28} />
                          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{t('nav.notifications.no_notifications')}</p>
                        </div>
                      ) : (
                        notifs.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.lu) markRead(n.id);
                              const dest = n.lien_action ?? '/admin/notifications';
                              navigate(dest);
                              setNotifOpen(false);
                            }}
                            style={{
                              display: 'flex', gap: 12,
                              padding: '12px 16px',
                              borderBottom: '1px solid #F1F5F9',
                              cursor: 'pointer',
                              background: n.lu ? '#fff' : '#FFFBEB',
                              transition: 'background .15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = n.lu ? '#F8F9FB' : '#FEF3C7'; setHoveredNotif(n.id); }}
                            onMouseLeave={e => { e.currentTarget.style.background = n.lu ? '#fff' : '#FFFBEB'; setHoveredNotif(null); }}
                          >
                            {/* Indicateur non lu */}
                            <div style={{ flexShrink: 0, marginTop: 6 }}>
                              <span style={{
                                display: 'block', width: 8, height: 8, borderRadius: '50%',
                                background: n.lu ? 'transparent' : '#CFA030',
                              }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: 12, margin: '0 0 2px',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                fontWeight: n.lu ? 500 : 700,
                                color: n.lu ? '#64748B' : '#0B1D3A',
                              }}>
                                {n.titre}
                              </p>
                              <p style={{
                                fontSize: 11, color: '#94A3B8', margin: '0 0 4px',
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>
                                {n.message}
                              </p>
                              <p style={{ fontSize: 10, color: '#CBD5E1', margin: 0 }}>
                                {new Date(n.date_creation).toLocaleDateString('fr-FR', {
                                  day: '2-digit', month: 'short',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                            {/* Bouton supprimer */}
                            <button
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              className="flex-shrink-0 p-1 rounded-lg transition-opacity hover:bg-red-50 cursor-pointer"
                              title={t('admin.notifications_page.delete')}
                              style={{ background: 'none', border: 'none', alignSelf: 'center', opacity: hoveredNotif === n.id ? 1 : 0 }}
                            >
                              <X size={12} className="text-[#94A3B8] hover:text-[#EF4444]" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifs.length > 0 && (
                      <div style={{
                        padding: '10px 16px', background: '#F8F9FB',
                        borderTop: '1px solid #F1F5F9', textAlign: 'center',
                      }}>
                        <button
                          onClick={() => { navigate('/admin/notifications'); setNotifOpen(false); }}
                          style={{
                            fontSize: 12, fontWeight: 700, color: '#3B82F6',
                            background: 'none', border: 'none', cursor: 'pointer',
                          }}
                        >
                          {t('nav.notifications.see_all')}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Language pill switcher */}
          <div style={{
            display: 'flex',
            border: '1.5px solid rgba(67,102,187,0.25)',
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
                  borderLeft: idx > 0 ? '1px solid rgba(67,102,187,0.2)' : 'none',
                  cursor: 'pointer',
                  background: activeLang === l.code ? '#4366BB' : 'transparent',
                  color:      activeLang === l.code ? '#fff' : '#334155',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  transition: 'all .18s',
                }}
                onMouseEnter={e => {
                  if (activeLang !== l.code) e.currentTarget.style.color = '#4366BB';
                }}
                onMouseLeave={e => {
                  if (activeLang !== l.code) e.currentTarget.style.color = '#334155';
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Avatar pill */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              border: '1px solid #C5D8F5', borderRadius: 8,
              padding: '4px 10px 4px 4px',
              background: 'white',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#C8960A', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {(user.prenom?.[0] ?? '').toUpperCase()}{(user.nom?.[0] ?? '').toUpperCase()}
              </span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#0D2A5E', margin: 0, whiteSpace: 'nowrap' }}>
                  {user.prenom} {user.nom}
                </p>
                <p style={{ fontSize: 9, color: '#5A80BB', margin: 0 }}>
                  {t(`roles.${user.role.label}`)}
                </p>
              </div>
              {/* Logout arrow — only this triggers logout */}
              <button
                onClick={logout}
                title={t('auth.logout')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#88A8D0', fontSize: 14, padding: '0 0 0 4px',
                  display: 'flex', alignItems: 'center', lineHeight: 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#0D2A5E'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#88A8D0'; }}
              >
                →
              </button>
            </div>
          )}

          {/* Guest buttons (not logged in) */}
          {!user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              borderLeft: '1px solid #E2E8F0',
              paddingLeft: 10,
            }}>
              <Link
                to="/login"
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 700,
                  color: '#334155',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 7, background: 'transparent',
                  textDecoration: 'none', transition: 'all .18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(67,102,187,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/register"
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 800,
                  color: '#3A5BAD', background: '#CFA030',
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
