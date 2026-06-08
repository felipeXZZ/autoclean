import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  'Painel com todos os agendamentos do dia',
  'Gerencie serviços e preços em tempo real',
  'Controle de horários e bloqueios',
  'Histórico de clientes e veículos',
  'Métricas de faturamento e atendimentos',
  'Link direto para WhatsApp do cliente',
];

export const DashboardPreview = () => (
  <section className="py-28" style={{ background: '#050916' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}>
          <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 block">Painel de gestão</span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
            Controle total da sua<br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
              estética em um só lugar
            </span>
          </h2>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Seu painel personalizado reúne tudo que você precisa para gerenciar sua empresa. Sem depender de planilha ou WhatsApp.
          </p>
          <ul className="space-y-3 mb-10">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-2xl font-black transition-all"
            style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
            Acessar meu painel
          </Link>
        </motion.div>

        {/* Right: mockup */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative">
          <div style={{
            position: 'absolute', inset: '-20px',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 65%)',
            filter: 'blur(24px)',
          }} />
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#08111f', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
            {/* Titlebar */}
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-medium">Dashboard — AutoShine Detailing</span>
            </div>

            {/* Cards grid */}
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Agendamentos hoje', value: '9', color: '#60a5fa' },
                { label: 'Receita do mês', value: 'R$ 4.280', color: '#34d399' },
                { label: 'Pendentes', value: '4', color: '#fbbf24' },
                { label: 'Clientes atendidos', value: '127', color: '#a78bfa' },
                { label: 'Serviços ativos', value: '8', color: '#fb7185' },
                { label: 'WhatsApp', value: 'Integrado', color: '#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Mini list */}
            <div className="px-5 pb-5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Próximos agendamentos</p>
              {[
                { name: 'Marcos R.', time: '09:00', svc: 'Polimento', status: 'confirmed' },
                { name: 'Juliana F.', time: '10:30', svc: 'Higienização', status: 'pending' },
                { name: 'Pedro C.', time: '13:00', svc: 'Lavagem Completa', status: 'confirmed' },
              ].map((a) => (
                <div key={a.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-xs font-bold text-white">{a.name}</p>
                    <p className="text-[10px] text-slate-500">{a.time} · {a.svc}</p>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: a.status === 'confirmed' ? 'rgba(37,99,235,0.2)' : 'rgba(251,191,36,0.15)',
                      color: a.status === 'confirmed' ? '#60a5fa' : '#fbbf24',
                    }}>
                    {a.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
