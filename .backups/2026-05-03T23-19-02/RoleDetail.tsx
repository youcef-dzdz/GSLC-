import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, AlertCircle, Save } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '../../hooks/usePermission';

interface Permission { id: number; name: string; label: string; module: string; description?: string; is_system: boolean; }
interface Role { id: number; nom_role: string; label: string; niveau: number; description?: string; is_system: boolean; permissions: Permission[]; }
type GroupedPermissions = Record<string, Permission[]>;

const NIVEAU_BADGE: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEE2E2', text: '#991B1B' }, 2: { bg: '#FFEDD5', text: '#9A3412' },
  3: { bg: '#FEF9C3', text: '#854D0E' }, 4: { bg: '#DBEAFE', text: '#1E40AF' },
  5: { bg: '#F1F5F9', text: '#475569' },
};
const MODULE_COLORS: Record<string, { bg: string; text: string; border: string; headerBg: string }> = {
  admin:      { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', headerBg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
  commercial: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0', headerBg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)' },
  logistique: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', headerBg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)' },
  finance:    { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE', headerBg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  direction:  { bg: '#FDF2F8', text: '#9D174D', border: '#FBCFE8', headerBg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)' },
};
const MODULE_LABELS_TR: Record<string, Record<'fr'|'en'|'ar', string>> = {
  admin: { fr: 'Administration', en: 'Administration', ar: 'الإدارة' },
  commercial: { fr: 'Commercial', en: 'Commercial', ar: 'التجاري' },
  logistique: { fr: 'Logistique', en: 'Logistics', ar: 'اللوجستيك' },
  finance: { fr: 'Finance', en: 'Finance', ar: 'المالية' },
  direction: { fr: 'Direction', en: 'Direction', ar: 'المديرية' },
};
const TEXTS: Record<string, Record<'fr'|'en'|'ar', string>> = {
  back:        { fr: '← Rôles', en: '← Roles', ar: '← الأدوار' },
  sys_notice:  { fr: 'Rôle système — les permissions ne peuvent pas être modifiées.', en: 'System role — permissions cannot be modified.', ar: 'دور النظام — لا يمكن تعديل الصلاحيات.' },
  assigned_perms: { fr: 'Permissions assignées', en: 'Assigned permissions', ar: 'الصلاحيات المعينة' },
  selected:    { fr: 'sélectionnées', en: 'selected', ar: 'محددة' },
  save_perms:  { fr: 'Enregistrer les permissions', en: 'Save permissions', ar: 'حفظ الصلاحيات' },
  saving:      { fr: 'Enregistrement...', en: 'Saving...', ar: 'جارٍ الحفظ...' },
  system:      { fr: 'Système', en: 'System', ar: 'النظام' },
  custom:      { fr: 'Personnalisé', en: 'Custom', ar: 'مخصص' },
  subtitle_perms_p: { fr: 'permissions', en: 'permissions', ar: 'صلاحيات' },
  msg_sync:    { fr: 'Permissions mises à jour', en: 'Permissions updated', ar: 'تم تحديث الصلاحيات' },
  msg_sync_ok: { fr: 'Les permissions ont été enregistrées.', en: 'Permissions have been saved.', ar: 'تم حفظ الصلاحيات بنجاح.' },
  msg_sync_err: { fr: 'Impossible de synchroniser.', en: 'Failed to synchronize.', ar: 'فشل حفظ الصلاحيات.' },
};

export default function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = usePermission();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.split('-')[0]?.split('_')[0] ?? 'fr') as 'fr'|'en'|'ar';
  const tlx = (key: string) => TEXTS[key]?.[lang] ?? key;
  const isRTL = lang === 'ar';

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: () => adminService.getRoles().then(r => r.data),
  });

  const role = roles.find(r => r.id === Number(id));

  useEffect(() => {
    if (role && !initialized) {
      setCheckedIds(new Set(role.permissions.map(p => p.id)));
      setInitialized(true);
    }
  }, [role, initialized]);

  useEffect(() => {
    if (!isAdmin) navigate('/admin/dashboard');
  }, []);

  useEffect(() => {
    if (!rolesLoading && roles.length > 0 && !role) navigate('/admin/roles');
  }, [rolesLoading, roles, role]);

  const { data: grouped = {}, isLoading: groupedLoading } = useQuery<GroupedPermissions>({
    queryKey: ['admin-permissions-grouped'],
    queryFn: () => adminService.getPermissionsGrouped().then(r => r.data),
  });

  const syncMut = useMutation({
    mutationFn: (ids: number[]) => adminService.syncRolePermissions(Number(id), ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-roles'] });
      toast('success', tlx('msg_sync'), tlx('msg_sync_ok'));
    },
    onError: (error: unknown) => {
      const msg = (error as any)?.response?.data?.message ?? tlx('msg_sync_err');
      toast('error', 'Erreur', msg);
    },
  });

  const togglePerm = (permId: number) => {
    if (role?.is_system) return;
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  if (rolesLoading) return <div className="p-8 text-center text-[#6B7280]">Chargement...</div>;
  if (!role) return null;

  const nv = NIVEAU_BADGE[role.niveau] ?? NIVEAU_BADGE[5];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-5">
        <button
          onClick={() => navigate('/admin/roles')}
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0D1F3C] text-sm font-medium mb-3 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          {tlx('back')}
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#0D1F3C]">{role.nom_role}</h1>
          <span className="font-mono text-xs bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded">{role.label}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: nv.bg, color: nv.text }}>N{role.niveau}</span>
          {role.is_system ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-[#F5F3FF] text-[#6D28D9]">
              <Lock size={10} />{tlx('system')}
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#9CA3AF] bg-[#F1F5F9] px-2 py-0.5 rounded">{tlx('custom')}</span>
          )}
        </div>
        {role.description && <p className="text-[#64748B] text-sm mt-1">{role.description}</p>}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">

        {/* System warning */}
        {role.is_system && (
          <div className="flex items-start gap-2 p-3 bg-[#FFF7ED] rounded-lg border border-[#FED7AA] mb-4">
            <AlertCircle size={14} color="#C2410C" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#9A3412]">{tlx('sys_notice')}</p>
          </div>
        )}

        {/* Counter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#0D1F3C]">{tlx('assigned_perms')}</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
            {checkedIds.size} {tlx('selected')}
          </span>
        </div>

        {/* Permission groups */}
        {groupedLoading ? (
          [0,1,2].map(i => (
            <div key={i} className="space-y-2 mb-6">
              <div className="h-5 bg-[#E2E8F0] rounded w-32 animate-pulse" />
              {[0,1,2,3].map(j => <div key={j} className="h-10 bg-[#F1F5F9] rounded-lg animate-pulse" />)}
            </div>
          ))
        ) : (
          Object.entries(grouped).map(([module, perms]) => {
            const mc = MODULE_COLORS[module] ?? { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', headerBg: '#F8FAFC' };
            return (
              <div key={module} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      style={{ backgroundColor: mc.bg, color: mc.text, borderColor: mc.border }}>
                      {module}
                    </span>
                    <span className="text-sm font-bold text-[#0D1F3C] uppercase tracking-wide">
                      {MODULE_LABELS_TR[module]?.[lang] ?? module}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#475569]">
                    {perms.filter(p => checkedIds.has(p.id)).length}/{perms.length}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  {perms.map(perm => (
                    <label key={perm.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-100 ${
                        role.is_system
                          ? 'opacity-60 cursor-not-allowed bg-[#F8FAFC] border-transparent'
                          : checkedIds.has(perm.id)
                          ? 'bg-[#EFF6FF] border-[#BFDBFE] cursor-pointer'
                          : 'bg-white border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0] cursor-pointer'
                      }`}
                    >
                      <input type="checkbox"
                        checked={checkedIds.has(perm.id)}
                        onChange={() => togglePerm(perm.id)}
                        disabled={role.is_system}
                        className="w-3.5 h-3.5 rounded accent-[#0D1F3C] flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#0D1F3C] truncate">{perm.label}</p>
                        <p className="text-[10px] font-mono text-[#9CA3AF] truncate">{perm.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Sticky save button ── */}
      {!role.is_system && (
        <div className="bg-white border-t border-[#E2E8F0] px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => syncMut.mutate(Array.from(checkedIds))}
              disabled={syncMut.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#C9A84C' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b8923e')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C9A84C')}
            >
              <Save size={15} />
              {syncMut.isPending ? tlx('saving') : tlx('save_perms')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
