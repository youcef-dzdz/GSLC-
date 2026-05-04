import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, Trash2, Plus, Anchor } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { portsService, Port, PortForm } from '../../../services/portsService';
import { C, Skel, StatutBadge, TYPE_PORT, Modal, ConfirmModal } from './PortShared';

export const PortsTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState<Port | 'new' | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<PortForm>({ nom_port: '', code_port: '', ville: '', type_port: 'MARITIME', jours_allowance_defaut: 10, actif: true });

  const { data: rawPorts = [], isLoading } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });
  
  // Deduplicate ports by ID
  const ports = useMemo(() => {
    const map = new Map();
    rawPorts.forEach(p => map.set(p.id, p));
    return Array.from(map.values()) as Port[];
  }, [rawPorts]);

  const filtered = ports.filter(p => {
    const matchSearch = !search || 
      p.nom_port.toLowerCase().includes(search.toLowerCase()) || 
      p.code_port.toLowerCase().includes(search.toLowerCase()) ||
      p.ville.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || p.type_port === filterType;
    return matchSearch && matchType;
  });

  const save = useMutation({
    mutationFn: (data: PortForm) => modal === 'new' ? portsService.createPort(data) : portsService.updatePort((modal as Port).id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-ports'] }); 
      toast('success', modal === 'new' ? 'Port créé' : 'Port mis à jour');
      setModal(null); 
    },
    onError: () => toast('error', 'Erreur lors de la sauvegarde')
  });

  const del = useMutation({
    mutationFn: portsService.deletePort,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-ports'] }); 
      toast('success', 'Port supprimé');
      setConfirm(null); 
    },
    onError: () => toast('error', 'Erreur lors de la suppression')
  });

  const openNew = () => { setForm({ nom_port: '', code_port: '', ville: '', type_port: 'MARITIME', jours_allowance_defaut: 10, actif: true }); setModal('new'); };
  const openEdit = (p: Port) => { setForm({ nom_port: p.nom_port, code_port: p.code_port, ville: p.ville, type_port: p.type_port, jours_allowance_defaut: p.jours_allowance_defaut, actif: p.actif }); setModal(p); };

  if (isLoading) return <Skel />;

  return (
    <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#F0F7FF] bg-[#F9FBFF]">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A5A8A]" size={16} />
            <input type="text" className={C.fi} placeholder={t('admin.ports.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={C.fi} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">{t('admin.ports.all_types')}</option>
            <option value="MARITIME">{t('admin.ports.type_maritime')}</option>
            <option value="AERIEN">{t('admin.ports.type_aerien')}</option>
            <option value="TERRESTRE">{t('admin.ports.type_terrestre')}</option>
          </select>
          <button onClick={() => { setSearch(''); setFilterType(''); }} className={C.reset}>{t('common.reset_filters')}</button>
          {canEdit && <button onClick={openNew} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition-all"><Plus size={14} />{t('admin.ports.new')}</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F0F7FF]">
              {[t('admin.ports.col_name'), t('admin.ports.col_code'), t('admin.ports.col_city'), t('admin.ports.col_type'), t('admin.ports.col_allowance'), t('admin.ports.col_status'), t('admin.ports.col_terminals'), t('admin.ports.col_depots'), t('admin.ports.col_actions')].map(h => (
                <th key={h} className={C.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id} className="hover:bg-[#F9FBFF] transition-colors">
                <td className={C.td}><div className="flex items-center gap-2 font-semibold text-[#0D2A5E]"><Anchor size={14} className="text-[#3A5A8A]" />{p.nom_port}</div></td>
                <td className={C.td}><code className="bg-[#EDF4FF] px-1.5 py-0.5 rounded text-[#1A4A9A] text-xs font-mono">{p.code_port}</code></td>
                <td className={C.td}>{p.ville}</td>
                <td className={C.td}><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_PORT[p.type_port]?.cls || 'bg-gray-100 text-gray-600'}`}>{TYPE_PORT[p.type_port]?.label || p.type_port}</span></td>
                <td className={C.td}><span className="font-medium">{p.jours_allowance_defaut}j</span></td>
                <td className={C.td}><StatutBadge actif={p.actif} /></td>
                <td className={C.td}><span className="px-1.5 py-0.5 bg-[#EDF4FF] text-[#1A4A9A] rounded-md font-bold text-xs">{p.terminaux_count}</span></td>
                <td className={C.td}><span className="px-1.5 py-0.5 bg-[#EDF4FF] text-[#1A4A9A] rounded-md font-bold text-xs">{p.depots_count}</span></td>
                <td className={C.td}>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A] hover:text-[#0D2A5E] transition-colors" title={t('common.edit')}><Pencil size={13} /></button>
                    {canEdit && <button onClick={() => setConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020] hover:text-[#5A0000] transition-colors" title={t('common.delete')}><Trash2 size={13} /></button>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-[#88A8D0] italic">{search || filterType ? t('common.no_results_filters') : t('admin.ports.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'new' ? t('admin.ports.modal_create') : t('admin.ports.modal_edit')} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.ports.field_name')}</label><input className={C.fi} style={{width:'100%'}} value={form.nom_port} onChange={e => setForm({...form, nom_port: e.target.value})} required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.ports.field_code')}</label><input className={C.fi} style={{width:'100%'}} value={form.code_port} onChange={e => setForm({...form, code_port: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.ports.field_city')}</label><input className={C.fi} style={{width:'100%'}} value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.ports.field_type')}</label><select className={C.fi} style={{width:'100%'}} value={form.type_port} onChange={e => setForm({...form, type_port: e.target.value as any})}>
                <option value="MARITIME">MARITIME</option><option value="AERIEN">AERIEN</option><option value="TERRESTRE">TERRESTRE</option>
              </select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.ports.field_allowance')}</label><input type="number" className={C.fi} style={{width:'100%'}} value={form.jours_allowance_defaut} onChange={e => setForm({...form, jours_allowance_defaut: parseInt(e.target.value)})} required /></div>
              <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="pactif" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})} className="rounded border-[#C5D8F5] text-[#C8960A]" /><label htmlFor="pactif" className="text-sm font-semibold text-[#0D2A5E]">{t('admin.ports.field_actif')}</label></div>
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
