import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { cn } from '../lib/utils';
import type { Service } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Lavagem:      'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  Higienização: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  Técnico:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Polimento:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Proteção:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const CATEGORY_ACCENT: Record<string, string> = {
  Lavagem:      'group-hover:bg-blue-600',
  Higienização: 'group-hover:bg-green-600',
  Técnico:      'group-hover:bg-orange-500',
  Polimento:    'group-hover:bg-purple-600',
  Proteção:     'group-hover:bg-indigo-600',
};

interface ServicesListProps {
  onSelect?: (s: Service) => void;
}

export const ServicesList = ({ onSelect }: ServicesListProps) => {
  const navigate = useNavigate();
  const { services, loading, error } = useServices();

  function handleSelect(svc: Service) {
    if (onSelect) { onSelect(svc); return; }
    navigate('/agendar', { state: { service: svc } });
  }

  function formatDuration(min: number) {
    if (min >= 60) return `${Math.floor(min / 60)}h${min % 60 ? ` ${min % 60}min` : ''}`;
    return `${min}min`;
  }

  return (
    <section id="servicos" className="py-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">Nossos Serviços</span>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 transition-colors tracking-tight">
              Cuidado profissional para o seu carro
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl transition-colors">
              Todos os serviços realizados com produtos premium biodegradáveis, direto no seu endereço.
            </p>
          </div>
          <a href="/agendar"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none whitespace-nowrap text-sm flex-shrink-0">
            Agendar agora <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando serviços...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-slate-500">
            <p>Não foi possível carregar os serviços.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const colorClass = CATEGORY_COLORS[svc.category] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
              const accentClass = CATEGORY_ACCENT[svc.category] ?? 'group-hover:bg-blue-600';

              return (
                <motion.div
                  key={svc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -6 }}
                  className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all flex flex-col h-full"
                >
                  {/* Category tag */}
                  <span className={cn('self-start text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-5', colorClass)}>
                    {svc.category}
                  </span>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {svc.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-1 transition-colors mb-6">
                    {svc.description}
                  </p>

                  <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Investimento</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">R$ {svc.price}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" /> {formatDuration(svc.duration_minutes)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleSelect(svc)}
                      className={cn(
                        'w-12 h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 active:scale-95',
                        accentClass
                      )}
                      aria-label={`Agendar ${svc.name}`}>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
