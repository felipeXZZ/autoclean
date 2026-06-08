import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Star, MapPin, Clock, MessageCircle, ChevronRight,
  Building2, Phone, Mail, Truck, LayoutDashboard,
} from 'lucide-react';
import { getCompanyBySlug, getCompanyServices, getCompanyReviews } from '../services/companyService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Company, Service, Review } from '../types';

const CAT_COLOR: Record<string, { text: string; bg: string; border: string }> = {
  Lavagem:      { text: '#60a5fa', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.2)' },
  Higienização: { text: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  Polimento:    { text: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  Proteção:     { text: '#818cf8', bg: 'rgba(79,70,229,0.1)',  border: 'rgba(79,70,229,0.2)'  },
  Técnico:      { text: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  Geral:        { text: '#94a3b8', bg: 'rgba(100,116,139,0.1)',border: 'rgba(100,116,139,0.2)' },
};

function fmtPrice(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDuration(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}min` : `${h}h`;
}

export const CompanyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [company, setCompany]   = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOwner, setIsOwner]   = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const c = await getCompanyBySlug(slug);
      if (!c) { setNotFound(true); setLoading(false); return; }
      const [svcs, revs] = await Promise.all([
        getCompanyServices(c.id),
        getCompanyReviews(c.id),
      ]);
      setCompany(c);
      setServices(svcs);
      setReviews(revs);

      if (user?.id) {
        const { data } = await supabase
          .from('company_members')
          .select('id')
          .eq('company_id', c.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setIsOwner(!!data);
      }

      setLoading(false);
    })();
  }, [slug, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060b18' }}>
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4" style={{ background: '#060b18' }}>
        <div>
          <p className="text-5xl mb-4">🚗</p>
          <h1 className="text-2xl font-extrabold text-white mb-2">Empresa não encontrada</h1>
          <p className="text-slate-400 mb-6">Este endereço não existe ou foi desativado.</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'Geral';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div style={{ background: '#060b18', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div
        className="relative pt-24 pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #060b18 0%, #091428 60%, #060b18 100%)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}>
              {company.logo_url
                ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                : <Building2 className="w-10 h-10 text-white" />}
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">{company.name}</h1>

            {company.description && (
              <p className="text-lg text-slate-400 max-w-2xl mb-5 leading-relaxed">{company.description}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mb-8">
              {avgRating && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {avgRating} ({reviews.length} avaliações)
                </span>
              )}
              {company.is_delivery && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Truck className="w-3.5 h-3.5" /> Atendimento delivery
                </span>
              )}
              {company.city && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {company.city}{company.state ? `, ${company.state}` : ''}
                </span>
              )}
            </div>

            {/* CTAs */}
            {isOwner ? (
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-black text-base transition-all"
                  style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                  <LayoutDashboard className="w-5 h-5" /> Ir para o painel
                </Link>
                <div
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Você é o dono desta empresa
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/empresa/${slug}/agendar`}
                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-black text-base transition-all"
                  style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                  Agendar agora <ChevronRight className="w-5 h-5" />
                </Link>
                {company.whatsapp && (
                  <a
                    href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-green-400 px-8 py-4 rounded-2xl font-black text-base transition-all hover:bg-green-500/10"
                    style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.06)' }}>
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Services */}
        {services.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-extrabold text-white mb-8">Serviços</h2>
            {Object.entries(grouped).map(([cat, svcs]) => {
              const colors = CAT_COLOR[cat] ?? CAT_COLOR.Geral;
              return (
                <div key={cat} className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: colors.text }}>
                    {cat}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {svcs.map((svc, i) => (
                      <motion.div
                        key={svc.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="overflow-hidden rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {svc.image_url && (
                          <div className="w-full h-40 overflow-hidden">
                            <img
                              src={svc.image_url}
                              alt={svc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-4 p-5">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white mb-1">{svc.name}</p>
                            {svc.description && (
                              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{svc.description}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs text-slate-500">{fmtDuration(svc.duration_minutes)}</span>
                            </div>
                          </div>
                          <p className="text-lg font-black text-white flex-shrink-0">{fmtPrice(svc.price)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Info cards */}
        <section className="mb-16 grid md:grid-cols-2 gap-4">
          {company.phone && (
            <div
              className="flex items-center gap-3 p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Telefone</p>
                <p className="text-white font-bold">{company.phone}</p>
              </div>
            </div>
          )}
          {company.email && (
            <div
              className="flex items-center gap-3 p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">E-mail</p>
                <p className="text-white font-bold">{company.email}</p>
              </div>
            </div>
          )}
          {company.is_delivery && (
            <div
              className="flex items-start gap-3 p-5 rounded-2xl md:col-span-2"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Truck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-bold mb-1">Atendimento Delivery</p>
                <p className="text-slate-400 text-sm">
                  {company.delivery_description || 'Vamos até o seu endereço com todo o equipamento necessário.'}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-extrabold text-white">Avaliações</h2>
              {avgRating && (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-white">{avgRating}</span>
                  <div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">{reviews.length} avaliações</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                    ))}
                  </div>
                  {r.comment && <p className="text-slate-400 text-sm italic mb-3">"{r.comment}"</p>}
                  <p className="text-white text-sm font-bold">{r.customer_name || 'Cliente'}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Final CTA */}
        {!isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-12 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(99,102,241,0.08))',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
            <h3 className="text-3xl font-extrabold text-white mb-3">Pronto para agendar?</h3>
            <p className="text-slate-400 mb-8">Escolha o serviço e o melhor horário para você.</p>
            <Link
              to={`/empresa/${slug}/agendar`}
              className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all"
              style={{ background: '#2563eb', boxShadow: '0 0 40px rgba(37,99,235,0.4)' }}>
              Agendar agora <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};
