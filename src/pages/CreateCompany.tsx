import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createCompany } from '../services/companyService';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User;
  onCompanyCreated: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const CreateCompany = ({ user, onCompanyCreated }: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    whatsapp: '',
    email: '',
    city: '',
    state: '',
    is_delivery: true,
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && typeof value === 'string') {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setLoading(true);
    try {
      await createCompany(
        {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          phone: form.phone.trim() || undefined,
          whatsapp: form.whatsapp.trim() || undefined,
          email: form.email.trim() || undefined,
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          is_delivery: form.is_delivery,
        },
        user.id
      );
      toast.success('Empresa criada com sucesso!');
      onCompanyCreated();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar empresa.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm';
  const labelClass = 'block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: 'linear-gradient(160deg, #060b18 0%, #091428 60%, #060b18 100%)' }}>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}>
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Criar sua estética</h1>
          <p className="text-slate-400">Preencha os dados da sua empresa para começar a receber agendamentos.</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div>
            <label className={labelClass}>Nome da empresa *</label>
            <input
              required
              type="text"
              placeholder="Ex: AutoShine Detailing"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Link público
              <span className="ml-1 text-slate-500 font-normal normal-case">
                — autoclean.com/empresa/<strong className="text-blue-400">{form.slug || 'minha-estetica'}</strong>
              </span>
            </label>
            <input
              required
              type="text"
              placeholder="minha-estetica"
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              rows={2}
              placeholder="Fale um pouco sobre sua estética..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                type="tel"
                placeholder="(11) 3333-3333"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              placeholder="contato@suaestetica.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cidade</label>
              <input
                type="text"
                placeholder="São Paulo"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input
                type="text"
                placeholder="SP"
                maxLength={2}
                value={form.state}
                onChange={(e) => set('state', e.target.value.toUpperCase())}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Tipo de atendimento</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: true, label: 'Delivery', sub: 'Vou até o cliente' },
                { val: false, label: 'Loja física', sub: 'Cliente vem até mim' },
              ].map(({ val, label, sub }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => set('is_delivery', val)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: form.is_delivery === val ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${form.is_delivery === val ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-slate-500 text-xs">{sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-slate-400 text-xs">
              Após criar sua empresa, você poderá editar todos os dados, cadastrar serviços e configurar seus horários no painel de controle.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.35)' }}>
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Criando empresa...</>
            ) : (
              <><CheckCircle className="w-5 h-5" /> Criar minha empresa</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
