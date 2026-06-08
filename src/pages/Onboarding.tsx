import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, CheckCircle2, ChevronRight, Loader2, MapPin,
  Phone, Sparkles, Globe, Tag, X, ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { createCompany, checkSlugAvailable } from '../services/companyService';

interface Props {
  user: User;
  onCompanyCreated?: () => void;
}

const CATEGORIES = [
  'Estética automotiva',
  'Lava-rápido',
  'Detailer',
  'Higienização',
  'Polimento',
  'Outro',
];

const SERVICE_TYPES = [
  { value: 'delivery',  label: 'Delivery',          desc: 'Você vai até o cliente' },
  { value: 'local',     label: 'Local fixo',         desc: 'Cliente vem até você' },
  { value: 'both',      label: 'Ambos',              desc: 'Delivery e local fixo' },
] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const inputCls = 'w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all placeholder-slate-500 focus:border-blue-500';
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };

export const Onboarding = ({ user, onCompanyCreated }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createdSlug, setCreatedSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Estética automotiva',
    description: '',
    whatsapp: '',
    phone: '',
    email: user.email ?? '',
    service_type: 'delivery' as 'delivery' | 'local' | 'both',
    address: '',
    city: '',
    state: '',
  });

  // Auto-generate slug from name
  useEffect(() => {
    const generated = slugify(form.name);
    setForm((p) => ({ ...p, slug: generated }));
    setSlugAvailable(null);
  }, [form.name]);

  // Check slug availability with debounce
  useEffect(() => {
    if (!form.slug || form.slug.length < 3) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    const t = setTimeout(async () => {
      const available = await checkSlugAvailable(form.slug);
      setSlugAvailable(available);
      setSlugChecking(false);
    }, 600);
    return () => clearTimeout(t);
  }, [form.slug]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const canGoStep2 = form.name.trim().length >= 2 && form.slug.length >= 3 && slugAvailable === true;
  const canGoStep3 = !!form.whatsapp.trim();
  const canSubmit  = !!form.city.trim();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCompany({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        service_type: form.service_type,
        is_delivery: form.service_type !== 'local',
        address: form.address.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim() || undefined,
        category: form.category,
      }, user.id);
      setCreatedSlug(form.slug.trim());
      onCompanyCreated?.();
      setStep(4);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar estética.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#060b18' }}>

      {/* Exit button — only visible during setup steps */}
      {step < 4 && (
        <Link
          to="/"
          className="fixed top-4 right-4 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
          <X className="w-4 h-4" /> Sair
        </Link>
      )}

      <div className="w-full max-w-xl">

        {/* Header */}
        {step < 4 && (
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 32px rgba(37,99,235,0.35)' }}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Configure sua estética</h1>
            <p className="text-slate-400 mt-2 text-sm">Isso leva menos de 2 minutos.</p>
          </div>
        )}

        {/* Step indicators */}
        {step < 4 && <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all"
                style={{
                  background: step >= s ? '#2563eb' : 'rgba(255,255,255,0.06)',
                  color: step >= s ? 'white' : '#475569',
                  border: step === s ? '2px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-8 h-px" style={{ background: step > s ? '#2563eb' : 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Identidade ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black text-white">Identidade da estética</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome da estética *</label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Ex: Premium Car Detail"
                    className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Slug da página pública *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
                      /empresa/
                    </span>
                    <input
                      type="text" value={form.slug}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, slug: slugify(e.target.value) }));
                        setSlugAvailable(null);
                      }}
                      placeholder="premium-car-detail"
                      className={`${inputCls} pl-24`}
                      style={{ ...inputStyle, borderColor: slugAvailable === false ? 'rgba(239,68,68,0.5)' : slugAvailable === true ? 'rgba(16,185,129,0.5)' : undefined }}
                    />
                    {slugChecking && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                    )}
                    {!slugChecking && slugAvailable === true && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {slugAvailable === false && (
                    <p className="text-xs text-red-400 mt-1">Este slug já está em uso. Escolha outro.</p>
                  )}
                  {slugAvailable === true && (
                    <p className="text-xs text-green-400 mt-1">Disponível!</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select value={form.category} onChange={set('category')} className={`${inputCls} pl-11`} style={inputStyle}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição curta</label>
                  <textarea rows={3} value={form.description} onChange={set('description')}
                    placeholder="Descreva sua estética em poucas palavras..."
                    className={`${inputCls} resize-none`} style={inputStyle} />
                </div>
              </div>

              <button
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
                className="w-full mt-6 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                style={{ background: '#2563eb' }}>
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Contato ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-6">
                <Phone className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black text-white">Contato e atendimento</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp comercial *</label>
                  <input type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                    placeholder="(11) 99999-9999"
                    className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Telefone fixo</label>
                  <input type="tel" value={form.phone} onChange={set('phone')}
                    placeholder="(11) 3333-3333"
                    className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">E-mail comercial</label>
                  <input type="email" value={form.email} onChange={set('email')}
                    placeholder="contato@suaestetica.com.br"
                    className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de atendimento *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {SERVICE_TYPES.map(({ value, label, desc }) => (
                      <button
                        key={value} type="button"
                        onClick={() => setForm((p) => ({ ...p, service_type: value }))}
                        className="p-3 rounded-xl text-left transition-all"
                        style={{
                          background: form.service_type === value ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${form.service_type === value ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                        <p className="text-xs font-black text-white">{label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl font-bold text-slate-400 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Voltar
                </button>
                <button disabled={!canGoStep3} onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                  style={{ background: '#2563eb' }}>
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Localização ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-black text-white">Localização</h2>
              </div>

              <div className="space-y-4">
                {form.service_type !== 'delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Endereço</label>
                    <input type="text" value={form.address} onChange={set('address')}
                      placeholder="Rua, número, bairro"
                      className={inputCls} style={inputStyle} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cidade *</label>
                    <input type="text" value={form.city} onChange={set('city')}
                      placeholder="São Paulo"
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Estado (UF)</label>
                    <input type="text" value={form.state} onChange={set('state')}
                      placeholder="SP" maxLength={2}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Sua página pública</p>
                  </div>
                  <p className="text-white font-bold text-sm">autoclean.app/empresa/{form.slug}</p>
                  <p className="text-slate-400 text-xs mt-1">{form.name || 'Nome da estética'} · {form.city || 'Cidade'}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl font-bold text-slate-400 transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Voltar
                </button>
                <button disabled={!canSubmit || loading} onClick={handleSubmit}
                  className="flex-1 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(37,99,235,0.3)' }}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Criar minha estética
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
          {/* ── STEP 4: Sucesso ── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              className="p-10 rounded-3xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-3xl font-black text-white mb-2">Estética criada!</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
                <span className="text-white font-bold">{form.name}</span> está no ar. Acesse seu painel para configurar horários, serviços e receber agendamentos.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(37,99,235,0.35)' }}>
                  Ir para o painel <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`/empresa/${createdSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 rounded-xl font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Globe className="w-4 h-4" /> Ver minha página pública
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
