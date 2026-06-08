import React from 'react';
import { Car, Calendar, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export const HowItWorks = () => {
  const steps = [
    {
      title: 'Escolha o serviço',
      desc: 'Selecione entre lavagem simples, completa ou estética avançada.',
      icon: <Car className="w-8 h-8" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Data e horário',
      desc: 'Escolha o melhor momento para receber nossa equipe no seu local.',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Receba no local',
      desc: 'Nossos profissionais vão até você com todo o equipamento necessário.',
      icon: <MapPin className="w-8 h-8" />,
      color: 'bg-blue-600'
    }
  ];

  return (
    <section id="como-funciona" className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">Como funciona</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
            Agendar sua lavagem nunca foi tão fácil. Siga os passos e deixe o resto com a gente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6", step.color)}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
