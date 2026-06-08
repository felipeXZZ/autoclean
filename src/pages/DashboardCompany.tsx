import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { Edit3, Check, X, Copy, ExternalLink, Loader2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import { updateCompany } from '../services/companyService';
import type { Company } from '../types';

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-slate-500 focus:border-blue-500';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

const SERVICE_TYPES = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'local',    label: 'Local fixo' },
  { value: 'both',     label: 'Ambos' },
] as const;

const FIELDS = [
  { key: 'name',                 label: 'Nome da empresa',           type: 'text'     },
  { key: 'description',          label: 'Descrição',                  type: 'textarea' },
  { key: 'whatsapp',             label: 'WhatsApp',                  type: 'tel'      },
  { key: 'phone',                label: 'Telefone',                  type: 'tel'      },
  { key: 'email',                label: 'E-mail',                    type: 'email'    },
  { key: 'address',              label: 'Endereço',                  type: 'text'     },
  { key: 'city',                 label: 'Cidade',                    type: 'text'     },
  { key: 'state',                label: 'Estado (UF)',               type: 'text'     },
  { key: 'website',              label: 'Site',                      type: 'url'      },
  { key: 'delivery_description', label: 'Descrição do atendimento',  type: 'textarea' },
] as const;

export const DashboardCompany = () => {
  const { company, refreshCompany } = useOutletContext<DashboardContext>();
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState<Partial<Company>>({});

  useEffect(() => {
    setForm(company ?? {});
  }, [company]);

  const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

  async function save() {
    setSaving(true);
    try {
      await updateCompany(company.id, form);
      await refreshCompany();
      setEditing(false);
      toast.success('Perfil atualizado.');
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setSaving(false);
    }
  }

  const publicLink = `${window.location.origin}/empresa/${company.slug}`;

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
          <h1 className="text-2xl font-black text-white">Minha estética</h1>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Edit3 className="w-4 h-4" /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setForm(company); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-slate-400 text-sm"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-50"
              style={{ background: '#2563eb' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Salvar
            </button>
          </div>
        )}
      </div>

      {/* Public link card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 rounded-2xl mb-6"
        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
        <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Link público da empresa</p>
          <p className="text-white font-bold text-sm truncate">{publicLink}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => { navigator.clipboard.writeText(publicLink); toast.success('Link copiado!'); }}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all">
            <Copy className="w-3.5 h-3.5" /> Copiar
          </button>
          <Link to={`/empresa/${company.slug}`} target="_blank"
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Visitar
          </Link>
        </div>
      </motion.div>

      {/* Plan badge */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest"
          style={{
            background: company.plan === 'free' ? 'rgba(100,116,139,0.15)' : company.plan === 'starter' ? 'rgba(37,99,235,0.15)' : 'rgba(124,58,237,0.15)',
            color: company.plan === 'free' ? '#94a3b8' : company.plan === 'starter' ? '#60a5fa' : '#a78bfa',
          }}>
          {company.plan === 'free' ? 'Plano Gratuito' : company.plan === 'starter' ? 'Plano Starter' : 'Plano Pro'}
        </span>
        <span className="text-xs text-slate-500">
          {company.is_active ? '● Empresa ativa' : '○ Empresa inativa'}
        </span>
      </div>

      {/* Form */}
      <div className="p-6 rounded-2xl space-y-5" style={cardStyle}>
        {FIELDS.map(({ key, label, type }) => (
          <div key={key}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            {editing ? (
              type === 'textarea' ? (
                <textarea
                  rows={2}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                />
              ) : (
                <input
                  type={type}
                  value={(form as Record<string, string>)[key] ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className={inputCls}
                  style={inputStyle}
                />
              )
            ) : (
              <p className="text-white font-medium text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(company as any)[key] ? String((company as any)[key]) : <span className="text-slate-600">—</span>}
              </p>
            )}
          </div>
        ))}

        {/* Service type */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de atendimento</label>
          {editing ? (
            <div className="flex gap-2">
              {SERVICE_TYPES.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((p) => ({ ...p, service_type: value, is_delivery: value !== 'local' }))}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: form.service_type === value ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${form.service_type === value ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: form.service_type === value ? '#60a5fa' : '#64748b',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white font-medium text-sm">
              {SERVICE_TYPES.find((t) => t.value === company.service_type)?.label ?? (company.is_delivery ? 'Delivery' : 'Local fixo')}
            </p>
          )}
        </div>

        {/* Status toggle (only in edit mode) */}
        {editing && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className={`flex-shrink-0 w-11 h-6 rounded-full transition-all relative ${form.is_active ? 'bg-green-500' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
            </button>
            <span className="text-sm font-bold text-white">
              Empresa {form.is_active ? 'ativa' : 'inativa'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
