import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    company: 'AutoShine Detailing',
    owner: 'Ricardo M.',
    city: 'São Paulo, SP',
    initials: 'AS',
    color: '#3b82f6',
    rating: 5,
    text: 'Antes eu agendava tudo pelo WhatsApp e vivia perdendo cliente. Com o AutoClean, minha página recebe agendamentos até de madrugada. Triplicou meu faturamento.',
  },
  {
    company: 'LavaMax Premium',
    owner: 'Juliana F.',
    city: 'Curitiba, PR',
    initials: 'LM',
    color: '#a78bfa',
    rating: 5,
    text: 'Configurei em menos de 10 minutos e já no mesmo dia recebi 3 agendamentos pela página. O painel é muito simples e fácil de usar. Recomendo muito.',
  },
  {
    company: 'DetailPro SP',
    owner: 'Carlos E.',
    city: 'São Paulo, SP',
    initials: 'DP',
    color: '#34d399',
    rating: 5,
    text: 'O que mais gostei foi o painel de gestão. Consigo ver todos os agendamentos, marcar como concluído e entrar no WhatsApp do cliente direto. Perfeito.',
  },
];

export const TestimonialsSection = () => (
  <section className="py-28" style={{ background: '#060b18' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16">
        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 block">Depoimentos</span>
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          Estéticas que transformaram<br />seu negócio com a plataforma
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Veja o que donos de estética dizem sobre usar o AutoClean.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <motion.div
            key={r.company}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="relative flex flex-col p-7 rounded-3xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.028)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>

            <Quote
              className="absolute top-6 right-6 w-10 h-10 opacity-10"
              style={{ color: r.color }}
            />

            <div className="flex gap-0.5 mb-5">
              {[...Array(r.rating)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            <p className="text-slate-400 text-sm leading-relaxed italic flex-1 mb-7">
              "{r.text}"
            </p>

            <div
              className="flex items-center gap-3 pt-5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}30` }}>
                {r.initials}
              </div>
              <div>
                <p className="font-black text-white text-sm">{r.company}</p>
                <p className="text-slate-500 text-xs">{r.owner} · {r.city}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
