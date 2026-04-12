import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/services/api';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { Loader2, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token || !email) {
      setError(t('reset.invalid_token'));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('http://127.0.0.1:8000/api/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('reset.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'} style={{ background: '#F0F4F8' }}>
      
      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <img
            src="/images/nashco_logo.jpg"
            alt="NASHCO"
            className="h-8 w-auto object-contain rounded-md"
            style={{ background: '#0D1F3C', padding: '2px' }}
          />
          <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
            <span className="font-black text-sm text-[#0D1F3C] leading-tight">NASHCO</span>
            <span className="font-bold text-xs text-[#CFA030] tracking-widest uppercase leading-tight">GSLC</span>
          </div>
        </div>
        <LangSwitcher dark={false} />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-xl font-black text-[#0D1F3C] mb-2">{t('reset.success')}</h1>
              <p className="text-sm text-[#64748B]">{t('auth.redirecting') || 'Redirection vers la connexion...'}</p>
            </div>
          ) : (
            <>
              <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(13,31,60,0.08)' }}>
                  <Lock size={22} style={{ color: '#0D1F3C' }} />
                </div>
                <h1 className="text-2xl font-black text-[#0D1F3C]">{t('reset.title')}</h1>
                <p className="text-sm text-[#94A3B8] mt-1">{t('reset.subtitle')}</p>
              </div>

              {error && (
                <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold text-[#374151] mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                    {t('reset.password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className={`w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] transition ${isRTL ? 'text-right' : ''}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-[#374151] mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                    {t('reset.confirm_password')}
                  </label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className={`w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C] transition ${isRTL ? 'text-right' : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-60 transition"
                  style={{ background: '#0D1F3C', color: '#ffffff' }}
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? t('reset.submitting') : t('reset.submit')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
