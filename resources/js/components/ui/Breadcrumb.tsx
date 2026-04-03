import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  /** Override the home link destination (defaults to current role dashboard or '/') */
  homeHref?: string;
}

export const Breadcrumb = ({ crumbs, homeHref = '/' }: BreadcrumbProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  return (
    <nav
      aria-label="breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 text-xs text-[#94A3B8] mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}
    >
      {/* Home icon */}
      <Link
        to={homeHref}
        aria-label={t('common.dashboard')}
        className="flex items-center text-[#94A3B8] hover:text-[#0D1F3C] transition-colors duration-150"
      >
        <Home size={13} />
      </Link>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <Fragment key={i}>
            {/* Separator — mirrors in RTL */}
            <ChevronRight
              size={12}
              className={`text-[#CBD5E1] flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />

            {/* Crumb */}
            {crumb.href && !isLast ? (
              <Link
                to={crumb.href}
                className="font-medium text-[#94A3B8] hover:text-[#0D1F3C] transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-[#0D1F3C]" aria-current={isLast ? 'page' : undefined}>
                {crumb.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};
