import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, X, Bell, BellRing, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
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
                  : <Bell size={20} style={{ color: 'rgba(255,255,255,0.70)' }} />
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
