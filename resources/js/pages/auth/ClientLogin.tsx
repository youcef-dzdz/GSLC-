import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { Eye, EyeOff, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

export default function ClientLogin() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const redirectTo = await login({ email, password });
      navigate(redirectTo || '/client/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? t('client_login.error_invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Absolute background with image and overlay */}
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

          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-black text-[#1E40AF] mb-1">{t('client_login.title')}</h1>
            <p className="text-[#64748B] text-xs font-medium">
              {t('client_login.subtitle')}
            </p>
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
                {t('client_login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                dir="ltr"
                placeholder="votre@email.com"
                className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div>
              <div className={`flex items-center justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <label className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider">
                  {t('client_login.password')}
                </label>
                <Link to="/forgot-password" virtual-link="true" className="text-[10px] text-[#2563EB] font-bold hover:underline">
                  {t('client_login.forgot')}
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all hover:border-[#93C5FD] ${isRTL ? 'pl-14 pr-5' : 'pr-14'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB] p-2 transition-colors cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-3 py-4 rounded-lg bg-[#F97316] text-white text-sm font-bold shadow-md shadow-[#F97316]/25 hover:shadow-lg hover:shadow-[#F97316]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 cursor-pointer"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? t('client_login.submitting') : t('client_login.submit')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[#f1f5f9]">
            <p className={`text-sm text-[#64748B] text-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {t('client_login.no_account')}
            </p>
            <Link 
              to="/register" 
              className="w-full flex items-center justify-center py-4 rounded-lg border-2 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] text-sm font-bold hover:bg-[#2563EB] hover:text-white transition-all duration-200 cursor-pointer"
            >
              {t('client_login.register_link')}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <a
              href="http://127.0.0.1:8000/"
              className={`inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#2563EB] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <ChevronLeft size={16} />
              {t('nav_home', isRTL ? 'العودة إلى الرئيسية' : i18n.language.startsWith('en') ? 'Back to Home' : 'Retour à l\'accueil')}
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
