import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

export const Testimonials = () => {
  const reviews = [
    {
      name: "Ricardo Santos",
      role: "Empresário",
      content: "Excelente serviço! Vieram até o meu escritório e deixaram o carro impecável. Economizei muito tempo.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 5
    },
    {
      name: "Mariana Oliveira",
      role: "Advogada",
      content: "A higienização interna superou minhas expectativas. Eliminaram manchas que eu achava impossíveis de sair.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      rating: 5
    },
    {
      name: "Carlos Eduardo",
      role: "Médico",
      content: "Profissionais pontuais e muito cuidadosos. O polimento técnico deu uma vida nova para a pintura do meu SUV.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">O que dizem nossos clientes</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
            A satisfação de quem já experimentou o padrão AutoClean de qualidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all"
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-blue-50 dark:text-blue-900/20 opacity-50 group-hover:scale-110 transition-transform" />
              
              <div className="flex items-center gap-1 text-yellow-400 mb-6">
                {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-8 italic leading-relaxed relative z-10 transition-colors">
                "{review.content}"
              </p>

              <div className="flex items-center gap-4 border-t border-slate-50 dark:border-slate-800 pt-6">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white transition-colors">{review.name}</h4>
                  <p className="text-xs text-slate-500 transition-colors">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
