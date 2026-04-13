import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, CheckCheck, Trash2, X } from 'lucide-react';
import { apiClient } from '../../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Notif {
  id: number;
  titre: string;
  message: string;
  lu: boolean;
  lien_action: string | null;
  date_creation: string;
  canal: string;
}

type Filter = 'all' | 'unread' | 'read';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date} à ${time}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [notifs,     setNotifs]     = useState<Notif[]>([]);
  const [unread,     setUnread]     = useState(0);
  const [filter,     setFilter]     = useState<Filter>('all');
  const [loading,    setLoading]    = useState(true);
  const [marking,    setMarking]    = useState(false);
  const [hoveredId,  setHoveredId]  = useState<number|null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/admin/notifications/all');
      setNotifs(res.data.notifications ?? []);
      setUnread(res.data.unread_count ?? 0);
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const markRead = async (id: number) => {
    try {
      await apiClient.post(`/api/admin/notifications/${id}/read`);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silencieux */ }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await apiClient.post('/api/admin/notifications/read-all');
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
      setUnread(0);
    } catch { /* silencieux */ }
    finally { setMarking(false); }
  };

  const deleteNotif = async (id: number) => {
    try {
      await apiClient.delete(`/api/admin/notifications/${id}`);
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch { /* silencieux */ }
  };

  const deleteAllRead = async () => {
    try {
      await apiClient.delete('/api/admin/notifications/read');
      setNotifs(prev => prev.filter(n => !n.lu));
    } catch { /* silencieux */ }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.lu;
    if (filter === 'read')   return n.lu;
    return true;
  });

  // ── Canal badge ───────────────────────────────────────────────────────────

  const canalBadge = (canal: string) => {
    const isEmail  = canal === 'EMAIL';
    return (
      <span style={{
        display: 'inline-block',
        padding: '1px 8px',
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        background: isEmail ? '#DBEAFE' : '#F1F5F9',
        color:      isEmail ? '#1D4ED8' : '#475569',
      }}>
        {isEmail
          ? t('admin.notifications_page.canal_email')
          : t('admin.notifications_page.canal_system')}
      </span>
    );
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────

  const Skeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          height: 88,
          borderRadius: 16,
          background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px 28px', maxWidth: 860, margin: '0 auto' }}>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF, #FFFBEB)',
        borderLeft: '4px solid #CFA030',
        borderRadius: '0 16px 16px 0',
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={22} color="#CFA030" />
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0B1D3A', margin: 0 }}>
            {t('admin.notifications_page.title')}
          </h1>
          {unread > 0 && (
            <span style={{
              padding: '2px 10px',
              borderRadius: 9999,
              background: '#EF4444',
              color: '#fff',
              fontSize: 12,
              fontWeight: 800,
            }}>
              {unread}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {notifs.some(n => n.lu) && (
            <button
              onClick={deleteAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#EF4444] border border-[#EF4444]/30 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              style={{ background: 'transparent' }}
            >
              <Trash2 size={13} />
              {t('admin.notifications_page.delete_read')}
            </button>
          )}
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                background: '#0B1D3A',
                color: '#fff',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: marking ? 'not-allowed' : 'pointer',
                opacity: marking ? 0.6 : 1,
                transition: 'opacity .15s',
              }}
            >
              <CheckCheck size={15} />
              {t('admin.notifications_page.mark_all_read')}
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
      }}>
        {(['all', 'unread', 'read'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 9999,
              border: '1.5px solid',
              borderColor: filter === f ? '#CFA030' : '#E2E8F0',
              background:  filter === f ? '#CFA030' : '#fff',
              color:        filter === f ? '#0B1D3A' : '#64748B',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all .15s',
            }}
          >
            {t(`admin.notifications_page.filter_${f}`)}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '64px 0', gap: 14, color: '#94A3B8',
        }}>
          <BellOff size={40} strokeWidth={1.5} />
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            {t('admin.notifications_page.empty')}
          </p>
        </div>
      ) : (
        /* Notification list */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.lu) markRead(n.id);
                if (n.lien_action) { navigate(n.lien_action); }
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 20px',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                borderLeft: n.lu ? '1px solid #E2E8F0' : '3px solid #CFA030',
                background: n.lu ? '#fff' : '#FFFBEB',
                cursor: 'pointer',
                transition: 'box-shadow .15s, background .15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'; setHoveredId(n.id); }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; setHoveredId(null); }}
            >
              {/* Unread dot */}
              <div style={{ flexShrink: 0, paddingTop: 5 }}>
                <span style={{
                  display: 'block',
                  width: 9, height: 9,
                  borderRadius: '50%',
                  background: n.lu ? 'transparent' : '#CFA030',
                  border: n.lu ? '1.5px solid #CBD5E1' : 'none',
                }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{
                    fontSize: 13,
                    fontWeight: n.lu ? 500 : 700,
                    color: n.lu ? '#475569' : '#0B1D3A',
                    margin: 0,
                  }}>
                    {n.titre}
                  </p>
                  {canalBadge(n.canal)}
                </div>
                <p style={{
                  fontSize: 12,
                  color: '#64748B',
                  margin: '0 0 6px',
                  lineHeight: 1.55,
                }}>
                  {n.message}
                </p>
                <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>
                  {formatDate(n.date_creation)}
                </p>
              </div>

              {/* Action button */}
              {n.lien_action && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (!n.lu) markRead(n.id);
                    navigate(n.lien_action!);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CFA030',
                    background: 'transparent',
                    color: '#CFA030',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#CFA030';
                    e.currentTarget.style.color = '#0B1D3A';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#CFA030';
                  }}
                >
                  {t('admin.notifications_page.see')}
                </button>
              )}
              {/* Bouton supprimer */}
              <button
                onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                className="flex-shrink-0 p-1.5 rounded-lg transition-opacity hover:bg-red-50 cursor-pointer"
                title={t('admin.notifications_page.delete')}
                style={{ background: 'none', border: 'none', alignSelf: 'center', opacity: hoveredId === n.id ? 1 : 0 }}
              >
                <X size={14} className="text-[#94A3B8] hover:text-[#EF4444]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
