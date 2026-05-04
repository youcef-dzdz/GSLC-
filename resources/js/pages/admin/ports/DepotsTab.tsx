import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Pencil, Trash2, Plus, Home } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { portsService, Depot, DepotForm, Port } from '../../../services/portsService';
import { C, Skel, StatutBadge, TYPE_STOCKAGE, Modal, ConfirmModal } from './PortShared';

export const DepotsTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPort, setFilterPort] = useState('');
  const [modal, setModal] = useState<Depot | 'new' | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<DepotForm>({ port_id: 0, terminal_id: null, code_depot: '', nom_depot: '', type_stockage: 'SEC', capacite_totale: 0, actif: true });

  const { data: rawPorts = [] } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });
  const { data: terms = [] } = useQuery({ queryKey: ['admin-terminaux'], queryFn: portsService.getTerminaux });
  const { data: depots = [], isLoading } = useQuery({ queryKey: ['admin-depots'], queryFn: portsService.getDepots });

  const ports = useMemo(() => {
    const map = new Map();
    rawPorts.forEach(p => map.set(p.id, p));
    return Array.from(map.values()) as Port[];
  }, [rawPorts]);

  // Build port options only from ports that actually have dépôts (avoids phantom seeded ports)
  const portOptions = useMemo(() =>
    Array.from(
      new Map(depots.map(d => [d.port?.id, d.port]).filter(([id]) => id)).values()
    ) as Port[],
  [depots]);

  const filtered = depots.filter(d => {
    const matchSearch = !search || d.nom_depot.toLowerCase().includes(search.toLowerCase()) || d.code_depot.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || d.type_stockage === filterType;
    const matchPort = !filterPort || String(d.port_id) === filterPort;
    return matchSearch && matchType && matchPort;
  });

  const save = useMutation({
    mutationFn: (data: DepotForm) => modal === 'new' ? portsService.createDepot(data) : portsService.updateDepot((modal as Depot).id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-depots'] }); 
      toast('success', modal === 'new' ? 'Dépôt créé' : 'Dépôt mis à jour');
      setModal(null); 
    },
    onError: () => toast('error', 'Erreur lors de la sauvegarde')
  });

  const del = useMutation({
    mutationFn: portsService.deleteDepot,
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-depots'] }); 
      toast('success', 'Dépôt supprimé');
      setConfirm(null); 
    },
    onError: () => toast('error', 'Erreur lors de la suppression')
  });

  const openNew = () => { setForm({ port_id: ports[0]?.id || 0, terminal_id: null, code_depot: '', nom_depot: '', type_stockage: 'SEC', capacite_totale: 0, actif: true }); setModal('new'); };
  const openEdit = (d: Depot) => { setForm({ port_id: d.port_id, terminal_id: d.terminal_id, code_depot: d.code_depot, nom_depot: d.nom_depot, type_stockage: d.type_stockage, capacite_totale: d.capacite_totale, actif: d.actif }); setModal(d); };

  if (isLoading) return <Skel />;

  return (
    <div className="bg-white rounded-2xl border border-[#C5D8F5] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#F0F7FF] bg-[#F9FBFF]">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A5A8A]" size={16} />
            <input type="text" className={C.fi} placeholder={t('admin.depots.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={C.fi} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">{t('admin.depots.all_types')}</option>
            <option value="SEC">{t('admin.depots.type_sec')}</option>
            <option value="FRIGO">{t('admin.depots.type_frigo')}</option>
            <option value="DANGEREUX">{t('admin.depots.type_dangereux')}</option>
          </select>
          <select className={C.fi} value={filterPort} onChange={e => setFilterPort(e.target.value)}>
            <option value="">{t('admin.depots.all_ports')}</option>
            {portOptions.map(p => p && <option key={p.id} value={String(p.id)}>{p.nom_port}</option>)}
          </select>
          <button onClick={() => { setSearch(''); setFilterType(''); setFilterPort(''); }} className={C.reset}>{t('common.reset_filters')}</button>
          {canEdit && <button onClick={openNew} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition-all"><Plus size={14} />{t('admin.depots.new')}</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F0F7FF]">
              {[t('admin.depots.col_code'), t('admin.depots.col_name'), t('admin.depots.col_port'), t('admin.depots.col_terminal'), t('admin.depots.col_type'), t('admin.depots.col_capacity'), t('admin.depots.col_status'), t('admin.depots.col_actions')].map(h => (
                <th key={h} className={C.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(d => (
              <tr key={d.id} className="hover:bg-[#F9FBFF] transition-colors">
                <td className={C.td}><code className="bg-[#EDF4FF] px-1.5 py-0.5 rounded text-[#1A4A9A] text-xs font-mono">{d.code_depot}</code></td>
                <td className={C.td}><div className="flex items-center gap-2 font-semibold text-[#0D2A5E]"><Home size={14} className="text-[#3A5A8A]" />{d.nom_depot}</div></td>
                <td className={C.td}>{d.port?.nom_port || '-'}</td>
                <td className={C.td}>{d.terminal?.nom_terminal || '-'}</td>
                <td className={C.td}><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_STOCKAGE[d.type_stockage]?.cls || 'bg-gray-100 text-gray-600'}`}>{TYPE_STOCKAGE[d.type_stockage]?.label || d.type_stockage}</span></td>
                <td className={C.td}><span className="font-medium">{d.capacite_totale} TEU</span></td>
                <td className={C.td}><StatutBadge actif={d.actif} /></td>
                <td className={C.td}>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A] hover:text-[#0D2A5E] transition-colors" title={t('common.edit')}><Pencil size={13} /></button>
                    <button onClick={() => setConfirm(d.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020] hover:text-[#5A0000] transition-colors" title={t('common.delete')}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[#88A8D0] italic">{search || filterType || filterPort ? t('common.no_results_filters') : t('admin.depots.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'new' ? t('admin.depots.modal_create') : t('admin.depots.modal_edit')} onClose={() => setModal(null)}>
          <form onSubmit={e => { e.preventDefault(); save.mutate(form); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_port')}</label><select className={C.fi} style={{width:'100%'}} value={form.port_id} onChange={e => setForm({...form, port_id: parseInt(e.target.value), terminal_id: null})}>
                {ports.map(p => <option key={p.id} value={p.id}>{p.nom_port}</option>)}
              </select></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_terminal')}</label><select className={C.fi} style={{width:'100%'}} value={form.terminal_id || ''} onChange={e => setForm({...form, terminal_id: e.target.value ? parseInt(e.target.value) : null})}>
                <option value="">{t('common.all')}</option>
                {terms.filter(t => t.port_id === form.port_id).map(t => <option key={t.id} value={t.id}>{t.nom_terminal}</option>)}
              </select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_name')}</label><input className={C.fi} style={{width:'100%'}} value={form.nom_depot} onChange={e => setForm({...form, nom_depot: e.target.value})} required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_code')}</label><input className={C.fi} style={{width:'100%'}} value={form.code_depot} onChange={e => setForm({...form, code_depot: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_type')}</label><select className={C.fi} style={{width:'100%'}} value={form.type_stockage} onChange={e => setForm({...form, type_stockage: e.target.value as any})}>
                <option value="SEC">SEC</option><option value="FRIGO">FRIGO</option><option value="DANGEREUX">DANGEREUX</option>
              </select></div>
              <div className="space-y-1"><label className="text-xs font-bold text-[#3A5A8A]">{t('admin.depots.field_capacity')}</label><input type="number" className={C.fi} style={{width:'100%'}} value={form.capacite_totale} onChange={e => setForm({...form, capacite_totale: parseInt(e.target.value)})} required /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="dactif" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})} className="rounded border-[#C5D8F5] text-[#C8960A]" /><label htmlFor="dactif" className="text-sm font-semibold text-[#0D2A5E]">{t('admin.depots.field_actif')}</label></div>
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
