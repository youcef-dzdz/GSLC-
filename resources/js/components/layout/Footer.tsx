import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const year = new Date().getFullYear();

  return (
    <footer className="py-4 mt-auto bg-white border-t border-[#E2E8F0] shrink-0">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className={`flex flex-col items-center justify-between gap-3 md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''}`}>

          {/* Copyright */}
          <p className="text-sm text-[#6B7280]">
            <span className="font-semibold text-[#0D1F3C]">NASHCO GSLC</span>
            {' '}© {year} — {t('footer.rights')}
          </p>

          {/* Links */}
          <div className={`flex items-center gap-4 text-sm text-[#6B7280] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <a href="#" className="hover:text-[#0D1F3C] transition-colors duration-150">
              {t('footer.support')}
            </a>
            <span className="text-[#E2E8F0]">·</span>
            <a href="#" className="hover:text-[#0D1F3C] transition-colors duration-150">
              {t('footer.terms')}
            </a>
            <span className="text-[#E2E8F0]">·</span>
            <a href="#" className="hover:text-[#0D1F3C] transition-colors duration-150">
              {t('footer.privacy')}
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};
