import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, Info, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { usePermission } from '../../hooks/usePermission';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Permission {
  id: number;
  name: string;
  label: string;
  module: string;
  description?: string;
  is_system: boolean;
}

type GroupedPermissions = Record<string, Permission[]>;

// ── Constants ─────────────────────────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; bg: string; text: string; border: string; headerBg: string }> = {
  admin:      { label: 'Administration', bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', headerBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' },
  commercial: { label: 'Commercial',     bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', headerBg: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' },
  logistique: { label: 'Logistique',     bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', headerBg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' },
  finance:    { label: 'Finance',        bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', headerBg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' },
  direction:  { label: 'Direction',      bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8', headerBg: 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)' },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 overflow-hidden">
    <div className="h-14 bg-[#E2E8F0] animate-pulse" />
    <div className="p-4 space-y-3">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-32" />
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-48" />
          <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-24" />
        </div>
      ))}
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────

const AdminPermissions: React.FC = () => {
  const { isAdmin } = usePermission();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  }, []);
  const [activeModule, setActiveModule] = useState<string>('all');
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editPerm, setEditPerm] = useState<Permission | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', label: '', module: 'admin', description: ''
  });
  const [editForm, setEditForm] = useState({
    label: '', module: 'admin', description: ''
  });

  const { data: grouped = {}, isLoading } = useQuery<GroupedPermissions>({
    queryKey: ['admin-permissions-grouped'],
    queryFn:  () => adminService.getPermissionsGrouped().then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: () => adminService.createPermission(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      qc.invalidateQueries({ queryKey: ['admin-permissions-grouped'] });
      setShowCreate(false);
      setForm({ name: '', label: '', module: 'admin', description: '' });
    },
  });

  const updateMut = useMutation({
    mutationFn: () => adminService.updatePermission(
      editPerm!.id, editForm
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      qc.invalidateQueries({ queryKey: ['admin-permissions-grouped'] });
      setEditPerm(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => adminService.deletePermission(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-permissions'] });
      qc.invalidateQueries({ queryKey: ['admin-permissions-grouped'] });
      setDeleteConfirm(null);
    },
  });

  const modules = Object.keys(grouped).sort();
  const totalCount = Object.values(grouped).reduce((acc, arr) => acc + arr.length, 0);
  const visibleModules = activeModule === 'all' ? modules : modules.filter(m => m === activeModule);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
              <Lock size={20} color="#0D1F3C" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0D1F3C]">Permissions système</h1>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {isLoading ? '...' : `${totalCount} permissions · ${modules.length} module${modules.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: '#4366BB', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Plus size={15} />
            Nouvelle permission
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
          <Info size={15} color="#3B82F6" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E40AF]">
            Les permissions sont en lecture seule. Pour modifier les accès d'un rôle, rendez-vous dans{' '}
            <button
              onClick={() => navigate('/admin/roles')}
              className="font-semibold underline cursor-pointer hover:text-[#0D1F3C] transition-colors"
            >
              Rôles & Permissions
            </button>.
          </p>
        </div>
      </div>

      {/* ── Module tabs ── */}
      {!isLoading && modules.length > 0 && (
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveModule('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeModule === 'all'
                  ? 'bg-[#0D1F3C] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F8FAFC]'
              }`}
            >
              Tous ({totalCount})
            </button>
            {modules.map(m => {
              const meta = MODULE_META[m];
              const count = grouped[m]?.length ?? 0;
              return (
                <button
                  key={m}
                  onClick={() => setActiveModule(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeModule === m
                      ? 'text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#6B7280] hover:bg-[#F8FAFC]'
                  }`}
                  style={activeModule === m
                    ? { backgroundColor: meta?.text ?? '#0D1F3C' }
                    : {}
                  }
                >
                  {meta?.label ?? m} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : visibleModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#9CA3AF]">
            <Lock size={40} className="mb-3 opacity-30" />
            <p className="font-medium">Aucune permission trouvée</p>
          </div>
        ) : (
          visibleModules.map(module => {
            const perms = grouped[module] ?? [];
            const meta  = MODULE_META[module];
            return (
              <div key={module} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 overflow-hidden">

                {/* Card header */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ background: meta?.headerBg ?? '#F8FAFC' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                      style={{ backgroundColor: meta?.bg ?? '#F8FAFC', color: meta?.text ?? '#475569', borderColor: meta?.border ?? '#E2E8F0' }}
                    >
                      {module}
                    </span>
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: meta?.text ?? '#475569' }}>
                      {meta?.label ?? module}
                    </span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: meta?.border ?? '#E2E8F0', color: meta?.text ?? '#475569' }}
                  >
                    {perms.length} permission{perms.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Permissions table */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[40%]">
                        Identifiant
                      </th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider w-[35%]">
                        Libellé
                      </th>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell w-[25%]">
                        Description
                      </th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {perms.map((perm, idx) => (
                      <tr
                        key={perm.id}
                        className={`border-b border-[#F1F5F9] last:border-0 transition-colors hover:bg-[#EFF6FF] ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">
                            {perm.name}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-medium text-[#0D1F3C] text-sm">{perm.label}</span>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-sm text-[#9CA3AF] italic">
                            {perm.description ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {!perm.is_system && (
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                              {deleteConfirm === perm.id ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Êtes-vous sûr ?</span>
                                  <button onClick={() => deleteMut.mutate(perm.id)} style={{ padding: '4px 8px', background: '#EF4444', color: '#fff', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Oui</button>
                                  <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 8px', background: '#F1F5F9', color: '#64748B', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Non</button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditForm({
                                        label: perm.label,
                                        module: perm.module,
                                        description: perm.description ?? '',
                                      });
                                      setEditPerm(perm);
                                    }}
                                    style={{ background: 'none', border: 'none',
                                             cursor: 'pointer', color: '#4366BB',
                                             padding: 4 }}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(perm.id)}
                                    style={{ background: 'none', border: 'none',
                                             cursor: 'pointer', color: '#EF4444',
                                             padding: 4 }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

  {/* Modals */}
  {showCreate && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Nouvelle permission</h3>
          <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Identifiant (ex: contracts.approve)</label>
        <input value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}/>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Libellé affiché</label>
        <input value={form.label} onChange={e => setForm(prev => ({...prev, label: e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}/>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Module</label>
        <select value={form.module} onChange={e => setForm(prev => ({...prev, module: e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}>
          <option value="admin">Administration</option>
          <option value="commercial">Commercial</option>
          <option value="logistique">Logistique</option>
          <option value="finance">Finance</option>
          <option value="direction">Direction</option>
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description (optionnel)</label>
        <textarea value={form.description} onChange={e => setForm(prev => ({...prev, description: e.target.value}))} rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 24, boxSizing: 'border-box', resize: 'vertical' }}/>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowCreate(false)} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151' }}>Annuler</button>
          <button onClick={() => createMut.mutate()} disabled={createMut.isPending || !form.name.trim() || !form.label.trim()} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#4366BB', color: '#fff', opacity: createMut.isPending ? 0.7 : 1 }}>{createMut.isPending ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  )}

  {editPerm && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Modifier la permission</h3>
          <button onClick={() => setEditPerm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
        </div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Identifiant (Lecture seule)</label>
        <input value={editPerm.name} disabled style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box', backgroundColor: '#F1F5F9', color: '#9CA3AF' }}/>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Libellé affiché</label>
        <input value={editForm.label} onChange={e => setEditForm(prev => ({...prev, label: e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}/>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Module</label>
        <select value={editForm.module} onChange={e => setEditForm(prev => ({...prev, module: e.target.value}))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}>
          <option value="admin">Administration</option>
          <option value="commercial">Commercial</option>
          <option value="logistique">Logistique</option>
          <option value="finance">Finance</option>
          <option value="direction">Direction</option>
        </select>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Description (optionnel)</label>
        <textarea value={editForm.description} onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))} rows={3} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, marginBottom: 24, boxSizing: 'border-box', resize: 'vertical' }}/>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setEditPerm(null)} style={{ padding: '9px 20px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151' }}>Annuler</button>
          <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending || !editForm.label.trim()} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: '#4366BB', color: '#fff', opacity: updateMut.isPending ? 0.7 : 1 }}>{updateMut.isPending ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  )}

    </div>
  );
};

export default AdminPermissions;
