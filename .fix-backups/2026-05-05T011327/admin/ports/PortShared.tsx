import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export const C = {
  th: 'px-4 py-3 text-left text-[11px] font-bold text-[#0D2A5E] uppercase tracking-wider border-b border-[#C5D8F5]',
  td: 'px-4 py-3 text-sm text-[#0D2A5E] border-b border-[#F0F7FF] whitespace-nowrap',
  fi: 'pl-9 pr-4 py-2 text-sm border border-[#C5D8F5] rounded-xl focus:ring-2 focus:ring-[#C8960A] focus:border-transparent outline-none transition-all w-full sm:w-64 bg-white text-[#0D2A5E]',
  reset: 'border border-[#C5D8F5] text-[#3A5A8A] text-sm px-3 py-2 rounded-lg hover:bg-[#EDF4FF] transition-colors',
};

export const Skel = () => (
  <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden">
    <div className="h-10 bg-[#F0F7FF] animate-pulse" />
    {[1,2,3,4,5].map(i => <div key={i} className="h-14 border-b border-[#F0F7FF] animate-pulse" />)}
  </div>
);

export const Badge = ({ children, className }: { children: React.ReactNode, className: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>{children}</span>
);

export const StatutBadge = ({ actif }: { actif: boolean }) => (
  actif 
    ? <Badge className="bg-[#E2F7E2] text-[#1B5E20]">Actif</Badge>
    : <Badge className="bg-[#FFEAEA] text-[#C62828]">Inactif</Badge>
);

export const TYPE_PORT = {
  MARITIME:  { label: 'Maritime',  cls: 'bg-[#E0EEFF] text-[#1A4A9A]' },
  AERIEN:    { label: 'Aérien',    cls: 'bg-[#F3E5F5] text-[#7B1FA2]' },
  TERRESTRE: { label: 'Terrestre', cls: 'bg-[#E8F5E9] text-[#2E7D32]' }
};

export const TYPE_STOCKAGE = {
  SEC:        { label: 'Sec',        cls: 'bg-[#E0EEFF] text-[#1A4A9A]' },
  FRIGO:      { label: 'Frigo',      cls: 'bg-[#EEF5FF] text-[#5A80BB]' },
  DANGEREUX:  { label: 'Dangereux',  cls: 'bg-[#FFF0F0] text-[#8A2020]' }
};

export const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#C5D8F5] overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="flex items-center justify-between p-5 border-b border-[#F0F7FF] bg-[#F9FBFF]">
        <h3 className="text-lg font-bold text-[#0D2A5E]">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-[#EDF4FF] rounded-xl text-[#3A5A8A] transition-colors"><X size={20} /></button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);

export const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string, onConfirm: () => void, onCancel: () => void }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#C5D8F5] animate-in fade-in zoom-in duration-200 text-center">
      <div className="w-16 h-16 bg-[#FFF0F0] text-[#8A2020] rounded-full flex items-center justify-center mx-auto mb-4">
        <X size={32} />
      </div>
      <p className="text-[#0D2A5E] font-medium mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-[#3A5A8A] bg-[#F0F7FF] rounded-xl hover:bg-[#E0EEFF] transition-colors">Annuler</button>
        <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-[#8A2020] rounded-xl hover:bg-[#5A0000] shadow-lg shadow-red-100 transition-all">Confirmer</button>
      </div>
    </div>
  </div>
);
