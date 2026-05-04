import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/api';
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const DASHBOARD_ROUTE: Record<string, string> = {
  admin:      '/admin/dashboard',
  directeur:  '/director/dashboard',
  commercial: '/commercial/dashboard',
  logistique: '/logistics/dashboard',
  financier:  '/finance/dashboard',
  client:     '/client/dashboard',
};

export default function ForcePasswordChange() {
  const { t, i18n } = useTranslation();
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [password,     setPassword]     = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('staff.force_password.error_short'));
      return;
    }
    if (password !== confirmation) {
      setError(t('staff.force_password.error_mismatch'));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/staff/change-password', {
        password,
        password_confirmation: confirmation,
      });
      // Capture role BEFORE checkAuth resets state (React state update is async)
      const role = user?.role?.label ?? '';
      await checkAuth();
      navigate(DASHBOARD_ROUTE[role] ?? '/admin/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.errors?.password?.[0] ??
        t('common.error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D1F3C 0%, #1a3360 60%, #0D1F3C 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
      }}>

        {/* Icon + Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #CFA030, #e6b832)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(207,160,48,0.35)',
          }}>
            <ShieldCheck size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0D1F3C', margin: '0 0 8px' }}>
            {t('staff.force_password.title')}
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            {t('staff.force_password.subtitle')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '10px 14px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: '#DC2626' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* New password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {t('staff.force_password.new_password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder={t('staff.force_password.placeholder_new')}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #D1D5DB',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#CFA030'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = '#D1D5DB'; }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, color: '#9CA3AF',
                  display: 'flex',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              {t('staff.force_password.confirm_password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
                required
                placeholder={t('staff.force_password.placeholder_confirm')}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #D1D5DB',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#CFA030'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = '#D1D5DB'; }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: 0, color: '#9CA3AF',
                  display: 'flex',
                }}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: loading ? '#9CA3AF' : '#0D1F3C',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background .15s',
              fontFamily: 'inherit',
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {loading ? t('staff.force_password.submitting') : t('staff.force_password.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
