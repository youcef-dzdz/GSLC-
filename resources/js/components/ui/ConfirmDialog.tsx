import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  /** Defaults to t('common.confirm') */
  confirmLabel?: string;
  /** Defaults to t('common.cancel') */
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  const resolvedConfirm = confirmLabel ?? t('common.confirm');
  const resolvedCancel  = cancelLabel  ?? t('common.cancel');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconBg    = variant === 'danger'  ? '#FEF2F2'
                  : variant === 'warning' ? '#FFFBEB'
                  : '#EFF6FF';
  const iconColor = variant === 'danger'  ? '#DC2626'
                  : variant === 'warning' ? '#F59E0B'
                  : '#2563EB';
  const btnBg     = variant === 'danger'  ? '#DC2626'
                  : variant === 'warning' ? '#F59E0B'
                  : '#0D1F3C';
  const IconComp  = variant === 'info' ? Info : AlertTriangle;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(9,21,44,.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog card */}
      <div style={{
        position: 'relative',
        background: '#fff',
        borderRadius: 16,
        padding: '1.75rem',
        maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,.18)',
        border: '1px solid #E2E8F0',
      }}>
        {/* Close button — flips side in RTL */}
        <button
          onClick={onCancel}
          aria-label={resolvedCancel}
          style={{
            position: 'absolute',
            top: 14,
            ...(isRTL ? { left: 14 } : { right: 14 }),
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B',
            transition: 'background .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; }}
        >
          <X size={14} />
        </button>

        {/* Icon + title row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: 14,
          marginBottom: 14,
        }}>
          <div style={{
            width: 44, height: 44,
            background: iconBg,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconComp style={{ color: iconColor, width: 22, height: 22 }} />
          </div>
          <h3
            id="confirm-title"
            style={{
              fontSize: 16, fontWeight: 800,
              color: '#0D1F3C', margin: 0,
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {title}
          </h3>
        </div>

        {/* Message */}
        <p
          id="confirm-message"
          style={{
            fontSize: 14, color: '#6B7280',
            lineHeight: 1.7, marginBottom: '1.5rem',
            textAlign: isRTL ? 'right' : 'left',
          }}
        >
          {message}
        </p>

        {/* Action buttons — justify flips in RTL */}
        <div style={{
          display: 'flex',
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: 10,
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 8,
              background: '#fff',
              color: '#475569',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F0F4F8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            {resolvedCancel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              border: 'none',
              borderRadius: 8,
              background: btnBg,
              color: '#fff',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${btnBg}44`,
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
