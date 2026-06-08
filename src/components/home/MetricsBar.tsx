import React from 'react';
import { motion } from 'motion/react';

const metrics = [
  { value: '+500', label: 'Estéticas cadastradas' },
  { value: '+12.000', label: 'Agendamentos realizados' },
  { value: '4.9/5', label: 'Avaliação média' },
  { value: '100%', label: 'Digital e automatizado' },
];

export const MetricsBar = () => (
  <section className="py-10" style={{ background: '#050916', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="flex flex-col items-center justify-center py-6 text-center"
            style={{ borderRight: i < metrics.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <p className="text-3xl lg:text-4xl font-black text-white mb-1 tracking-tight">{m.value}</p>
            <p className="text-sm text-slate-500 font-medium">{m.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
