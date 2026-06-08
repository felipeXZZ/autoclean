import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, CheckCircle, Zap, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ease = [0.25, 0.4, 0.25, 1] as const;

export const HeroSection = () => {
  const { isCompanyOwner } = useAuth();
  return (
  <section
    className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden"
    style={{ background: 'linear-gradient(160deg, #060b18 0%, #091428 55%, #060e1e 100%)' }}>

    {/* Background atmosphere */}
    <div className="absolute inset-0 pointer-events-none">
      <div style={{ background: 'radial-gradient(ellipse 70% 60% at 15% 55%, rgba(37,99,235,0.14) 0%, transparent 100%)' }} className="absolute inset-0" />
      <div style={{ background: 'radial-gradient(ellipse 50% 50% at 85% 20%, rgba(99,102,241,0.1) 0%, transparent 100%)' }} className="absolute inset-0" />
      <div style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} className="absolute inset-0" />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
      <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

        {/* ——— Left: Copy ——— */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.28)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">
              Plataforma para estéticas automotivas
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
            className="text-5xl lg:text-6xl xl:text-[4.2rem] font-black leading-[1.05] mb-6 tracking-tight text-white">
            Agendamentos online<br />
            para sua{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              estética automotiva
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed">
            Crie sua página, receba agendamentos e gerencie seus clientes em um só lugar. Uma plataforma completa para lava-rápidos, detailers e estéticas delivery.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              to={isCompanyOwner ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all group"
              style={{ boxShadow: '0 0 40px rgba(37,99,235,0.45)' }}>
              {isCompanyOwner ? 'Acessar painel' : 'Criar minha página grátis'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center gap-2 text-slate-300 hover:text-white px-8 py-4 rounded-2xl font-bold text-base transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              Ver como funciona
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="font-bold text-white">4.9</span>
              <span className="text-slate-500">• +500 estéticas</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              Grátis para começar
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
              Configurado em 5 minutos
            </div>
          </motion.div>
        </motion.div>

        {/* ——— Right: Visual ——— */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="relative hidden lg:block">

          {/* Glow halo */}
          <div style={{
            position: 'absolute', inset: '-30px',
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 65%)',
            filter: 'blur(24px)',
          }} />

          {/* Dashboard mockup */}
          <div
            className="relative rounded-[2rem] overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 48px 100px rgba(0,0,0,0.6)', background: '#08111f' }}>

            {/* Window titlebar */}
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-slate-500 font-medium">AutoClean Dashboard</span>
            </div>

            {/* Sidebar + content */}
            <div className="flex h-72">
              {/* Sidebar */}
              <div className="w-36 p-4 space-y-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                {['Visão Geral', 'Agendamentos', 'Serviços', 'Horários', 'Empresa'].map((item, i) => (
                  <div key={item}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold"
                    style={{
                      background: i === 0 ? 'rgba(37,99,235,0.2)' : 'transparent',
                      color: i === 0 ? '#60a5fa' : '#64748b',
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#3b82f6' : '#334155' }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Hoje</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Agendamentos', val: '7', color: '#60a5fa' },
                    { label: 'Receita', val: 'R$ 840', color: '#34d399' },
                    { label: 'Pendentes', val: '3', color: '#fbbf24' },
                    { label: 'Concluídos', val: '4', color: '#a78bfa' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{label}</p>
                      <p className="text-base font-black" style={{ color }}>{val}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Próximos</p>
                {[
                  { name: 'Carlos M.', time: '10:00', svc: 'Polimento', status: 'confirmed' },
                  { name: 'Ana Silva', time: '11:30', svc: 'Higienização', status: 'pending' },
                ].map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-2.5 rounded-lg mb-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <p className="text-[10px] font-bold text-white">{a.name}</p>
                      <p className="text-[9px] text-slate-500">{a.time} · {a.svc}</p>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
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
          </div>

          {/* Floating card — company page */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 -right-6 xl:-right-10 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(9,16,36,0.9)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,235,0.2)' }}>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sua página</p>
              <p className="text-white text-sm font-black">/empresa/sua-estetica</p>
            </div>
          </motion.div>

          {/* Floating card — rating */}
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
            className="absolute -bottom-6 -left-6 xl:-left-10 flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(9,16,36,0.9)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.12)' }}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[1,2,3,4,5].map((i) => <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-white text-xs font-black">+500 estéticas cadastradas</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};
