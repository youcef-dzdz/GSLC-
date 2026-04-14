import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Mail, Bell, AlertTriangle, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { usePermission } from '../../hooks/usePermission';

// ─── Types ────────────────────────────────────────────────────────────────────

type Config = Record<string, string>;

// ─── Section keys ─────────────────────────────────────────────────────────────

const SECTION_KEYS = {
  general:       ['app_name', 'app_url', 'timezone', 'default_lang'],
  email:         ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from'],
  notifications: ['notif_new_registration', 'notif_new_contract', 'notif_surestarie'],
  maintenance:   ['maintenance_mode'],
};

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <h3 className="text-base font-black text-[#0D1F3C]">{title}</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-[#64748B]">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-[#374151] bg-white border border-[#E2E8F0] rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors cursor-pointer shadow-md"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  onSave,
  saving,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#E2E8F0] overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#F1F5F9]">
        {icon}
        <h2 className="text-base font-black text-[#0D1F3C]">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
      <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-gold disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {t('admin.config.saving')}
            </>
          ) : (
            <>
              <Save size={15} />
              {t('admin.config.save_section')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children ?? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
        />
      )}
    </div>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── NotifToggle ──────────────────────────────────────────────────────────────

function NotifToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
      <div>
        <p className="text-sm font-semibold text-[#0D1F3C]">{label}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
          value ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// ─── PasswordField ────────────────────────────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#1E40AF] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-2.5 pr-11 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConfigPage() {
  const { isAdmin, hasPermission } = usePermission();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin && !hasPermission('config.view') && !hasPermission('config.manage')) {
      navigate('/admin/dashboard');
    }
  }, []);

  const [config, setConfig]   = useState<Config>({});
  const [saving, setSaving]   = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(false);
  const [confirmMaint, setConfirmMaint] = useState(false);

  // ─── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    apiClient
      .get('/api/admin/system-config')
      .then((r) => { setConfig(r.data); setLoading(false); })
      .catch(() => { setLoadErr(true); setLoading(false); });
  }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const update = (key: string, value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const bool = (key: string, fallback = '0') =>
    (config[key] ?? fallback) === '1';

  const toggle = (key: string) =>
    update(key, bool(key) ? '0' : '1');

  // ─── Save ─────────────────────────────────────────────────────────────────

  const save = async (section: string, keys: string[]) => {
    setSaving((prev) => ({ ...prev, [section]: true }));
    const payload = Object.fromEntries(keys.map((k) => [k, config[k] ?? '']));
    try {
      await apiClient.post(`/api/admin/system-config/${section}`, payload);
      toast('success', t('common.success'), t('admin.config.save_success'));
    } catch {
      toast('error', t('common.error'), t('admin.config.save_error'));
    } finally {
      setSaving((prev) => ({ ...prev, [section]: false }));
    }
  };

  // ─── Maintenance toggle (requires confirmation to enable) ─────────────────

  const handleMaintenanceToggle = () => {
    if (!bool('maintenance_mode')) {
      setConfirmMaint(true);
    } else {
      update('maintenance_mode', '0');
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#2563EB]" />
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-500">{t('admin.config.error_load')}</p>
        <button
          onClick={() => { setLoadErr(false); setLoading(true); apiClient.get('/api/admin/system-config').then((r) => { setConfig(r.data); setLoading(false); }).catch(() => { setLoadErr(true); setLoading(false); }); }}
          className="text-sm text-[#2563EB] underline cursor-pointer"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-4xl">

      {/* ── Page Header ── */}
      <div
        className="rounded-2xl shadow-md p-5 mb-6 flex items-center justify-between border-l-4 border-[#CFA030] bg-white bg-opacity-80 backdrop-blur-md"
      >
        <div>
          <h1 className="text-2xl font-black text-[#0D1F3C]">{t('admin.config.title')}</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{t('admin.config.subtitle')}</p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl shadow-sm">
          <Settings size={22} className="text-[#CFA030]" />
        </div>
      </div>

      {/* ── Section 1 — Général ── */}
      <SectionCard
        title={t('admin.config.section_general')}
        icon={
          <span className="flex items-center justify-center w-9 h-9 bg-[#EFF6FF] rounded-xl">
            <Settings size={18} className="text-[#2563EB]" />
          </span>
        }
        onSave={() => save('general', SECTION_KEYS.general)}
        saving={!!saving.general}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label={t('admin.config.field_app_name')}
            value={config.app_name ?? ''}
            onChange={(v) => update('app_name', v)}
            placeholder="GSLC"
          />
          <Field
            label={t('admin.config.field_app_url')}
            value={config.app_url ?? ''}
            onChange={(v) => update('app_url', v)}
            placeholder="https://gslc.nashco.dz"
          />
          <SelectField
            label={t('admin.config.field_timezone')}
            value={config.timezone ?? 'Africa/Algiers'}
            onChange={(v) => update('timezone', v)}
            options={[
              { value: 'Africa/Algiers', label: 'Africa/Algiers' },
              { value: 'Europe/Paris',   label: 'Europe/Paris' },
              { value: 'Europe/London',  label: 'Europe/London' },
              { value: 'UTC',            label: 'UTC' },
            ]}
          />
          <SelectField
            label={t('common.language')}
            value={config.default_lang ?? 'fr'}
            onChange={(v) => update('default_lang', v)}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
      </SectionCard>

      {/* ── Section 2 — Email SMTP ── */}
      <SectionCard
        title={t('admin.config.section_email')}
        icon={
          <span className="flex items-center justify-center w-9 h-9 bg-[#F0FDF4] rounded-xl">
            <Mail size={18} className="text-[#10B981]" />
          </span>
        }
        onSave={() => save('email', SECTION_KEYS.email)}
        saving={!!saving.email}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label={t('admin.config.field_smtp_host')}
            value={config.smtp_host ?? ''}
            onChange={(v) => update('smtp_host', v)}
            placeholder="smtp.gmail.com"
          />
          <Field
            label={t('admin.config.field_smtp_port')}
            value={config.smtp_port ?? ''}
            onChange={(v) => update('smtp_port', v)}
            type="number"
            placeholder="587"
          />
          <Field
            label={t('admin.config.field_smtp_user')}
            value={config.smtp_username ?? ''}
            onChange={(v) => update('smtp_username', v)}
            placeholder="user@domain.com"
          />
          <PasswordField
            label={t('admin.config.field_smtp_pass')}
            value={config.smtp_password ?? ''}
            onChange={(v) => update('smtp_password', v)}
          />
          <div className="sm:col-span-2">
            <Field
              label={t('admin.config.field_smtp_from')}
              value={config.smtp_from ?? ''}
              onChange={(v) => update('smtp_from', v)}
              type="email"
              placeholder="no-reply@nashco.dz"
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Section 3 — Notifications ── */}
      <SectionCard
        title={t('admin.config.section_notifications')}
        icon={
          <span className="flex items-center justify-center w-9 h-9 bg-[#FFFBEB] rounded-xl">
            <Bell size={18} className="text-[#F59E0B]" />
          </span>
        }
        onSave={() => save('notifications', SECTION_KEYS.notifications)}
        saving={!!saving.notifications}
      >
        <NotifToggle
          label={t('admin.config.field_notif_registration')}
          description="Notifier l'admin lors d'une nouvelle demande d'inscription"
          value={bool('notif_new_registration', '1')}
          onChange={(v) => update('notif_new_registration', v ? '1' : '0')}
        />
        <NotifToggle
          label="Nouveau contrat signé"
          description="Notifier lors de la signature d'un contrat client"
          value={bool('notif_new_contract', '1')}
          onChange={(v) => update('notif_new_contract', v ? '1' : '0')}
        />
        <NotifToggle
          label="Surestarie détectée"
          description="Alerter quand une surestarie est calculée sur une expédition"
          value={bool('notif_surestarie', '1')}
          onChange={(v) => update('notif_surestarie', v ? '1' : '0')}
        />
      </SectionCard>

      {/* ── Section 4 — Maintenance ── */}
      <SectionCard
        title={t('admin.config.section_maintenance')}
        icon={
          <span className="flex items-center justify-center w-9 h-9 bg-[#FEF2F2] rounded-xl">
            <AlertTriangle size={18} className="text-[#EF4444]" />
          </span>
        }
        onSave={() => save('maintenance', SECTION_KEYS.maintenance)}
        saving={!!saving.maintenance}
      >
        <NotifToggle
          label={t('admin.config.field_maintenance_mode')}
          description={t('admin.config.confirm_maintenance_message')}
          value={bool('maintenance_mode')}
          onChange={handleMaintenanceToggle}
        />

        {bool('maintenance_mode') && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              {t('admin.config.confirm_maintenance_message')}
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Confirm maintenance dialog ── */}
      {confirmMaint && (
        <ConfirmDialog
          title={t('admin.config.confirm_maintenance_title')}
          message={t('admin.config.confirm_maintenance_message')}
          onConfirm={() => {
            update('maintenance_mode', '1');
            setConfirmMaint(false);
          }}
          onCancel={() => setConfirmMaint(false)}
        />
      )}
    </div>
  );
}
