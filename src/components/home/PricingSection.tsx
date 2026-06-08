import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para começar e testar a plataforma.',
    color: '#64748b',
    features: [
      'Página pública da empresa',
      'Até 30 agendamentos/mês',
      'Gestão de serviços e horários',
      'Painel de controle básico',
      'Link para WhatsApp',
    ],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Starter',
    price: 'R$ 59',
    period: '/mês',
    description: 'Para estéticas que querem crescer com profissionalismo.',
    color: '#3b82f6',
    features: [
      'Agendamentos ilimitados',
      'Página personalizada com logo',
      'Avaliações de clientes',
      'Relatórios de faturamento',
      'Suporte por WhatsApp',
      'Bloqueio de horários e datas',
    ],
    cta: 'Assinar Starter',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'R$ 119',
    period: '/mês',
    description: 'Para quem quer o máximo em automação e visibilidade.',
    color: '#8b5cf6',
    features: [
      'Tudo do Starter',
      'Múltiplos profissionais',
      'Notificações automáticas',
      'Integração avançada',
      'Destaque na plataforma',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    highlight: false,
  },
];

export const PricingSection = () => (
  <section id="planos" className="py-28" style={{ background: '#050916' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16">
        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 block">Planos</span>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Comece grátis, escale quando precisar
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Sem contrato, sem fidelidade. Cancele quando quiser.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="relative flex flex-col p-8 rounded-3xl"
            style={{
              background: plan.highlight ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.025)',
              border: plan.highlight ? '2px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.07)',
              boxShadow: plan.highlight ? '0 0 60px rgba(37,99,235,0.12)' : 'none',
            }}>

            {plan.highlight && (
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black"
                style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}>
                <Zap className="w-3 h-3 text-white" /> Mais popular
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{plan.name}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-500 font-medium mb-1">{plan.period}</span>
              </div>
              <p className="text-slate-500 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/login"
              className="w-full py-4 rounded-2xl font-black text-base text-center transition-all block"
              style={plan.highlight
                ? { background: '#2563eb', color: 'white', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
