import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Modal } from './ports/PortShared';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PenaliteForm {
  type: 'DEMURRAGE' | 'DETENTION';
  type_conteneur_id: number;
  devise_id: number;
  tarif_journalier: number;
  tranche_debut: number;
  tranche_fin?: number | null;
  date_debut_validite: string;
  date_fin_validite?: string | null;
  actif?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PenaliteForm) => void;
  initialData?: PenaliteForm & { id?: number };
  isSubmitting: boolean;
  errors: Record<string, string[]> | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

const safeArr = (res: any, key: string): any[] => {
  const d = res?.data ?? res;
  return Array.isArray(d?.[key]) ? d[key] : Array.isArray(d) ? d : [];
};

const EMPTY: PenaliteForm = {
  type: 'DEMURRAGE',
  type_conteneur_id: 0,
  devise_id: 0,
  tarif_journalier: 0,
  tranche_debut: 1,
  tranche_fin: null,
  date_debut_validite: today(),
  date_fin_validite: null,
  actif: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

const PenaliteSurestarieModal: React.FC<Props> = ({
  isOpen, onClose, onSubmit, initialData, isSubmitting, errors,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<PenaliteForm>(EMPTY);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialData
      ? {
          ...initialData,
          date_debut_validite: initialData.date_debut_validite?.slice(0, 10) ?? today(),
          date_fin_validite:   initialData.date_fin_validite?.slice(0, 10)   ?? null,
        }
      : { ...EMPTY, date_debut_validite: today() }
    );
  }, [initialData, isOpen]);

  const { data: tcRaw } = useQuery({
    queryKey: ['typeConteneursList'],
    queryFn: () => adminService.getTypeConteneurs(),
    staleTime: Infinity,
  });
  const { data: devRaw } = useQuery({
    queryKey: ['devisesList'],
    queryFn: () => adminService.getDevises(),
    staleTime: Infinity,
  });

  const typeConteneurs: any[] = safeArr(tcRaw,  'types');
  const devises:        any[] = safeArr(devRaw, 'devises');

  const set = <K extends keyof PenaliteForm>(k: K, v: PenaliteForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      type_conteneur_id: Number(form.type_conteneur_id),
      devise_id:         Number(form.devise_id),
      tarif_journalier:  Number(form.tarif_journalier),
      tranche_debut:     Number(form.tranche_debut),
      tranche_fin:       form.tranche_fin ? Number(form.tranche_fin) : null,
      date_fin_validite: form.date_fin_validite || null,
    });
  };

  if (!isOpen) return null;

  // ── Shared class helpers ──────────────────────────────────────────────────

  const lbl = 'block text-xs font-semibold text-[#3A5A8A] mb-1';
  const inp = 'w-full border border-[#C5D8F5] rounded-xl px-3 py-2 text-sm text-[#0D2A5E] bg-white focus:outline-none focus:ring-2 focus:ring-[#C8960A] focus:border-transparent';
  const sel = `${inp} appearance-none`;
  const fieldErr = (k: string) => errors?.[k]?.[0]
    ? <p className="text-[11px] text-[#8A2020] mt-1">{errors[k][0]}</p>
    : null;

  const title = initialData?.id
    ? t('admin.penalites.modal_edit_title')
    : t('admin.penalites.modal_create_title');

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">

          {/* Type pénalité */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_type')} *</label>
            <select
              value={form.type}
              onChange={e => set('type', e.target.value as PenaliteForm['type'])}
              disabled={isSubmitting}
              className={sel}
            >
              <option value="DEMURRAGE">{t('admin.penalites.type_demurrage')}</option>
              <option value="DETENTION">{t('admin.penalites.type_detention')}</option>
            </select>
            {fieldErr('type')}
          </div>

          {/* Type conteneur */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_type_conteneur')} *</label>
            <select
              value={form.type_conteneur_id}
              onChange={e => set('type_conteneur_id', Number(e.target.value))}
              disabled={isSubmitting}
              className={sel}
            >
              <option value={0} disabled>— Sélectionner —</option>
              {typeConteneurs.map((tc: any) => (
                <option key={tc.id} value={tc.id}>{tc.libelle} ({tc.code_type})</option>
              ))}
            </select>
            {fieldErr('type_conteneur_id')}
          </div>

          {/* Devise */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_devise')} *</label>
            <select
              value={form.devise_id}
              onChange={e => set('devise_id', Number(e.target.value))}
              disabled={isSubmitting}
              className={sel}
            >
              <option value={0} disabled>— Sélectionner —</option>
              {devises.map((d: any) => (
                <option key={d.id} value={d.id}>{d.code} — {d.nom}</option>
              ))}
            </select>
            {fieldErr('devise_id')}
          </div>

          {/* Tarif journalier */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_tarif_journalier')} *</label>
            <input
              type="number" min="0" step="0.01"
              value={form.tarif_journalier}
              onChange={e => set('tarif_journalier', Number(e.target.value))}
              disabled={isSubmitting}
              className={inp}
            />
            {fieldErr('tarif_journalier')}
          </div>

          {/* Tranche début */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_tranche_debut')} *</label>
            <input
              type="number" min="1" step="1"
              value={form.tranche_debut}
              onChange={e => set('tranche_debut', Number(e.target.value))}
              disabled={isSubmitting}
              className={inp}
            />
            {fieldErr('tranche_debut')}
          </div>

          {/* Tranche fin */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_tranche_fin')}</label>
            <input
              type="number" min="1" step="1" placeholder="—"
              value={form.tranche_fin ?? ''}
              onChange={e => set('tranche_fin', e.target.value ? Number(e.target.value) : null)}
              disabled={isSubmitting}
              className={inp}
            />
            {fieldErr('tranche_fin')}
          </div>

          {/* Date début validité */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_date_debut_validite')} *</label>
            <input
              type="date"
              value={form.date_debut_validite}
              onChange={e => set('date_debut_validite', e.target.value)}
              disabled={isSubmitting}
              className={inp}
            />
            {fieldErr('date_debut_validite')}
          </div>

          {/* Date fin validité */}
          <div>
            <label className={lbl}>{t('admin.penalites.field_date_fin_validite')}</label>
            <input
              type="date"
              value={form.date_fin_validite ?? ''}
              onChange={e => set('date_fin_validite', e.target.value || null)}
              disabled={isSubmitting}
              className={inp}
            />
            {fieldErr('date_fin_validite')}
          </div>

        </div>

        {/* Actif */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.actif ?? true}
            onChange={e => set('actif', e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-[#C5D8F5] accent-[#C8960A]"
          />
          <span className="text-sm text-[#3A5A8A] font-medium">{t('admin.penalites.field_actif')}</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2 border-t border-[#EEF5FF]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium border border-[#C5D8F5] rounded-xl hover:bg-[#EDF4FF] transition text-[#3A5A8A]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#C8960A] text-white rounded-xl hover:bg-[#A87A08] transition disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isSubmitting ? (t('common.saving') ?? 'Sauvegarde...') : (t('common.save') ?? 'Enregistrer')}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default PenaliteSurestarieModal;
