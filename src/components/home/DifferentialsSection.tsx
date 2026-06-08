import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, X } from 'lucide-react';

const problems = [
  'Agendar pelo WhatsApp e esquecer de anotar',
  'Perder cliente por falta de resposta rápida',
  'Não saber quantos agendamentos tem na semana',
  'Horários duplicados e conflitos de agenda',
  'Sem histórico de clientes e veículos',
  'Dificuldade de mostrar portfólio e preços',
];

const solutions = [
  'Página pública com agenda online 24h',
  'Cliente agenda sozinho, sem precisar de resposta',
  'Painel com todos os agendamentos organizados',
  'Horários controlados automaticamente',
  'Histórico completo de cada cliente',
  'Página profissional com serviços e preços',
];

export const DifferentialsSection = () => (
  <section className="py-28" style={{ background: '#060b18' }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16">
        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 block">Por que AutoClean</span>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Chega de gerenciar no improviso
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Veja a diferença entre o jeito antigo e o jeito AutoClean de gerenciar sua estética.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Problems */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 rounded-3xl"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-red-400 mb-5">Sem AutoClean</p>
          <div className="space-y-3">
            {problems.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <X className="w-3 h-3 text-red-400" />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Solutions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-8 rounded-3xl"
          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-5">Com AutoClean</p>
          <div className="space-y-3">
            {solutions.map((s) => (
              <div key={s} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);
