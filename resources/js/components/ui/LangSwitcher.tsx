import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'عر', name: 'العربية' },
];

export const LangSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] ?? 'fr';

  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l) => {
        const isActive = current === l.code;
        return (
          <button
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            title={l.name}
            className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
            style={{
              background: isActive
                ? dark ? 'rgba(207,160,48,0.2)' : '#0D1F3C'
                : 'transparent',
              color: isActive
                ? dark ? '#CFA030' : '#fff'
                : dark ? 'rgba(255,255,255,0.4)' : '#94A3B8',
              border: isActive
                ? dark ? '1px solid rgba(207,160,48,0.4)' : 'none'
                : '1px solid transparent',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
};
