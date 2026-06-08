import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, ChevronRight, Star, Zap, Shield, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  const badges = [
    { icon: Zap, label: 'Rápido & Prático' },
    { icon: Shield, label: '100% Garantido' },
    { icon: Leaf, label: 'Eco-Friendly' },
  ];

  return (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-100/60 dark:bg-blue-900/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-900/15 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Left — Copy */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-900/50">
              <Smartphone className="w-3 h-3" />
              Estética Automotiva Delivery
            </div>

            <h1 className="text-5xl lg:text-[4.2rem] font-extrabold text-slate-900 dark:text-white leading-[1.08] mb-6 transition-colors">
              Seu carro impecável
              <br />
              <span className="text-blue-600 dark:text-blue-500 italic">sem sair de casa</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg leading-relaxed">
              Profissionais certificados vão até você com todo o equipamento. Agende em minutos e receba serviço de concessionária onde estiver.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <Icon className="w-3.5 h-3.5 text-blue-600" /> {label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/agendar"
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-bold hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/30 transition-all shadow-xl shadow-blue-200/60 dark:shadow-none flex items-center justify-center gap-2 group">
                Agendar agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#servicos"
                className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-800 px-8 py-4 rounded-2xl text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-700 transition-all flex items-center justify-center">
                Ver serviços
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
                ].map((url, i) => (
                  <img key={i} src={url} alt="Cliente" referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-yellow-400 mb-0.5">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">4.9</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">+2.500 clientes satisfeitos</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative">

            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-blue-900/20 aspect-[4/3]">
              <img
                src="/images/image2-3.jpg"
                alt="Profissional AutoClean em ação"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Overlay label */}
              <div className="absolute bottom-5 left-5">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2">
                  <p className="text-white text-xs font-bold uppercase tracking-widest opacity-80">AutoClean Premium</p>
                  <p className="text-white text-lg font-black">Estética Automotiva</p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};
