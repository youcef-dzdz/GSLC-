import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, Trash2, Plus, Box } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { portsService, Terminal, TerminalForm, Port } from '../../../services/portsService';
import { C, Skel, StatutBadge, Modal, ConfirmModal } from './PortShared';

export const TerminauxTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPort, setFilterPort] = useState('');
  const [modal, setModal] = useState<Terminal | 'new' | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<TerminalForm>({ port_id: 0, code_terminal: '', nom_terminal: '', capacite_max_teu: 0, taux_occupation: 0, actif: true });

  const { data: rawPorts = [] } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });
  const { data: terms = [], isLoading } = useQuery({ queryKey: ['admin-terminaux'], queryFn: portsService.getTerminaux });

  const ports = useMemo(() => {
    const map = new Map();
    rawPorts.forEach(p => map.set(p.id, p));
    return Array.from(map.values()) as Port[];
  }, [rawPorts]);

  const filtered = terms.filter(term => {
    const matchSearch = !search || term.nom_terminal.toLowerCase().includes(search.toLowerCase()) || term.code_terminal.toLowerCase().includes(search.toLowerCase());
    const matchPort = !filterPort || String(term.port_id) === filterPort;
    return matchSearch && matchPort;
  });

  const save = useMutation({
    mutationFn: (data: TerminalForm) => modal === 'new' ? portsService.createTerminal(data) : portsService.updateTerminal((modal as Terminal).id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-terminaux'] }); 
      toast('success', modal === 'new' ? 'Terminal créé' : 'Terminal mis à jour');
      setModal(null); 
    },
    onError: () => toast('error', 'Erreur lors de la sauvegarde')
  });

  const del = useMutation({
    mutationFn: portsService.deleteTerminal,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-terminaux'] }); 
      toast('success', 'Terminal supprimé');
      setConfirm(null); 
    },
    onError: () => toast('error', 'Erreur lors de la suppression')
  });

  const openNew = () => { setForm({ port_id: ports[0]?.id || 0, code_terminal: '', nom_terminal: '', capacite_max_teu: 0, taux_occupation: 0, actif: true }); setModal('new'); };
  const openEdit = (term: Terminal) => { setForm({ port_id: term.port_id, code_terminal: term.code_terminal, nom_terminal: term.nom_terminal, capacite_max_teu: term.capacite_max_teu, taux_occupation: term.taux_occupation, actif: term.actif }); setModal(term); };

  if (isLoading) return <Skel />;

  return (
    <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#F0F7FF] bg-[#F9FBFF]">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A5A8A]" size={16} />
            <input type="text" className={C.fi} placeholder={t('admin.terminaux.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={C.fi} value={filterPort} onChange={e => setFilterPort(e.target.value)}>
            <option value="">{t('admin.terminaux.all_ports')}</option>
            {ports.map(p => <option key={p.id} value={String(p.id)}>{p.nom_port}</option>)}
          </select>
          <button onClick={() => { setSearch(''); setFilterPort(''); }} className={C.reset}>{t('common.reset_filters')}</button>
          {canEdit && <button onClick={openNew} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition-all"><Plus size={14} />{t('admin.terminaux.new')}</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F0F7FF]">
              {[t('admin.terminaux.col_name'), t('admin.terminaux.col_code'), t('admin.terminaux.col_port'), t('admin.terminaux.col_capacity'), t('admin.terminaux.col_occupation'), t('admin.terminaux.col_status'), t('admin.terminaux.col_actions')].map(h => (
                <th key={h} className={C.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(term => (
              <tr key={term.id} className="hover:bg-[#F9FBFF] transition-colors">
                <td className={C.td}><div className="flex items-center gap-2 font-semibold text-[#0D2A5E]"><Box size={14} className="text-[#3A5A8A]" />{term.nom_terminal}</div></td>
                <td className={C.td}><code className="bg-[#EDF4FF] px-1.5 py-0.5 rounded text-[#1A4A9A] text-xs font-mono">{term.code_terminal}</code></td>
                <td className={C.td}>{term.port?.nom_port || '-'}</td>
                <td className={C.td}><span className="font-medium">{term.capacite_max_teu} TEU</span></td>
                <td className={C.td}><div className="w-full bg-[#EDF4FF] rounded-full h-1.5 w-24 overflow-hidden"><div className="bg-[#1A4A9A] h-full transition-all" style={{width: `${term.taux_occupation}%`}} /></div><span className="text-[10px] font-bold text-[#1A4A9A]">{term.taux_occupation}%</span></td>
                <td className={C.td}><StatutBadge actif={term.actif} /></td>
                <td className={C.td}>
                  <div className="flex gap-1">
                    {canEdit && <button onClick={() => openEdit(term)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A] hover:text-[#0D2A5E] transition-colors" title={t('common.edit')}><Pencil size={13} /></button>}
                    {canEdit && <button onClick={() => setConfirm(term.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020] hover:text-[#5A0000] transition-colors" title={t('common.delete')}><Trash2 size={13} /></button>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[#88A8D0] italic">{search || filterPort ? t('common.no_results_filters') : t('admin.terminaux.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'new' ? t('admin.terminaux.modal_create') : t('admin.terminaux.modal_edit')} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.terminaux.field_port')}</label><select className={C.fi} style={{width:'100%'}} value={form.port_id} onChange={e => setForm({...form, port_id: parseInt(e.target.value)})}>
              {ports.map(p => <option key={p.id} value={p.id}>{p.nom_port}</option>)}
            </select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.terminaux.field_name')}</label><input className={C.fi} style={{width:'100%'}} value={form.nom_terminal} onChange={e => setForm({...form, nom_terminal: e.target.value})} required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.terminaux.field_code')}</label><input className={C.fi} style={{width:'100%'}} value={form.code_terminal} onChange={e => setForm({...form, code_terminal: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.terminaux.field_capacity')}</label><input type="number" className={C.fi} style={{width:'100%'}} value={form.capacite_max_teu} onChange={e => setForm({...form, capacite_max_teu: parseInt(e.target.value)})} required /></div>
              <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="tactif" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})} className="rounded border-[#C5D8F5] text-[#C8960A]" /><label htmlFor="tactif" className="text-sm font-semibold text-[#0D2A5E]">{t('admin.terminaux.field_actif')}</label></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-[#3A5A8A] bg-[#F0F7FF] rounded-xl hover:bg-[#E0EEFF] transition-colors">{t('common.cancel')}</button>
              <button type="submit" disabled={save.isPending} className="flex-2 px-6 py-2 text-sm font-bold text-white bg-[#0D2A5E] rounded-xl hover:bg-[#1A4A9A] disabled:opacity-50 shadow-lg shadow-blue-100 transition-all">{save.isPending ? t('common.saving') : t('common.save')}</button>
            </div>
          </form>
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal message={t('common.confirm_delete_message')} onConfirm={() => del.mutate(confirm!)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
};
