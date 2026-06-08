import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, MapPin, ChevronRight, ArrowRight,
  Calendar, CheckCircle, Building2,
  Droplets, Sparkles, Zap, Car, Shield, Wrench, Truck,
  Users, TrendingUp, Clock, Smartphone,
} from 'lucide-react';
import { getFeaturedCompanies, getPopularCities, getCompaniesWithMinPrice } from '../services/companySearchService';
import { CompanyCard } from '../components/marketplace/CompanyCard';
import { useAuth } from '../hooks/useAuth';
import type { Company } from '../types';

const CATEGORIES = [
  { label: 'Lavagem',      icon: Droplets, q: 'lavagem' },
  { label: 'Higienização', icon: Sparkles,  q: 'higienizacao' },
  { label: 'Polimento',    icon: Zap,       q: 'polimento' },
  { label: 'Vitrificação', icon: Shield,    q: 'vitrificacao' },
  { label: 'Motor',        icon: Wrench,    q: 'motor' },
  { label: 'Delivery',     icon: Truck,     q: 'delivery' },
  { label: 'Detailing',    icon: Car,       q: 'detailing' },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isCompanyOwner } = useAuth();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [featured, setFeatured] = useState<(Company & { minPrice: number })[]>([]);
  const [cities, setCities] = useState<{ city: string; state: string; count: number }[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFeaturedCompanies(8).then(async (companies) => {
      const withPrices = await getCompaniesWithMinPrice(companies);
      setFeatured(withPrices);
      setLoadingFeatured(false);
    });
    getPopularCities().then(setCities);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city.trim()) params.set('cidade', city.trim());
    navigate(`/buscar?${params.toString()}`);
  }

  const citySlug = (c: string) =>
    c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

      {/* ── HERO ── */}
      <section
        className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #040c1a 0%, #071628 60%, #040d1e 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(37,99,235,0.12) 0%, transparent 100%)' }} className="absolute inset-0" />
          <div style={{ background: 'radial-gradient(ellipse 50% 40% at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 100%)' }} className="absolute inset-0" />
          <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '64px 64px' }} className="absolute inset-0" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
              <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Marketplace de Estéticas Automotivas</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.08] mb-5 tracking-tight text-white">
              Agende com estéticas<br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                automotivas perto de você
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Descubra, compare e reserve serviços de lavagem, higienização, polimento e estética automotiva na sua cidade.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Serviço ou estética..."
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade (opcional)"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <button
                type="submit"
                className="py-4 px-8 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02] flex-shrink-0"
                style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.45)' }}
              >
                Buscar
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-500">Populares:</span>
              {['Lavagem completa', 'Polimento', 'Higienização interna', 'Vitrificação'].map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/buscar?q=${encodeURIComponent(s)}`)}
                  className="text-xs text-slate-400 hover:text-blue-400 px-3 py-1 rounded-full transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-6" style={{ background: '#040d1e', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {CATEGORIES.map(({ label, icon: Icon, q }) => (
              <button
                key={q}
                onClick={() => navigate(`/buscar?q=${encodeURIComponent(label)}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white hover:bg-blue-500/10 transition-all flex-shrink-0"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
              >
                <Icon className="w-4 h-4 text-blue-400" /> {label}
              </button>
            ))}
            <Link
              to="/buscar"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-blue-400 hover:text-blue-300 transition-all flex-shrink-0"
              style={{ border: '1px solid rgba(59,130,246,0.2)' }}
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#050e1c' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Recomendado para você</p>
              <h2 className="text-2xl font-extrabold text-white">Estéticas em destaque</h2>
            </div>
            <Link to="/buscar" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-bold mb-2">Nenhuma estética cadastrada ainda.</p>
              <p className="text-slate-600 text-sm mb-6">Seja o primeiro a cadastrar sua estética!</p>
              <Link
                to="/para-empresas"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm"
                style={{ background: '#2563eb' }}
              >
                <Building2 className="w-4 h-4" /> Cadastrar minha estética
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CITIES ── */}
      {cities.length > 0 && (
        <section className="py-16 px-4 sm:px-6" style={{ background: '#040c1a' }}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Por localização</p>
              <h2 className="text-2xl font-extrabold text-white">Encontre estéticas na sua cidade</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {cities.map(({ city, state, count }) => (
                <Link
                  key={city}
                  to={`/cidade/${citySlug(city)}`}
                  className="flex flex-col items-center gap-1 p-4 rounded-2xl text-center hover:-translate-y-0.5 transition-all group"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <MapPin className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <p className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{city}</p>
                  {state && <p className="text-xs text-slate-500">{state}</p>}
                  <p className="text-[10px] font-bold text-slate-600">{count} {count === 1 ? 'estética' : 'estéticas'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 sm:px-6" style={{ background: '#050e1c', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Simples assim</p>
            <h2 className="text-3xl font-extrabold text-white">Agende do seu jeito, em qualquer lugar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '01', icon: Search,      title: 'Pesquise',  desc: 'Busque por serviço, cidade ou nome da estética.' },
              { n: '02', icon: Building2,   title: 'Escolha',   desc: 'Compare estéticas, avaliações e preços.' },
              { n: '03', icon: Calendar,    title: 'Reserve',   desc: 'Escolha o melhor horário e confirme em segundos.' },
              { n: '04', icon: CheckCircle, title: 'Pronto!',   desc: 'Receba confirmação e fale pelo WhatsApp.' },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black text-blue-500 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.15)' }}>{n}</span>
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

      {/* ── FOR BUSINESSES ── */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #05091a 0%, #0a1e4a 55%, #060b18 100%)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '70%', background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Para donos de estética</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-5 leading-tight">
                Transforme sua estética automotiva com o AutoClean
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Crie sua página profissional, receba agendamentos online, organize sua agenda e apareça para clientes que buscam estética automotiva na sua cidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={isCompanyOwner ? '/dashboard' : '/para-empresas'}
                  className="inline-flex items-center justify-center gap-2 text-white font-black text-sm px-7 py-4 rounded-2xl transition-all"
                  style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.45)' }}
                >
                  {isCompanyOwner ? 'Acessar painel' : 'Cadastrar minha estética'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/para-empresas"
                  className="inline-flex items-center justify-center text-slate-300 hover:text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
                >
                  Ver como funciona
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Smartphone,  label: 'Agenda online 24h',   color: '#60a5fa' },
                { icon: Users,       label: 'Clientes organizados', color: '#34d399' },
                { icon: TrendingUp,  label: 'Mais visibilidade',    color: '#a78bfa' },
                { icon: Clock,       label: 'Controle de horários', color: '#fbbf24' },
                { icon: MapPin,      label: 'Busca por cidade',     color: '#f472b6' },
                { icon: CheckCircle, label: 'Página profissional',  color: '#34d399' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-xs font-bold text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
};
