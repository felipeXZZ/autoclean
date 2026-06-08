import React from 'react';
import { motion } from 'motion/react';
import { Calendar, BarChart3, MessageCircle, Globe, Bell, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Página pública da empresa',
    description: 'Cada estética recebe um link único com serviços, preços, avaliações e botão de agendamento.',
    color: '#3b82f6',
  },
  {
    icon: Calendar,
    title: 'Agendamentos online 24h',
    description: 'Clientes agendam pelo celular a qualquer hora. Sem ligações, sem WhatsApp para combinar horário.',
    color: '#8b5cf6',
  },
  {
    icon: BarChart3,
    title: 'Painel de gestão completo',
    description: 'Gerencie agendamentos, serviços, horários e veja métricas de faturamento em tempo real.',
    color: '#10b981',
  },
  {
    icon: MessageCircle,
    title: 'Integração com WhatsApp',
    description: 'Entre em contato direto com o cliente com um clique. Link automático para confirmação.',
    color: '#f59e0b',
  },
  {
    icon: Bell,
    title: 'Controle de status',
    description: 'Marque agendamentos como confirmado, concluído, cancelado ou no_show de forma simples.',
    color: '#ef4444',
  },
  {
    icon: ShieldCheck,
    title: 'Dados isolados por empresa',
    description: 'Cada estética vê apenas seus próprios dados. Segurança e privacidade garantidas.',
    color: '#06b6d4',
  },
];

export const ServicesSection = () => (
  <section id="recursos" className="py-28" style={{ background: '#050916' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16">
        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 block">Recursos</span>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Tudo que sua estética precisa<br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            em uma só plataforma
          </span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Sem planilha, sem caderninho, sem WhatsApp para agendar. Profissional e automatizado.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -4 }}
            className="flex flex-col p-7 rounded-3xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
              style={{ background: `${f.color}15` }}>
              <f.icon className="w-6 h-6" style={{ color: f.color }} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
