import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, X, Anchor } from 'lucide-react';
import { portsService, Port, Terminal, Depot, PortForm, TerminalForm, DepotForm } from '@/services/portsService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';

// ── Shared ────────────────────────────────────────────────────────────────────

const C = {
  th: 'text-[#0D2A5E] font-bold text-xs px-4 py-3 text-left',
  td: 'px-4 py-3 text-sm text-[#0D2A5E]',
  input: 'w-full border border-[#C5D8F5] rounded-lg px-3 py-2 text-sm text-[#0D2A5E] focus:outline-none focus:ring-2 focus:ring-[#C8960A]/30',
  label: 'block text-xs font-semibold text-[#3A5A8A] mb-1',
};

const Skel = () => (
  <div className="space-y-2 p-4">
    {[1,2,3,4].map(i => <div key={i} className="h-10 rounded-lg" style={{ background: '#EEF5FF' }} />)}
  </div>
);

const Badge = ({ children, cls }: { children: React.ReactNode; cls: string }) => (
  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{children}</span>
);

const StatutBadge = ({ actif }: { actif: boolean }) => (
  <Badge cls={actif ? 'bg-[#E6F7F0] text-[#2A8A5A]' : 'bg-[#FFF0F0] text-[#8A2020]'}>
    {actif ? 'Actif' : 'Inactif'}
  </Badge>
);

const TYPE_PORT = {
  MARITIME:   { label: 'Maritime',   cls: 'bg-[#E0EEFF] text-[#1A4A9A]' },
  AERIEN:     { label: 'Aérien',     cls: 'bg-[#FFF3C0] text-[#7A5800]' },
  TERRESTRE:  { label: 'Terrestre',  cls: 'bg-[#E6F7F0] text-[#2A8A5A]' },
};

const TYPE_STOCKAGE = {
  SEC:        { label: 'Sec',        cls: 'bg-[#E0EEFF] text-[#1A4A9A]' },
  FRIGO:      { label: 'Frigo',      cls: 'bg-[#EEF5FF] text-[#5A80BB]' },
  DANGEREUX:  { label: 'Dangereux',  cls: 'bg-[#FFF0F0] text-[#8A2020]' },
};

// ── Modal shell ───────────────────────────────────────────────────────────────

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#C5D8F5] shrink-0">
        <h2 className="text-sm font-bold text-[#0D2A5E]">{title}</h2>
        <button onClick={onClose} className="text-[#88A8D0] hover:text-[#0D2A5E]"><X size={16} /></button>
      </div>
      <div className="px-6 py-4 space-y-3 overflow-y-auto flex-1 min-h-0">{children}</div>
    </div>
  </div>
);

const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4" style={{ zIndex: 999999 }} onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
    <div className="bg-white w-full max-w-sm max-h-[90vh] rounded-2xl flex flex-col overflow-hidden p-6 gap-4">
      <p className="text-sm text-[#0D2A5E]">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-[#C5D8F5] rounded-lg text-[#3A5A8A] hover:bg-[#EDF4FF]">Annuler</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm bg-[#8A2020] text-white rounded-lg hover:bg-[#6B1818]">Supprimer</button>
      </div>
    </div>
  </div>
);

// ── PortsTab ──────────────────────────────────────────────────────────────────

const PortsTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<Port | null | 'new'>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<PortForm>({ nom_port: '', code_port: '', ville: '', type_port: 'MARITIME', jours_allowance_defaut: 7, actif: true });

  const { data: ports = [], isLoading } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });

  const save = useMutation({
    mutationFn: (f: PortForm) => modal === 'new' ? portsService.createPort(f) : portsService.updatePort((modal as Port).id, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ports'] }); toast('success', t('common.saved')); setModal(null); },
    onError: () => toast('error', t('common.error')),
  });

  const del = useMutation({
    mutationFn: portsService.deletePort,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ports'] }); toast('success', t('common.deleted')); setConfirm(null); },
    onError: () => toast('error', t('common.error')),
  });

  const openEdit = (p: Port) => { setForm({ nom_port: p.nom_port, code_port: p.code_port, ville: p.ville, type_port: p.type_port, jours_allowance_defaut: p.jours_allowance_defaut, actif: p.actif }); setModal(p); };
  const openNew  = () => { setForm({ nom_port: '', code_port: '', ville: '', type_port: 'MARITIME', jours_allowance_defaut: 7, actif: true }); setModal('new'); };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08]"><Plus size={14} />{t('admin.ports.new')}</button>
      </div>
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        {isLoading ? <Skel /> : ports.length === 0 ? (
          <div className="py-12 text-center text-[#88A8D0] text-sm">{t('admin.ports.empty')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {[t('admin.ports.col_name'), t('admin.ports.col_code'), t('admin.ports.col_city'), t('admin.ports.col_type'), t('admin.ports.col_allowance'), t('admin.ports.col_terminals'), t('admin.ports.col_depots'), t('admin.ports.col_status'), t('admin.ports.col_actions')].map(h => <th key={h} className={C.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5FF]">
              {ports.map(p => (
                <tr key={p.id} className="hover:bg-[#F4F9FF] transition-colors">
                  <td className={C.td + ' font-semibold'}>{p.nom_port}</td>
                  <td className={C.td}><span className="font-mono text-xs bg-[#EEF5FF] px-2 py-0.5 rounded">{p.code_port}</span></td>
                  <td className={C.td}>{p.ville}</td>
                  <td className={C.td}><Badge cls={TYPE_PORT[p.type_port]?.cls ?? ''}>{TYPE_PORT[p.type_port]?.label ?? p.type_port}</Badge></td>
                  <td className={C.td}>{p.jours_allowance_defaut}j</td>
                  <td className={C.td}>{p.terminaux_count ?? 0}</td>
                  <td className={C.td}>{p.depots_count ?? 0}</td>
                  <td className={C.td}><StatutBadge actif={p.actif} /></td>
                  <td className={C.td}>
                    <div className="flex gap-1">
                      {canEdit && <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A]"><Pencil size={13} /></button>}
                      {canEdit && <button onClick={() => setConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020]"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? t('admin.ports.modal_create') : t('admin.ports.modal_edit')} onClose={() => setModal(null)}>
          <div><label className={C.label}>{t('admin.ports.field_name')}</label><input className={C.input} value={form.nom_port} onChange={e => setForm(f => ({ ...f, nom_port: e.target.value }))} /></div>
          <div><label className={C.label}>{t('admin.ports.field_code')}</label><input className={C.input} value={form.code_port} onChange={e => setForm(f => ({ ...f, code_port: e.target.value.toUpperCase() }))} /></div>
          <div><label className={C.label}>{t('admin.ports.field_city')}</label><input className={C.input} value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} /></div>
          <div><label className={C.label}>{t('admin.ports.field_type')}</label>
            <select className={C.input} value={form.type_port} onChange={e => setForm(f => ({ ...f, type_port: e.target.value as PortForm['type_port'] }))}>
              {(['MARITIME','AERIEN','TERRESTRE'] as const).map(v => <option key={v} value={v}>{TYPE_PORT[v].label}</option>)}
            </select>
          </div>
          <div><label className={C.label}>{t('admin.ports.field_allowance')}</label><input type="number" min={0} className={C.input} value={form.jours_allowance_defaut} onChange={e => setForm(f => ({ ...f, jours_allowance_defaut: +e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm text-[#3A5A8A] cursor-pointer"><input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />{t('admin.ports.field_actif')}</label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 text-sm border border-[#C5D8F5] rounded-xl text-[#3A5A8A] hover:bg-[#EDF4FF]">{t('common.cancel')}</button>
            <button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex-1 py-2 text-sm font-semibold bg-[#0D2A5E] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50">{t('common.save')}</button>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmModal message={t('common.confirmDelete')} onConfirm={() => del.mutate(confirm!)} onCancel={() => setConfirm(null)} />}
    </>
  );
};

// ── TerminauxTab ──────────────────────────────────────────────────────────────

const TerminauxTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<Terminal | null | 'new'>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<TerminalForm>({ port_id: 0, code_terminal: '', nom_terminal: '', capacite_max_teu: 0, taux_occupation: 0, actif: true });

  const { data: terminaux = [], isLoading } = useQuery({ queryKey: ['admin-terminaux'], queryFn: portsService.getTerminaux });
  const { data: ports = [] } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });

  const save = useMutation({
    mutationFn: (f: TerminalForm) => modal === 'new' ? portsService.createTerminal(f) : portsService.updateTerminal((modal as Terminal).id, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-terminaux'] }); toast('success', t('common.saved')); setModal(null); },
    onError: () => toast('error', t('common.error')),
  });

  const del = useMutation({
    mutationFn: portsService.deleteTerminal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-terminaux'] }); toast('success', t('common.deleted')); setConfirm(null); },
    onError: () => toast('error', t('common.error')),
  });

  const openEdit = (t: Terminal) => { setForm({ port_id: t.port_id, code_terminal: t.code_terminal, nom_terminal: t.nom_terminal, capacite_max_teu: t.capacite_max_teu, taux_occupation: t.taux_occupation, actif: t.actif }); setModal(t); };
  const openNew  = () => { setForm({ port_id: ports[0]?.id ?? 0, code_terminal: '', nom_terminal: '', capacite_max_teu: 0, taux_occupation: 0, actif: true }); setModal('new'); };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08]"><Plus size={14} />{t('admin.terminaux.new')}</button>
      </div>
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        {isLoading ? <Skel /> : terminaux.length === 0 ? (
          <div className="py-12 text-center text-[#88A8D0] text-sm">{t('admin.terminaux.empty')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {[t('admin.terminaux.col_name'), t('admin.terminaux.col_code'), t('admin.terminaux.col_port'), t('admin.terminaux.col_capacity'), t('admin.terminaux.col_occupation'), t('admin.terminaux.col_status'), t('admin.terminaux.col_actions')].map(h => <th key={h} className={C.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5FF]">
              {terminaux.map(term => (
                <tr key={term.id} className="hover:bg-[#F4F9FF] transition-colors">
                  <td className={C.td + ' font-semibold'}>{term.nom_terminal}</td>
                  <td className={C.td}><span className="font-mono text-xs bg-[#EEF5FF] px-2 py-0.5 rounded">{term.code_terminal}</span></td>
                  <td className={C.td}>{term.port?.nom_port ?? '—'}</td>
                  <td className={C.td}>{term.capacite_max_teu.toLocaleString()} TEU</td>
                  <td className={C.td}>{Number(term.taux_occupation).toFixed(1)}%</td>
                  <td className={C.td}><StatutBadge actif={term.actif} /></td>
                  <td className={C.td}>
                    <div className="flex gap-1">
                      {canEdit && <button onClick={() => openEdit(term)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A]"><Pencil size={13} /></button>}
                      {canEdit && <button onClick={() => setConfirm(term.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020]"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? t('admin.terminaux.modal_create') : t('admin.terminaux.modal_edit')} onClose={() => setModal(null)}>
          <div><label className={C.label}>{t('admin.terminaux.field_port')}</label>
            <select className={C.input} value={form.port_id} onChange={e => setForm(f => ({ ...f, port_id: +e.target.value }))}>
              {(ports as Port[]).map(p => <option key={p.id} value={p.id}>{p.nom_port}</option>)}
            </select>
          </div>
          <div><label className={C.label}>{t('admin.terminaux.field_code')}</label><input className={C.input} value={form.code_terminal} onChange={e => setForm(f => ({ ...f, code_terminal: e.target.value.toUpperCase() }))} /></div>
          <div><label className={C.label}>{t('admin.terminaux.field_name')}</label><input className={C.input} value={form.nom_terminal} onChange={e => setForm(f => ({ ...f, nom_terminal: e.target.value }))} /></div>
          <div><label className={C.label}>{t('admin.terminaux.field_capacity')}</label><input type="number" min={0} className={C.input} value={form.capacite_max_teu} onChange={e => setForm(f => ({ ...f, capacite_max_teu: +e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm text-[#3A5A8A] cursor-pointer"><input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />{t('admin.terminaux.field_actif')}</label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 text-sm border border-[#C5D8F5] rounded-xl text-[#3A5A8A] hover:bg-[#EDF4FF]">{t('common.cancel')}</button>
            <button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex-1 py-2 text-sm font-semibold bg-[#0D2A5E] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50">{t('common.save')}</button>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmModal message={t('common.confirmDelete')} onConfirm={() => del.mutate(confirm!)} onCancel={() => setConfirm(null)} />}
    </>
  );
};

// ── DepotsTab ─────────────────────────────────────────────────────────────────

const DepotsTab = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [modal, setModal] = useState<Depot | null | 'new'>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<DepotForm>({ port_id: 0, terminal_id: null, code_depot: '', nom_depot: '', type_stockage: 'SEC', capacite_totale: 0, actif: true });

  const { data: depots = [], isLoading } = useQuery({ queryKey: ['admin-depots'], queryFn: portsService.getDepots });
  const { data: ports = [] } = useQuery({ queryKey: ['admin-ports'], queryFn: portsService.getPorts });
  const { data: terminaux = [] } = useQuery({ queryKey: ['admin-terminaux'], queryFn: portsService.getTerminaux });

  const filteredTerminaux = (terminaux as Terminal[]).filter(term => term.port_id === form.port_id);

  const save = useMutation({
    mutationFn: (f: DepotForm) => modal === 'new' ? portsService.createDepot(f) : portsService.updateDepot((modal as Depot).id, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-depots'] }); toast('success', t('common.saved')); setModal(null); },
    onError: () => toast('error', t('common.error')),
  });

  const del = useMutation({
    mutationFn: portsService.deleteDepot,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-depots'] }); toast('success', t('common.deleted')); setConfirm(null); },
    onError: () => toast('error', t('common.error')),
  });

  const openEdit = (d: Depot) => { setForm({ port_id: d.port_id, terminal_id: d.terminal_id, code_depot: d.code_depot, nom_depot: d.nom_depot, type_stockage: d.type_stockage, capacite_totale: d.capacite_totale, actif: d.actif }); setModal(d); };
  const openNew  = () => { setForm({ port_id: (ports as Port[])[0]?.id ?? 0, terminal_id: null, code_depot: '', nom_depot: '', type_stockage: 'SEC', capacite_totale: 0, actif: true }); setModal('new'); };

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08]"><Plus size={14} />{t('admin.depots.new')}</button>
      </div>
      <div className="bg-white rounded-xl border border-[#C5D8F5] overflow-hidden">
        {isLoading ? <Skel /> : depots.length === 0 ? (
          <div className="py-12 text-center text-[#88A8D0] text-sm">{t('admin.depots.empty')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {[t('admin.depots.col_code'), t('admin.depots.col_name'), t('admin.depots.col_port'), t('admin.depots.col_terminal'), t('admin.depots.col_type'), t('admin.depots.col_capacity'), t('admin.depots.col_status'), t('admin.depots.col_actions')].map(h => <th key={h} className={C.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF5FF]">
              {depots.map(d => (
                <tr key={d.id} className="hover:bg-[#F4F9FF] transition-colors">
                  <td className={C.td}><span className="font-mono text-xs bg-[#EEF5FF] px-2 py-0.5 rounded">{d.code_depot}</span></td>
                  <td className={C.td + ' font-semibold'}>{d.nom_depot}</td>
                  <td className={C.td}>{d.port?.nom_port ?? '—'}</td>
                  <td className={C.td}>{d.terminal?.nom_terminal ?? <span className="text-[#88A8D0]">—</span>}</td>
                  <td className={C.td}><Badge cls={TYPE_STOCKAGE[d.type_stockage]?.cls ?? ''}>{TYPE_STOCKAGE[d.type_stockage]?.label ?? d.type_stockage}</Badge></td>
                  <td className={C.td}>{d.capacite_totale.toLocaleString()}</td>
                  <td className={C.td}><StatutBadge actif={d.actif} /></td>
                  <td className={C.td}>
                    <div className="flex gap-1">
                      {canEdit && <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-[#EDF4FF] text-[#3A5A8A]"><Pencil size={13} /></button>}
                      {canEdit && <button onClick={() => setConfirm(d.id)} className="p-1.5 rounded-lg hover:bg-[#FFF0F0] text-[#8A2020]"><Trash2 size={13} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal === 'new' ? t('admin.depots.modal_create') : t('admin.depots.modal_edit')} onClose={() => setModal(null)}>
          <div><label className={C.label}>{t('admin.depots.field_port')}</label>
            <select className={C.input} value={form.port_id} onChange={e => setForm(f => ({ ...f, port_id: +e.target.value, terminal_id: null }))}>
              {(ports as Port[]).map(p => <option key={p.id} value={p.id}>{p.nom_port}</option>)}
            </select>
          </div>
          <div><label className={C.label}>{t('admin.depots.field_terminal')}</label>
            <select className={C.input} value={form.terminal_id ?? ''} onChange={e => setForm(f => ({ ...f, terminal_id: e.target.value ? +e.target.value : null }))}>
              <option value="">—</option>
              {filteredTerminaux.map(term => <option key={term.id} value={term.id}>{term.nom_terminal}</option>)}
            </select>
          </div>
          <div><label className={C.label}>{t('admin.depots.field_code')}</label><input className={C.input} value={form.code_depot} onChange={e => setForm(f => ({ ...f, code_depot: e.target.value.toUpperCase() }))} /></div>
          <div><label className={C.label}>{t('admin.depots.field_name')}</label><input className={C.input} value={form.nom_depot} onChange={e => setForm(f => ({ ...f, nom_depot: e.target.value }))} /></div>
          <div><label className={C.label}>{t('admin.depots.field_type')}</label>
            <select className={C.input} value={form.type_stockage} onChange={e => setForm(f => ({ ...f, type_stockage: e.target.value as DepotForm['type_stockage'] }))}>
              {(['SEC','FRIGO','DANGEREUX'] as const).map(v => <option key={v} value={v}>{TYPE_STOCKAGE[v].label}</option>)}
            </select>
          </div>
          <div><label className={C.label}>{t('admin.depots.field_capacity')}</label><input type="number" min={0} className={C.input} value={form.capacite_totale} onChange={e => setForm(f => ({ ...f, capacite_totale: +e.target.value }))} /></div>
          <label className="flex items-center gap-2 text-sm text-[#3A5A8A] cursor-pointer"><input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} />{t('admin.depots.field_actif')}</label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="flex-1 py-2 text-sm border border-[#C5D8F5] rounded-xl text-[#3A5A8A] hover:bg-[#EDF4FF]">{t('common.cancel')}</button>
            <button onClick={() => save.mutate(form)} disabled={save.isPending} className="flex-1 py-2 text-sm font-semibold bg-[#0D2A5E] text-white rounded-xl hover:bg-[#1a3360] disabled:opacity-50">{t('common.save')}</button>
          </div>
        </Modal>
      )}
      {confirm !== null && <ConfirmModal message={t('common.confirmDelete')} onConfirm={() => del.mutate(confirm!)} onCancel={() => setConfirm(null)} />}
    </>
  );
};

// ── AdminPorts (page) ─────────────────────────────────────────────────────────

type Tab = 'ports' | 'terminaux' | 'depots';

const AdminPorts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = (user?.role?.niveau ?? 99) <= 3;
  const [tab, setTab] = useState<Tab>('ports');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ports',     label: t('admin.ports.tab_ports')     },
    { key: 'terminaux', label: t('admin.ports.tab_terminaux') },
    { key: 'depots',    label: t('admin.ports.tab_depots')    },
  ];

  return (
    <div className="p-5 bg-[#F4F9FF] min-h-full">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-[#C8960A] flex items-center justify-center flex-shrink-0">
            <Anchor size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0D2A5E]">{t('admin.ports.title')}</h1>
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
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${tab === tb.key ? 'bg-[#0D2A5E] text-white' : 'bg-white text-[#3A5A8A] border border-[#C5D8F5] hover:bg-[#EDF4FF]'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'ports'     && <PortsTab     canEdit={canEdit} />}
      {tab === 'terminaux' && <TerminauxTab canEdit={canEdit} />}
      {tab === 'depots'    && <DepotsTab    canEdit={canEdit} />}
    </div>
  );
};

export default AdminPorts;
