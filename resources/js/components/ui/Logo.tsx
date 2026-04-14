import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const LOGO_URL = '/images/nashco_logo Company.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** When true, wraps the logo in a Link to "/" */
  linked?: boolean;
  /** When true, suppresses the "GSLC" text label (icon-only mode) */
  iconOnly?: boolean;
  /** Override text color for contexts with dark backgrounds */
  textClassName?: string;
}

const sizeMap = {
  sm: { img: 'h-6',  text: 'text-sm',  pad: 'p-1',   gap: 'gap-1.5' },
  md: { img: 'h-8',  text: 'text-base', pad: 'p-1',   gap: 'gap-2'   },
  lg: { img: 'h-12', text: 'text-xl',   pad: 'p-1.5', gap: 'gap-3'   },
};

function LogoInner({ size = 'md', iconOnly = false, textClassName }: Omit<LogoProps, 'linked'>) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${s.gap} ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center justify-center flex-shrink-0`}>
        <img
          src={LOGO_URL}
          alt="NASHCO GSLC"
          className={`${s.img} w-auto object-contain block`}
          draggable={false}
        />
      </div>
      {!iconOnly && (
        <span
          className={`font-bold tracking-wide select-none ${s.text} ${textClassName ?? 'text-[#CFA030]'}`}
        >
          GSLC
        </span>
      )}
    </div>
  );
}

export function Logo({ size = 'md', linked = false, iconOnly = false, textClassName }: LogoProps) {
  if (linked) {
    return (
      <Link to="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CFA030] rounded-lg">
        <LogoInner size={size} iconOnly={iconOnly} textClassName={textClassName} />
      </Link>
    );
  }
  return <LogoInner size={size} iconOnly={iconOnly} textClassName={textClassName} />;
}
