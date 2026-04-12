import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function StaffLogin() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL        = i18n.language.startsWith('ar');

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
      navigate(redirectTo || '/admin/dashboard');
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError(t('staff.error_forbidden'));
      } else {
        setError(err?.response?.data?.message ?? t('staff.error_invalid'));
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    t('staff.hero_f1'),
    t('staff.hero_f2'),
    t('staff.hero_f3'),
  ];

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

          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-2xl font-black text-[#1E40AF] mb-1">{t('staff.title')}</h1>
            <p className="text-[#64748B] text-xs font-medium">
              {t('staff.subtitle')}
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
                {t('staff.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                dir="ltr"
                placeholder="prenom.nom@nashco.dz"
                className={`w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${isRTL ? 'text-right' : ''}`}
              />
            </div>

            <div>
              <div className={`flex items-center justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <label className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider">
                  {t('staff.password')}
                </label>
                <Link to="/staff/forgot-password" className="text-[10px] text-[#2563EB] font-bold hover:underline">
                  {t('staff.forgot')}
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

            {/* Submit — gold accent for staff portal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-3 py-4 rounded-lg text-[#0D1F3C] text-sm font-bold shadow-md shadow-[#CFA030]/25 hover:shadow-lg hover:shadow-[#CFA030]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 cursor-pointer"
              style={{ background: '#CFA030' }}
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              {loading ? t('staff.submitting') : t('staff.submit')}
            </button>
          </form>

          {/* Staff features + footer */}
          <div className="mt-8 pt-8 border-t border-[#f1f5f9]">
            <div className="space-y-2 mb-4">
              {features.map((f) => (
                <div key={f} className={`flex items-center gap-2 text-xs text-[#64748B] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#CFA030]" />
                  {f}
                </div>
              ))}
            </div>
            <p className={`text-xs text-[#CBD5E1] ${isRTL ? 'text-right' : 'text-center'}`}>
              {t('staff.footer')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
