import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

type ClientType = 'ENTREPRISE' | 'PARTICULIER' | 'ADMINISTRATION';

interface FormState {
  raison_sociale: string;
  type_client: ClientType;
  nif: string;
  nis: string;
  rc: string;
  adresse_siege: string;
  ville: string;
  rep_nom: string;
  rep_prenom: string;
  rep_role: string;
  rep_tel: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const INITIAL: FormState = {
  raison_sociale: '',
  type_client: 'ENTREPRISE',
  nif: '',
  nis: '',
  rc: '',
  adresse_siege: '',
  ville: '',
  rep_nom: '',
  rep_prenom: '',
  rep_role: '',
  rep_tel: '',
  email: '',
  password: '',
  password_confirmation: '',
};

export default function Register() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const [form, setForm]       = useState<FormState>(INITIAL);
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirmation) {
      setError(t('register.error_password_mismatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('register.error_password_short'));
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        nom: form.rep_nom,
        prenom: form.rep_prenom,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        raison_sociale: form.raison_sociale,
        nif: form.nif,
        nis: form.nis,
        rc: form.rc,
        adresse_siege: form.adresse_siege,
        ville: form.ville,
        pays_id: 1,
        type_client: form.type_client,
        rep_nom: form.rep_nom,
        rep_prenom: form.rep_prenom,
        rep_role: form.rep_role,
        rep_tel: form.rep_tel,
        rep_email: form.email,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
        ?? t('register.error_generic');
      setError(msg as string);
    } finally {
      setLoading(false);
    }
  };

  // ── Input & label shared classes ──────────────────────────────────────────
  const inputCls = (extra = '') =>
    `w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${extra}`;
  const labelCls = (extra = '') =>
    `block text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-1.5 ${extra}`;

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/hero4.jpg")' }}
        >
          <div className="absolute inset-0 bg-[#0F2556]/55 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-10 max-w-md w-full text-center overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center mb-6">
            <img src="/images/nashco_logo.jpg" alt="NASHCO" className="h-14 w-auto object-contain mb-3" />
            <h2 className="text-xl font-black text-[#0D1F3C] tracking-tight">GSLC</h2>
            <div className="w-8 h-1 bg-[#CFA030] mt-1.5 rounded-full" />
          </div>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-[#1E40AF] mb-2">{t('register.success_title')}</h2>
          <p className="text-sm text-[#64748B] mb-6">{t('register.success_desc')}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-bold bg-[#F97316] shadow-md shadow-[#F97316]/25 hover:shadow-lg hover:shadow-[#F97316]/40 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            {t('register.connect')}
          </Link>
        </div>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/images/hero4.jpg")' }}
      >
        <div className="absolute inset-0 bg-[#0F2556]/55 backdrop-blur-[2px]" />
      </div>

      {/* Top right language switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LangSwitcher dark={true} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-500">

          {/* Back link */}
          <Link
            to="/login"
            className={`inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4 transition ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ChevronLeft size={16} />
            {t('forgot.back_to_login', isRTL ? 'العودة لتسجيل الدخول' : i18n.language.startsWith('en') ? 'Go back to login' : 'Retour à la connexion')}
          </Link>

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

            {/* Heading */}
            <div className={`mb-6 ${isRTL ? 'text-right' : ''}`}>
              <h1 className="text-2xl font-black text-[#1E40AF] mb-1">{t('register.title')}</h1>
              <p className="text-[#64748B] text-xs font-medium">{t('register.subtitle')}</p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-5 flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs animate-in slide-in-from-top-2 duration-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ── Section 1: Company ── */}
              <div>
                <h2 className={`text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-3 pb-1 border-b border-[#F1F5F9] ${isRTL ? 'text-right' : ''}`}>
                  {t('register.section1')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.raison_sociale')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.raison_sociale}
                      onChange={set('raison_sociale')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.type_client')} <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.type_client}
                      onChange={set('type_client')}
                      className={inputCls(`bg-white ${isRTL ? 'text-right' : ''}`)}
                    >
                      <option value="ENTREPRISE">{t('register.type_entreprise')}</option>
                      <option value="PARTICULIER">{t('register.type_particulier')}</option>
                      <option value="ADMINISTRATION">{t('register.type_administration')}</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.nif')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nif}
                      onChange={set('nif')}
                      required
                      dir="ltr"
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.nis')}
                    </label>
                    <input
                      type="text"
                      value={form.nis}
                      onChange={set('nis')}
                      dir="ltr"
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.rc')}
                    </label>
                    <input
                      type="text"
                      value={form.rc}
                      onChange={set('rc')}
                      dir="ltr"
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.adresse')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.adresse_siege}
                      onChange={set('adresse_siege')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.ville')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.ville}
                      onChange={set('ville')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                </div>
              </div>

              {/* ── Section 2: Representative & Credentials ── */}
              <div>
                <h2 className={`text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-3 pb-1 border-b border-[#F1F5F9] ${isRTL ? 'text-right' : ''}`}>
                  {t('register.section2')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.rep_nom')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.rep_nom}
                      onChange={set('rep_nom')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.rep_prenom')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.rep_prenom}
                      onChange={set('rep_prenom')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.rep_role')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.rep_role}
                      onChange={set('rep_role')}
                      required
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.rep_tel')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.rep_tel}
                      onChange={set('rep_tel')}
                      required
                      dir="ltr"
                      placeholder="+213 5XX XX XX XX"
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className={`p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] mb-3 ${isRTL ? 'text-right' : ''}`}>
                      {t('register.credentials_note')}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.email')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      required
                      dir="ltr"
                      placeholder="email@exemple.com"
                      className={inputCls(isRTL ? 'text-right' : '')}
                    />
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.password')} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={set('password')}
                        required
                        placeholder="••••••••"
                        className={inputCls(isRTL ? 'pl-12 pr-4' : 'pr-12')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB] p-1 transition-colors cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls(isRTL ? 'text-right' : '')}>
                      {t('register.confirm_password')} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCfm ? 'text' : 'password'}
                        value={form.password_confirmation}
                        onChange={set('password_confirmation')}
                        required
                        placeholder="••••••••"
                        className={inputCls(isRTL ? 'pl-12 pr-4' : 'pr-12')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCfm((v) => !v)}
                        className={`absolute top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#2563EB] p-1 transition-colors cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
                      >
                        {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative flex items-center justify-center gap-3 py-4 rounded-lg bg-[#F97316] text-white text-sm font-bold shadow-md shadow-[#F97316]/25 hover:shadow-lg hover:shadow-[#F97316]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 cursor-pointer"
              >
                {loading && <Loader2 size={20} className="animate-spin" />}
                {loading ? t('register.submitting') : t('register.submit')}
              </button>

              {/* Footer */}
              <p className={`text-center text-sm text-[#64748B] ${isRTL ? 'text-right' : ''}`}>
                {t('register.already_account')}{' '}
                <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
                  {t('register.connect')}
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
