import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/services/api';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const location = useLocation();
  const isStaff = location.pathname.startsWith('/staff');

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('http://127.0.0.1:8000/api/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('forgot.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const backTo = isStaff ? '/staff/login' : '/login';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{ backgroundImage: 'url("/images/hero4.jpg")' }}
      >
        <div className="absolute inset-0 bg-[#0F2556]/55 backdrop-blur-[2px]" />
      </div>

      {/* Top right language switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LangSwitcher dark={true} />
      </div>

      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-8 overflow-hidden">

          {/* Logo & Branding */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/images/nashco_logo.jpg"
              alt="NASHCO"
              className="h-14 w-auto object-contain mb-3"
            />
            <h2 className="text-xl font-black text-[#0D1F3C] tracking-tight">GSLC</h2>
            <div className="w-8 h-1 bg-[#CFA030] mt-1.5 rounded-full" />
          </div>

          {sent ? (
            /* Success state */
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-xl font-black text-[#1E40AF] mb-2">{t('forgot.sent_title')}</h1>
              <p className="text-sm text-[#64748B] mb-2">{t('forgot.sent_desc')}</p>
              <p className="text-sm font-semibold text-[#0D1F3C] mb-6" dir="ltr">{email}</p>
              <p className="text-xs text-[#94A3B8] mb-6">{t('forgot.sent_hint')}</p>
              <Link
                to={backTo}
                className={`inline-flex items-center gap-2 text-xs text-[#2563EB] font-bold hover:underline ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <ChevronLeft size={16} />
                {t('forgot.back_to_login')}
              </Link>
            </div>
          ) : (
            <>
              <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                <h1 className="text-2xl font-black text-[#1E40AF] mb-1">{t('forgot.title')}</h1>
                <p className="text-[#64748B] text-xs font-medium">{t('forgot.subtitle')}</p>
              </div>

              {error && (
                <div className={`mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs animate-in slide-in-from-top-2 duration-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                    {t('forgot.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    dir="ltr"
                    placeholder={isStaff ? 'prenom.nom@nashco.dz' : 'votre@email.com'}
                    className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${isRTL ? 'text-right' : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full relative flex items-center justify-center gap-3 py-4 rounded-lg text-sm font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 cursor-pointer ${
                    isStaff
                      ? 'text-[#0D1F3C] shadow-[#CFA030]/25 hover:shadow-lg hover:shadow-[#CFA030]/40'
                      : 'bg-[#F97316] text-white shadow-[#F97316]/25 hover:shadow-lg hover:shadow-[#F97316]/40'
                  }`}
                  style={isStaff ? { background: '#CFA030' } : undefined}
                >
                  {loading && <Loader2 size={20} className="animate-spin" />}
                  {loading ? t('forgot.submitting') : t('forgot.submit')}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-[#f1f5f9] text-center">
                <Link
                  to={backTo}
                  className={`inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#2563EB] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <ChevronLeft size={16} />
                  {t('forgot.back_to_login')}
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
