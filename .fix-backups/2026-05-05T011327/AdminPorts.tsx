import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Anchor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PortsTab } from './ports/PortsTab';
import { TerminauxTab } from './ports/TerminauxTab';
import { DepotsTab } from './ports/DepotsTab';

const AdminPorts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<'ports' | 'terminaux' | 'depots'>('ports');

  const canEdit = (user?.role?.niveau ?? 99) <= 3;

  const tabs = [
    { key: 'ports',     label: t('admin.ports.tab_ports') },
    { key: 'terminaux', label: t('admin.ports.tab_terminaux') },
    { key: 'depots',    label: t('admin.ports.tab_depots') },
  ] as const;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#0D2A5E] text-white rounded-2xl shadow-lg shadow-blue-100">
            <Anchor size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0D2A5E] tracking-tight">{t('admin.ports.title')}</h1>
            <p className="text-[11px] text-[#88A8D0]">{t('admin.ports.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-white border border-[#C5D8F5] rounded-xl p-1 w-fit">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${tab === tb.key ? 'bg-[#0D2A5E] text-white shadow-md' : 'bg-white text-[#3A5A8A] hover:bg-[#EDF4FF]'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-in fade-in duration-300">
        {tab === 'ports'     && <PortsTab     canEdit={canEdit} />}
        {tab === 'terminaux' && <TerminauxTab canEdit={canEdit} />}
        {tab === 'depots'    && <DepotsTab    canEdit={canEdit} />}
      </div>
    </div>
  );
};

export default AdminPorts;
