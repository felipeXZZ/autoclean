import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const FinalCTA = () => {
  const { isCompanyOwner } = useAuth();
  return (
  <section
    className="py-32 relative overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #05091a 0%, #0a1e4a 50%, #060b18 100%)' }}>

    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '70%', height: '80%',
      background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 65%)',
      filter: 'blur(40px)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', bottom: '-10%', right: '-10%',
      width: '40%', height: '50%',
      background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)',
      filter: 'blur(50px)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      backgroundSize: '64px 64px',
    }} />

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}>

        <span className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6 block">
          Comece agora — é grátis
        </span>

        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
          Sua estética merece uma<br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            presença digital profissional
          </span>
        </h2>

        <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
          Crie sua página em minutos, comece a receber agendamentos online e pare de perder cliente por falta de organização.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={isCompanyOwner ? '/dashboard' : '/register'}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all group"
            style={{ boxShadow: '0 0 50px rgba(37,99,235,0.5)' }}>
            {isCompanyOwner ? 'Acessar painel' : 'Criar minha página grátis'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#planos"
            className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white px-10 py-5 rounded-2xl font-black text-lg transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
            Ver planos <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </motion.div>
    </div>
  </section>
  );
};
