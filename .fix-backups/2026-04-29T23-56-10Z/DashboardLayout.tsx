import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';

export const DashboardLayout = () => {
  // On desktop (≥1024px) the sidebar starts open and has no toggle button,
  // so it stays open permanently. On mobile it starts closed and can be toggled.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');

  // Apply premium theme globally to the body
  useEffect(() => {
    document.body.classList.add('gslc-premium-theme-active');
    return () => document.body.classList.remove('gslc-premium-theme-active');
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col font-sans gslc-premium-theme">
      <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content is always offset by sidebar width on large screens */}
        <div className={`flex flex-col flex-1 w-full min-w-0 transition-all duration-300 ${isRTL ? 'lg:pr-[240px]' : 'lg:pl-[240px]'}`}>
          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
