import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronRight, CheckCircle, Calendar, Smartphone, Users, TrendingUp,
  MapPin, Clock, Building2, Star, Zap, Shield, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const cardBg = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };

export const ParaEmpresas = () => {
  const { user, isCompanyOwner } = useAuth();

  const ctaLink = isCompanyOwner ? '/dashboard' : user ? '/onboarding' : '/register?empresa=1';
  const ctaLabel = isCompanyOwner ? 'Acessar meu painel' : 'Cadastrar minha estética gratuitamente';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #040c1a 0%, #071628 60%, #040d1e 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 60% 50% at 15% 55%, rgba(37,99,235,0.14) 0%, transparent 100%)' }} className="absolute inset-0" />
          <div style={{ background: 'radial-gradient(ellipse 50% 45% at 85% 20%, rgba(99,102,241,0.1) 0%, transparent 100%)' }} className="absolute inset-0" />
          <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '64px 64px' }} className="absolute inset-0" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.28)' }}>
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Para estéticas automotivas</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold leading-[1.06] mb-6 tracking-tight text-white">
                Receba agendamentos<br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                  online para sua estética
                </span>
              </h1>

              <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
                Crie sua página no AutoClean, cadastre seus serviços, compartilhe seu link e apareça para clientes que procuram estética automotiva na sua cidade.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  to={ctaLink}
                  className="inline-flex items-center justify-center gap-2 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all hover:scale-[1.02] group"
                  style={{ background: '#2563eb', boxShadow: '0 0 40px rgba(37,99,235,0.45)' }}
                >
                  {ctaLabel}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center text-slate-300 hover:text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
                >
                  Ver como funciona
                </a>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-slate-400">
                {['Grátis para começar', 'Sem mensalidade inicial', 'Configurado em 5 min'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: mini dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 48px 100px rgba(0,0,0,0.5)', background: '#060f1e' }}>
                <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-xs text-slate-500 font-medium">Painel da estética</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Agendamentos hoje', val: '8', color: '#60a5fa' },
                      { label: 'Receita do mês', val: 'R$ 3.200', color: '#34d399' },
                      { label: 'Pendentes', val: '3', color: '#fbbf24' },
                      { label: 'Clientes', val: '47', color: '#a78bfa' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">{label}</p>
                        <p className="text-lg font-black mt-0.5" style={{ color }}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Próximos agendamentos</p>
                    {[
                      { name: 'Carlos M.', time: '09:00', svc: 'Lavagem Completa', status: 'confirmed' },
                      { name: 'Ana Silva', time: '10:30', svc: 'Polimento',        status: 'pending' },
                      { name: 'João P.',   time: '14:00', svc: 'Vitrificação',     status: 'confirmed' },
                    ].map((a) => (
                      <div key={a.name} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div>
                          <p className="text-[11px] font-bold text-white">{a.name}</p>
                          <p className="text-[10px] text-slate-500">{a.time} · {a.svc}</p>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: a.status === 'confirmed' ? 'rgba(37,99,235,0.2)' : 'rgba(251,191,36,0.15)', color: a.status === 'confirmed' ? '#60a5fa' : '#fbbf24' }}>
                          {a.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: '#050e1c' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Por que usar o AutoClean</p>
            <h2 className="text-3xl font-extrabold text-white">Tudo que sua estética precisa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Building2,   title: 'Página profissional',        desc: 'Sua estética com logo, fotos, serviços e avaliações em uma página linda.', color: '#60a5fa' },
              { icon: Calendar,    title: 'Agenda online 24h',           desc: 'Receba agendamentos enquanto dorme. Sem telefone, sem WhatsApp manual.', color: '#34d399' },
              { icon: Smartphone,  title: 'Confirmação via WhatsApp',    desc: 'O cliente recebe o link do WhatsApp da sua estética para confirmar.', color: '#a78bfa' },
              { icon: Zap,         title: 'Configurado em 5 minutos',    desc: 'Crie a conta, cadastre seus serviços e comece a receber agendamentos hoje.', color: '#fbbf24' },
              { icon: MapPin,      title: 'Visibilidade na sua cidade',  desc: 'Apareça nas buscas de clientes que procuram estéticas na sua cidade.', color: '#f472b6' },
              { icon: TrendingUp,  title: 'Relatórios e métricas',       desc: 'Veja agendamentos, receita, clientes e desempenho em tempo real.', color: '#34d399' },
              { icon: Users,       title: 'Histórico de clientes',       desc: 'Acompanhe o histórico de cada cliente: serviços, gastos e frequência.', color: '#60a5fa' },
              { icon: Shield,      title: 'Perfil verificado',           desc: 'Empresas verificadas ganham mais confiança dos clientes na plataforma.', color: '#10b981' },
              { icon: Star,        title: 'Sistema de avaliações',       desc: 'Colete e exiba avaliações de clientes para ganhar mais visibilidade.', color: '#fbbf24' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl" style={cardBg}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="font-black text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6" style={{ background: '#040c1a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Processo simples</p>
            <h2 className="text-3xl font-extrabold text-white">Como funciona</h2>
          </div>
          <div className="space-y-4">
            {[
              { n: '01', title: 'Crie sua conta', desc: 'Registre-se gratuitamente com e-mail e senha. Leva menos de 1 minuto.' },
              { n: '02', title: 'Cadastre sua estética', desc: 'Preencha nome, cidade, descrição, tipo de atendimento (delivery, local ou ambos) e informações de contato.' },
              { n: '03', title: 'Configure serviços e horários', desc: 'Adicione seus serviços com nome, preço, duração e categoria. Configure os horários de funcionamento.' },
              { n: '04', title: 'Compartilhe seu link', desc: 'Receba um link único (/empresa/sua-estetica) para divulgar no Instagram, WhatsApp e onde quiser.' },
              { n: '05', title: 'Comece a receber agendamentos', desc: 'Clientes encontram sua estética na busca do AutoClean e agendam diretamente pelo site.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-5 p-5 rounded-2xl" style={cardBg}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-blue-400 text-sm" style={{ background: 'rgba(37,99,235,0.15)' }}>
                  {n}
                </div>
                <div>
                  <p className="font-black text-white mb-1">{title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: '#050e1c' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Planos</p>
            <h2 className="text-3xl font-extrabold text-white">Comece grátis, cresça com a gente</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: 'Grátis',
                sub: 'Para começar',
                color: '#60a5fa',
                highlight: false,
                features: ['Página pública', 'Até 5 serviços', 'Link compartilhável', 'Agendamentos básicos'],
              },
              {
                name: 'Pro',
                price: 'R$ 49',
                sub: '/mês',
                color: '#a78bfa',
                highlight: true,
                features: ['Serviços ilimitados', 'Agendamentos ilimitados', 'Destaque nas buscas', 'Relatórios', 'Suporte prioritário'],
              },
              {
                name: 'Premium',
                price: 'R$ 99',
                sub: '/mês',
                color: '#34d399',
                highlight: false,
                features: ['Tudo do Pro', 'Múltiplos profissionais', 'Mais destaque na cidade', 'Personalização avançada', 'Perfil verificado'],
              },
            ].map(({ name, price, sub, color, highlight, features }) => (
              <div
                key={name}
                className="flex flex-col p-6 rounded-2xl"
                style={{
                  background: highlight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${highlight ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  ...(highlight ? { boxShadow: '0 0 40px rgba(99,102,241,0.15)' } : {}),
                }}
              >
                {highlight && (
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-3" style={{ background: 'rgba(99,102,241,0.2)' }}>
                    Mais popular
                  </span>
                )}
                <p className="font-black text-white text-xl mb-1">{name}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black" style={{ color }}>{price}</span>
                  {sub && <span className="text-slate-500 text-sm">{sub}</span>}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={ctaLink}
                  className="block text-center py-3 rounded-xl font-black text-sm transition-all"
                  style={highlight
                    ? { background: '#7c3aed', color: 'white', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {name === 'Free' ? 'Começar grátis' : 'Assinar ' + name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #05091a 0%, #0a1e4a 50%, #060b18 100%)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '80%', background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Comece agora</p>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Pronto para colocar sua estética no AutoClean?
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Crie sua conta gratuitamente e receba seu primeiro agendamento online hoje.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center gap-2 text-white font-black text-base px-10 py-5 rounded-2xl transition-all hover:scale-[1.02] group"
              style={{ background: '#2563eb', boxShadow: '0 0 50px rgba(37,99,235,0.5)' }}
            >
              {ctaLabel}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-6">Sem cartão de crédito • Sem contrato • Comece grátis</p>
        </div>
      </section>

    </motion.div>
  );
};
