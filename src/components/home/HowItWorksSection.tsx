import React from 'react';
import { motion } from 'motion/react';
import { UserPlus, Settings, CalendarCheck } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: '01',
    title: 'Crie sua conta',
    description: 'Cadastre-se gratuitamente e configure o perfil da sua estética em menos de 5 minutos.',
    color: '#3b82f6',
    glow: 'rgba(37,99,235,0.25)',
  },
  {
    icon: Settings,
    number: '02',
    title: 'Configure seus serviços',
    description: 'Adicione seus serviços, preços, horários de funcionamento e personalize sua página.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
  },
  {
    icon: CalendarCheck,
    number: '03',
    title: 'Receba agendamentos',
    description: 'Compartilhe o link da sua página e comece a receber agendamentos automaticamente.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.25)',
  },
];

export const HowItWorksSection = () => (
  <section id="como-funciona" className="py-28" style={{ background: '#060b18' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16">
        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 block">Como funciona</span>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Do cadastro ao primeiro<br />agendamento em minutos
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Sem complexidade, sem necessidade de técnico. Você configura tudo e já pode compartilhar sua página.
        </p>
      </motion.div>

      <div className="relative grid md:grid-cols-3 gap-6">
        {/* Connector */}
        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="relative flex flex-col p-7 rounded-3xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>

            {/* Number badge */}
            <div
              className="absolute -top-3 -right-3 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
              style={{ background: step.color, color: 'white', boxShadow: `0 0 20px ${step.glow}` }}>
              {step.number}
            </div>

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: `${step.color}15`, boxShadow: `0 0 30px ${step.glow}` }}>
              <step.icon className="w-7 h-7" style={{ color: step.color }} />
            </div>

            <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
