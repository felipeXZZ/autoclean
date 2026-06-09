import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, ChevronRight, ArrowLeft, Clock, MapPin, Phone,
  Car, User, Mail, FileText, CreditCard, Wallet, Loader2, Calendar, Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { getCompanyBySlug, getCompanyServices } from '../services/companyService';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import {
  onlyNumbers, formatPhoneBR, formatCep, formatPlate,
  isValidPhoneBR, isValidPlate, fetchAddressByCep,
} from '../lib/bookingUtils';
import type { Company, Service, Profile, PaymentMethod } from '../types';
import { useAccountMode } from '../contexts/AccountModeContext';

interface Props {
  user: SupabaseUser | null;
  profile: Profile | null;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

interface CustomerData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_model: string;
  vehicle_plate: string;
  zip_code: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  address_complement: string;
  notes: string;
  payment_method: PaymentMethod;
}

const CAT_COLORS: Record<string, string> = {
  Lavagem:      'bg-blue-900/30 text-blue-400',
  Higienização: 'bg-green-900/30 text-green-400',
  Técnico:      'bg-yellow-900/30 text-yellow-400',
  Polimento:    'bg-purple-900/30 text-purple-400',
  Proteção:     'bg-indigo-900/30 text-indigo-400',
};

function StepBar({ current }: { current: number }) {
  const labels = ['Serviços', 'Data & Hora', 'Seus Dados', 'Confirmação'];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, i) => {
          const step = i + 1;
          const done = current > step;
          const active = current === step;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                done   ? 'bg-blue-600 text-white' :
                active ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' :
                         'text-slate-500'
              )}
              style={!done && !active ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' } : {}}>
                {done ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              <span className={cn('text-[10px] font-bold uppercase tracking-wider hidden sm:block',
                active ? 'text-blue-400' : 'text-slate-500')}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / 3) * 100}%` }}
          transition={{ duration: 0.4 }}
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
        />
      </div>
    </div>
  );
}

const inputCls = 'w-full px-4 py-3.5 rounded-xl text-white font-medium text-sm focus:outline-none transition-colors placeholder-slate-500';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const inputErrStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.6)' };

export const CompanyBookingPage = ({ user, profile }: Props) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isCompanyMode, switchToClientMode } = useAccountMode();
  const preSelected = (location.state as { preSelected?: SelectedService } | null)?.preSelected;

  const [company, setCompany]   = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isOwner, setIsOwner]   = useState(false);

  const [step, setStep]         = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    preSelected ? [preSelected] : []
  );
  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('');
  const [slots, setSlots]       = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [fetchingCep, setFetchingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  const [customer, setCustomer] = useState<CustomerData>({
    customer_name: profile?.full_name ?? '',
    customer_email: user?.email ?? '',
    customer_phone: profile?.phone ? formatPhoneBR(profile.phone) : '',
    vehicle_model: '',
    vehicle_plate: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    address_complement: '',
    notes: '',
    payment_method: 'local',
  });

  // Load company + services + ownership check
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const c = await getCompanyBySlug(slug);
      if (!c) { toast.error('Empresa não encontrada.'); navigate('/'); return; }
      const svcs = await getCompanyServices(c.id);
      setCompany(c);
      setServices(svcs);

      if (user?.id) {
        const { data } = await supabase
          .from('company_members')
          .select('id')
          .eq('company_id', c.id)
          .eq('user_id', user.id)
          .maybeSingle();
        setIsOwner(!!data);
      }

      setLoadingPage(false);
    })();
  }, [slug, navigate, user?.id]);

  // Sync profile data
  useEffect(() => {
    if (profile) {
      setCustomer((p) => ({
        ...p,
        customer_name: p.customer_name || profile.full_name,
        customer_phone: p.customer_phone || (profile.phone ? formatPhoneBR(profile.phone) : ''),
      }));
    }
    if (user?.email) {
      setCustomer((p) => ({ ...p, customer_email: p.customer_email || user.email! }));
    }
  }, [profile, user]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!date || !company) { setSlots([]); setTime(''); return; }
    setLoadingSlots(true);
    setTime('');
    getAvailableSlots(date, company.id)
      .then(setSlots)
      .catch(() => { toast.error('Erro ao buscar horários.'); setSlots([]); })
      .finally(() => setLoadingSlots(false));
  }, [date, company]);

  // Auto-fetch address by CEP
  useEffect(() => {
    const digits = onlyNumbers(customer.zip_code);
    if (digits.length !== 8) return;
    setFetchingCep(true);
    setCepError('');
    fetchAddressByCep(digits)
      .then((addr) => {
        if (!addr) { setCepError('CEP não encontrado. Verifique e tente novamente.'); return; }
        setCustomer((prev) => ({
          ...prev,
          street: addr.street || prev.street,
          neighborhood: addr.neighborhood || prev.neighborhood,
          city: addr.city || prev.city,
          state: addr.state || prev.state,
        }));
      })
      .catch(() => setCepError('Não foi possível buscar o CEP agora. Preencha o endereço manualmente.'))
      .finally(() => setFetchingCep(false));
  }, [customer.zip_code]);

  const totalPrice   = selectedServices.reduce((s, svc) => s + svc.price, 0);
  const totalMinutes = selectedServices.reduce((s, svc) => s + svc.duration_minutes, 0);
  const durationLabel = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 ? ` ${totalMinutes % 60}min` : ''}`
    : `${totalMinutes}min`;

  function toggle(svc: Service) {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === svc.id);
      if (exists) return prev.filter((s) => s.id !== svc.id);
      return [...prev, { id: svc.id, name: svc.name, price: svc.price, duration_minutes: svc.duration_minutes }];
    });
  }

  function set(field: keyof CustomerData, value: string) {
    if (field === 'zip_code') setCepError('');
    setErrors((prev) => ({ ...prev, [field]: '' }));
    let processed = value;
    if (field === 'customer_phone') processed = formatPhoneBR(value);
    else if (field === 'zip_code') processed = formatCep(value);
    else if (field === 'vehicle_plate') processed = formatPlate(value);
    setCustomer((p) => ({ ...p, [field]: processed }));
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {};
    if (!customer.customer_name.trim()) e.customer_name = 'Nome obrigatório.';
    if (!isValidPhoneBR(customer.customer_phone)) e.customer_phone = 'Informe um WhatsApp válido com DDD.';
    if (!customer.customer_email.trim() || !/\S+@\S+\.\S+/.test(customer.customer_email)) {
      e.customer_email = 'Informe um e-mail válido.';
    }
    if (!customer.vehicle_model.trim()) e.vehicle_model = 'Modelo do carro obrigatório.';
    if (!isValidPlate(customer.vehicle_plate)) e.vehicle_plate = 'Informe uma placa válida com 7 caracteres.';
    if (onlyNumbers(customer.zip_code).length !== 8) e.zip_code = 'CEP deve ter 8 dígitos.';
    if (!customer.street.trim()) e.street = 'Rua obrigatória.';
    if (!customer.number.trim()) e.number = 'Número obrigatório.';
    if (!customer.neighborhood.trim()) e.neighborhood = 'Bairro obrigatório.';
    if (!customer.city.trim()) e.city = 'Cidade obrigatória.';
    if (!customer.state.trim()) e.state = 'Estado obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const composedAddress = customer.street
    ? `${customer.street}, ${customer.number} - ${customer.neighborhood}, ${customer.city} - ${customer.state}, ${customer.zip_code}`
    : '';

  async function handleConfirm() {
    if (!company) return;
    setSubmitting(true);
    try {
      const appt = await createAppointment({
        company_id: company.id,
        customer_name: customer.customer_name,
        customer_email: customer.customer_email,
        customer_phone: onlyNumbers(customer.customer_phone),
        vehicle_model: customer.vehicle_model,
        vehicle_plate: customer.vehicle_plate,
        address: composedAddress,
        address_complement: customer.address_complement,
        notes: customer.notes,
        payment_method: customer.payment_method,
        appointment_date: date,
        appointment_time: `${time}:00`,
        total_price: totalPrice,
        total_duration_minutes: totalMinutes,
        user_id: user?.id,
        services: selectedServices,
      });
      setCreatedId(appt.id);
      setStep(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  }

  const waText = encodeURIComponent(
    `Olá ${company?.name}! Acabei de agendar:\n\n` +
    `*Serviços:* ${selectedServices.map((s) => s.name).join(', ')}\n` +
    `*Total:* R$ ${totalPrice}\n` +
    `*Data:* ${date} às ${time}\n` +
    `*Endereço:* ${composedAddress}`
  );
  const waHref = company?.whatsapp
    ? `https://wa.me/${company.whatsapp.replace(/\D/g, '')}?text=${waText}`
    : `https://wa.me/5511999999999?text=${waText}`;

  const today = format(new Date(), 'yyyy-MM-dd');

  const fldStyle = (field: string) => errors[field] ? inputErrStyle : inputStyle;

  if (isCompanyMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060b18' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Building2 className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Você está no modo Empresa</h2>
          <p className="text-slate-400 mb-8 leading-relaxed text-sm">
            Para agendar um serviço como cliente, altere o modo de acesso no menu do usuário.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={switchToClientMode}
              className="py-3.5 rounded-xl font-bold text-white transition-all"
              style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(37,99,235,0.35)' }}>
              Mudar para cliente e continuar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="py-3.5 rounded-xl font-bold text-slate-400 hover:text-white transition-all block w-full text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Voltar
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060b18' }}>
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  // ── AUTH GATE
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060b18' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
            <User className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Entre para agendar</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            Para agendar um serviço é necessário ter uma conta no AutoClean.
          </p>
          <p className="text-slate-500 text-sm mb-8">É rápido e gratuito!</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              state={{ from: `/empresa/${slug}/agendar` }}
              className="py-3.5 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(37,99,235,0.35)' }}>
              Entrar na minha conta
            </Link>
            <Link
              to="/register"
              state={{ from: `/empresa/${slug}/agendar` }}
              className="py-3.5 rounded-xl font-bold text-slate-300 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Criar conta grátis
            </Link>
            <Link
              to={`/empresa/${slug}`}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors py-2">
              ← Voltar para a página da empresa
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── OWNER BLOCK
  if (isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060b18' }}>
        <div className="max-w-sm w-full text-center p-10 rounded-3xl" style={cardStyle}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}>
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Você é o dono desta empresa</h2>
          <p className="text-slate-400 text-sm mb-8">
            Donos não podem agendar nos próprios serviços. Acesse o painel para gerenciar sua agenda.
          </p>
          <Link
            to="/dashboard"
            className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2"
            style={{ background: '#2563eb' }}>
            Ir para o painel
          </Link>
          <Link
            to={`/empresa/${slug}`}
            className="block mt-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Voltar para a página da empresa
          </Link>
        </div>
      </div>
    );
  }

  // ── SUCCESS
  if (step === 5) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4"
        style={{ background: '#060b18' }}>
        <div className="max-w-md w-full text-center p-10 rounded-3xl" style={cardStyle}>
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Agendado!</h2>
          <p className="text-slate-400 mb-2">Seu agendamento foi registrado com sucesso.</p>
          <p className="text-xs text-slate-500 font-mono mb-8">#{createdId.slice(-8).toUpperCase()}</p>

          <div className="rounded-2xl p-5 text-left space-y-3 mb-8 text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex gap-2 items-start">
              <Car className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{selectedServices.map((s) => s.name).join(' + ')}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-slate-300">{date} às {time}</span>
            </div>
            <div className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{composedAddress}</span>
            </div>
            <div className="flex gap-2 items-center">
              <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-white font-black">
                {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={`/empresa/${slug}`}
              className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: '#2563eb' }}>
              Voltar para {company?.name}
            </Link>
            {user && (
              <button
                onClick={() => navigate('/meus-agendamentos')}
                className="w-full py-4 rounded-2xl font-bold text-slate-300 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Ver meus agendamentos
              </button>
            )}
            <a
              href={waHref}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 text-green-400 font-bold hover:text-green-300 py-2 transition-colors">
              <Phone className="w-4 h-4" /> Confirmar via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-28 pb-16 sm:pb-20" style={{ background: '#060b18' }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Company header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Agendar em</p>
            <p className="text-white font-black">{company?.name}</p>
          </div>
          <Link to={`/empresa/${slug}`} className="ml-auto text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Ver página
          </Link>
        </div>

        <StepBar current={step} />

        <div className="rounded-3xl p-4 sm:p-6 md:p-8" style={cardStyle}>
          <AnimatePresence mode="wait">

            {/* STEP 1: SERVIÇOS */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">O que faremos hoje?</h2>
                    <p className="text-slate-400 text-sm mt-1">Escolha um ou mais serviços</p>
                  </div>
                  {totalPrice > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</p>
                      <p className="text-2xl font-black text-blue-400">
                        {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p className="text-xs text-slate-500">{durationLabel}</p>
                    </div>
                  )}
                </div>

                {services.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Nenhum serviço disponível no momento.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.map((svc) => {
                      const sel = !!selectedServices.find((s) => s.id === svc.id);
                      return (
                        <button
                          key={svc.id}
                          onClick={() => toggle(svc)}
                          className="p-5 rounded-2xl text-left transition-all"
                          style={{
                            background: sel ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                            border: sel ? '2px solid rgba(37,99,235,0.5)' : '2px solid rgba(255,255,255,0.07)',
                          }}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', CAT_COLORS[svc.category] ?? 'bg-slate-800 text-slate-400')}>
                              {svc.category}
                            </span>
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                              style={{
                                borderColor: sel ? '#2563eb' : 'rgba(255,255,255,0.2)',
                                background: sel ? '#2563eb' : 'transparent',
                              }}>
                              {sel && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <h3 className="font-extrabold text-white text-base mb-1">{svc.name}</h3>
                          {svc.description && (
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{svc.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-black text-white">
                              {svc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {svc.duration_minutes >= 60
                                ? `${Math.floor(svc.duration_minutes / 60)}h${svc.duration_minutes % 60 ? `${svc.duration_minutes % 60}min` : ''}`
                                : `${svc.duration_minutes}min`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full mt-6 py-5 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: '#2563eb', boxShadow: selectedServices.length > 0 ? '0 0 30px rgba(37,99,235,0.4)' : 'none' }}>
                  Continuar <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: DATA & HORA */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Quando podemos ir?</h2>
                  <p className="text-slate-400 text-sm mt-1">Escolha a data e horário disponível</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Data
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                {date && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Horários disponíveis
                    </label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-slate-400 py-4">
                        <Loader2 className="w-5 h-5 animate-spin" /> Buscando horários...
                      </div>
                    ) : slots.length === 0 ? (
                      <div
                        className="p-4 rounded-xl text-sm font-medium"
                        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                        Não há horários disponíveis nessa data. Tente outro dia.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setTime(slot)}
                            className="py-3 rounded-xl font-bold text-sm transition-all"
                            style={{
                              background: time === slot ? '#2563eb' : 'rgba(255,255,255,0.04)',
                              border: `2px solid ${time === slot ? '#2563eb' : 'rgba(255,255,255,0.08)'}`,
                              color: time === slot ? 'white' : '#94a3b8',
                            }}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={!date || !time}
                  onClick={() => {
                    if (date < today) {
                      toast.error('Selecione uma data a partir de hoje.');
                      setDate('');
                      return;
                    }
                    setStep(3);
                  }}
                  className="w-full py-5 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: '#2563eb', boxShadow: date && time ? '0 0 30px rgba(37,99,235,0.4)' : 'none' }}>
                  Continuar <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* STEP 3: DADOS */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">Seus dados</h2>
                <p className="text-slate-400 text-sm mb-6">Onde seu carro está e como entrar em contato</p>

                <form onSubmit={(e) => { e.preventDefault(); if (validateStep3()) setStep(4); }} className="space-y-4">

                  {/* Linha 1: Nome + WhatsApp */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        <User className="w-3 h-3 inline mr-1" /> Nome
                      </label>
                      <input type="text" placeholder="Seu nome completo"
                        value={customer.customer_name} onChange={(e) => set('customer_name', e.target.value)}
                        className={inputCls} style={fldStyle('customer_name')} />
                      {errors.customer_name && <p className="text-red-400 text-xs mt-1">{errors.customer_name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        <Phone className="w-3 h-3 inline mr-1" /> WhatsApp
                      </label>
                      <input type="tel" placeholder="(11) 99999-9999"
                        value={customer.customer_phone} onChange={(e) => set('customer_phone', e.target.value)}
                        className={inputCls} style={fldStyle('customer_phone')} />
                      {errors.customer_phone && <p className="text-red-400 text-xs mt-1">{errors.customer_phone}</p>}
                    </div>
                  </div>

                  {/* Linha 2: E-mail + Modelo */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        <Mail className="w-3 h-3 inline mr-1" /> E-mail
                      </label>
                      <input type="email" placeholder="seu@email.com"
                        value={customer.customer_email} onChange={(e) => set('customer_email', e.target.value)}
                        className={inputCls} style={fldStyle('customer_email')} />
                      {errors.customer_email && <p className="text-red-400 text-xs mt-1">{errors.customer_email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        <Car className="w-3 h-3 inline mr-1" /> Modelo do carro
                      </label>
                      <input type="text" placeholder="Ex: Toyota Corolla 2022"
                        value={customer.vehicle_model} onChange={(e) => set('vehicle_model', e.target.value)}
                        className={inputCls} style={fldStyle('vehicle_model')} />
                      {errors.vehicle_model && <p className="text-red-400 text-xs mt-1">{errors.vehicle_model}</p>}
                    </div>
                  </div>

                  {/* Linha 3: Placa + CEP */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Placa <span className="font-normal text-slate-600 normal-case">(opcional)</span>
                      </label>
                      <input type="text" placeholder="ABC1D23"
                        value={customer.vehicle_plate} onChange={(e) => set('vehicle_plate', e.target.value)}
                        className={inputCls} style={fldStyle('vehicle_plate')} />
                      {errors.vehicle_plate && <p className="text-red-400 text-xs mt-1">{errors.vehicle_plate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        <MapPin className="w-3 h-3 inline mr-1" /> CEP
                      </label>
                      <div className="relative">
                        <input type="text" placeholder="00000-000"
                          value={customer.zip_code} onChange={(e) => set('zip_code', e.target.value)}
                          className={inputCls} style={fldStyle('zip_code')} />
                        {fetchingCep && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-400" />
                        )}
                      </div>
                      {cepError && <p className="text-red-400 text-xs mt-1">{cepError}</p>}
                      {!cepError && errors.zip_code && <p className="text-red-400 text-xs mt-1">{errors.zip_code}</p>}
                    </div>
                  </div>

                  {/* Linha 4: Rua + Número */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Rua
                      </label>
                      <input type="text" placeholder="Nome da rua"
                        value={customer.street} onChange={(e) => set('street', e.target.value)}
                        className={inputCls} style={fldStyle('street')} />
                      {errors.street && <p className="text-red-400 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <div className="sm:w-36">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Número
                      </label>
                      <input type="text" placeholder="123 ou S/N"
                        value={customer.number} onChange={(e) => set('number', e.target.value)}
                        className={inputCls} style={fldStyle('number')} />
                      {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
                    </div>
                  </div>

                  {/* Linha 5: Bairro + Cidade + Estado */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Bairro
                      </label>
                      <input type="text" placeholder="Bairro"
                        value={customer.neighborhood} onChange={(e) => set('neighborhood', e.target.value)}
                        className={inputCls} style={fldStyle('neighborhood')} />
                      {errors.neighborhood && <p className="text-red-400 text-xs mt-1">{errors.neighborhood}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Cidade
                      </label>
                      <input type="text" placeholder="Cidade"
                        value={customer.city} onChange={(e) => set('city', e.target.value)}
                        className={inputCls} style={fldStyle('city')} />
                      {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Estado
                      </label>
                      <input type="text" placeholder="UF" maxLength={2}
                        value={customer.state} onChange={(e) => set('state', e.target.value.toUpperCase())}
                        className={inputCls} style={fldStyle('state')} />
                      {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Complemento <span className="font-normal text-slate-600 normal-case">(opcional)</span>
                    </label>
                    <input type="text" placeholder="Apto, bloco, portaria"
                      value={customer.address_complement} onChange={(e) => set('address_complement', e.target.value)}
                      className={inputCls} style={inputStyle} />
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      <FileText className="w-3 h-3 inline mr-1" /> Observações <span className="font-normal text-slate-600 normal-case">(opcional)</span>
                    </label>
                    <textarea rows={2} placeholder="Algum detalhe específico?"
                      value={customer.notes} onChange={(e) => set('notes', e.target.value)}
                      className={`${inputCls} resize-none`} style={inputStyle} />
                  </div>

                  {/* Pagamento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      <CreditCard className="w-3 h-3 inline mr-1" /> Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: 'local', label: 'No local', sub: 'Pague ao profissional', icon: Wallet },
                        { value: 'online', label: 'Online', sub: 'PIX / Cartão', icon: CreditCard },
                      ] as const).map(({ value, label, sub, icon: Icon }) => (
                        <button key={value} type="button"
                          onClick={() => set('payment_method', value)}
                          className="p-4 rounded-xl text-left transition-all"
                          style={{
                            background: customer.payment_method === value ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${customer.payment_method === value ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                          <Icon className={cn('w-5 h-5 mb-2', customer.payment_method === value ? 'text-blue-400' : 'text-slate-500')} />
                          <p className={cn('font-bold text-sm', customer.payment_method === value ? 'text-blue-300' : 'text-slate-300')}>{label}</p>
                          <p className="text-xs text-slate-500">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full py-5 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all"
                    style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                    Revisar agendamento <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMAÇÃO */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <button onClick={() => setStep(3)} className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">Confirmar agendamento</h2>
                  <p className="text-slate-400 text-sm mt-1">Verifique os detalhes antes de finalizar</p>
                </div>

                {/* Services */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Serviços</p>
                  <div className="space-y-1.5">
                    {selectedServices.map((s) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-slate-300 font-medium">{s.name}</span>
                        <span className="font-bold text-blue-400">
                          {s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 flex justify-between font-black" style={{ borderTop: '1px solid rgba(37,99,235,0.2)' }}>
                      <span className="text-slate-300">Total</span>
                      <span className="text-blue-400 text-lg">
                        {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {durationLabel} estimado
                    </p>
                  </div>
                </div>

                {/* Date/time */}
                <div className="p-5 rounded-2xl grid sm:grid-cols-2 gap-3 text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {[
                    { label: 'Data', val: date },
                    { label: 'Horário', val: time },
                    { label: 'Pagamento', val: customer.payment_method === 'local' ? 'No local' : 'Online' },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                      <p className="font-bold text-white">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Client */}
                <div className="p-5 rounded-2xl text-sm space-y-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Cliente & Veículo</p>
                  {[
                    { label: 'Nome', val: customer.customer_name },
                    { label: 'WhatsApp', val: customer.customer_phone },
                    { label: 'E-mail', val: customer.customer_email },
                    { label: 'Veículo', val: `${customer.vehicle_model}${customer.vehicle_plate ? ` — ${customer.vehicle_plate}` : ''}` },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-slate-500 w-20 flex-shrink-0">{label}:</span>
                      <span className="text-slate-300 font-medium">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Address */}
                <div className="p-5 rounded-2xl text-sm" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Endereço</p>
                  <p className="text-slate-300 font-medium">{customer.street}, {customer.number}</p>
                  <p className="text-slate-500 mt-0.5">{customer.neighborhood} — {customer.city}, {customer.state}</p>
                  <p className="text-slate-500">{customer.zip_code}</p>
                  {customer.address_complement && (
                    <p className="text-slate-500 mt-1">{customer.address_complement}</p>
                  )}
                  {customer.notes && (
                    <p className="text-slate-500 mt-1 italic">"{customer.notes}"</p>
                  )}
                </div>

                <button
                  disabled={submitting}
                  onClick={handleConfirm}
                  className="w-full py-5 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: '#2563eb', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                  {submitting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirmando...</>
                    : <><CheckCircle className="w-5 h-5" /> Confirmar Agendamento</>}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
