import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle, ChevronRight, ArrowLeft, Clock, MapPin, Phone,
  Car, User, Mail, FileText, CreditCard, Wallet, Loader2, Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { useServices } from '../hooks/useServices';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import { cn } from '../lib/utils';
import {
  onlyNumbers, formatPhoneBR, formatCep, formatPlate,
  isValidPhoneBR, isValidPlate, fetchAddressByCep,
} from '../lib/bookingUtils';
import type { Service, Profile, PaymentMethod } from '../types';

interface BookingPageProps {
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

const CATEGORY_COLORS: Record<string, string> = {
  Lavagem:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  Higienização: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Técnico:      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  Polimento:    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  Proteção:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Serviços', 'Data & Hora', 'Seus Dados', 'Confirmação'];
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, i) => {
          const step = i + 1;
          const done = current > step;
          const active = current === step;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                done ? 'bg-blue-600 text-white' :
                active ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40' :
                'bg-slate-200 dark:bg-slate-800 text-slate-400'
              )}>
                {done ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              <span className={cn('text-[10px] font-bold uppercase tracking-wider hidden sm:block',
                active ? 'text-blue-600' : 'text-slate-400')}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / (total - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
        />
      </div>
    </div>
  );
}

export const BookingPage = ({ user, profile }: BookingPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { services, loading: servicesLoading } = useServices();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const [createdId, setCreatedId] = useState('');

  useEffect(() => {
    const passed = location.state?.service as Service | undefined;
    if (passed) {
      setSelectedServices([{
        id: passed.id,
        name: passed.name,
        price: passed.price,
        duration_minutes: passed.duration_minutes,
      }]);
    }
  }, [location.state]);

  useEffect(() => {
    if (profile) {
      setCustomer((prev) => ({
        ...prev,
        customer_name: prev.customer_name || profile.full_name,
        customer_phone: prev.customer_phone || (profile.phone ? formatPhoneBR(profile.phone) : ''),
      }));
    }
    if (user?.email) {
      setCustomer((prev) => ({ ...prev, customer_email: prev.customer_email || user.email! }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (!date) { setAvailableSlots([]); setTime(''); return; }
    setLoadingSlots(true);
    setTime('');
    getAvailableSlots(date, '')
      .then(setAvailableSlots)
      .catch(() => { toast.error('Erro ao buscar horários.'); setAvailableSlots([]); })
      .finally(() => setLoadingSlots(false));
  }, [date]);

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

  const totalPrice = selectedServices.reduce((s, svc) => s + svc.price, 0);
  const totalMinutes = selectedServices.reduce((s, svc) => s + svc.duration_minutes, 0);
  const totalDurationLabel = totalMinutes >= 60
    ? `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60 ? ` ${totalMinutes % 60}min` : ''}`
    : `${totalMinutes}min`;

  function toggleService(svc: Service) {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === svc.id);
      if (exists) return prev.filter((s) => s.id !== svc.id);
      return [...prev, { id: svc.id, name: svc.name, price: svc.price, duration_minutes: svc.duration_minutes }];
    });
  }

  function handleCustomer(field: keyof CustomerData, value: string) {
    if (field === 'zip_code') setCepError('');
    setErrors((prev) => ({ ...prev, [field]: '' }));
    let processed = value;
    if (field === 'customer_phone') processed = formatPhoneBR(value);
    else if (field === 'zip_code') processed = formatCep(value);
    else if (field === 'vehicle_plate') processed = formatPlate(value);
    setCustomer((prev) => ({ ...prev, [field]: processed }));
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
    setSubmitting(true);
    try {
      const appointment = await createAppointment({
        company_id: '',
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
      setCreatedId(appointment.id);
      setStep(5);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar agendamento.');
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappText = encodeURIComponent(
    `Olá! Acabei de agendar na AutoClean:\n\n` +
    `*Serviços:* ${selectedServices.map((s) => s.name).join(', ')}\n` +
    `*Total:* R$ ${totalPrice}\n` +
    `*Data:* ${date}\n` +
    `*Horário:* ${time}\n` +
    `*Endereço:* ${composedAddress}`
  );

  const today = format(new Date(), 'yyyy-MM-dd');

  const fieldCls = (field: string) => cn(
    'w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl focus:border-blue-600 outline-none text-slate-900 dark:text-white font-medium transition-all',
    errors[field] ? 'border-red-500' : 'border-transparent'
  );

  // ── STEP 5: SUCCESS ──
  if (step === 5) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Agendado!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2">
            Seu agendamento foi registrado com sucesso.
          </p>
          <p className="text-xs text-slate-400 font-mono mb-8">#{createdId.slice(-8).toUpperCase()}</p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-left space-y-2 mb-8 text-sm">
            <div className="flex gap-2 items-start">
              <Car className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedServices.map((s) => s.name).join(' + ')}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{date} às {time}</span>
            </div>
            <div className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{composedAddress}</span>
            </div>
            <div className="flex gap-2 items-center">
              <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-black text-base">R$ {totalPrice}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all">
              Voltar ao Início
            </button>
            {user && (
              <button onClick={() => navigate('/meus-agendamentos')}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Ver Meus Agendamentos
              </button>
            )}
            <a
              href={`https://wa.me/5511999999999?text=${whatsappText}`}
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 text-green-600 font-bold hover:underline py-2">
              <Phone className="w-4 h-4" /> Confirmar via WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Agendar Serviço</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Profissionais vão até você. Rápido, fácil e sem sair de casa.</p>
        </div>

        <StepIndicator current={step} total={4} />

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: SERVIÇOS ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">O que faremos hoje?</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Escolha um ou mais serviços</p>
                  </div>
                  {totalPrice > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-2xl font-black text-blue-600">R$ {totalPrice}</p>
                      <p className="text-xs text-slate-400">{totalDurationLabel}</p>
                    </div>
                  )}
                </div>

                {servicesLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {services.map((svc) => {
                      const selected = !!selectedServices.find((s) => s.id === svc.id);
                      return (
                        <button key={svc.id} onClick={() => toggleService(svc)}
                          className={cn(
                            'p-5 border-2 rounded-2xl text-left transition-all relative group',
                            selected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-800/50'
                          )}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              CATEGORY_COLORS[svc.category] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            )}>
                              {svc.category}
                            </span>
                            <div className={cn(
                              'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                              selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'
                            )}>
                              {selected && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <h3 className={cn('font-extrabold text-base mb-1', selected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white')}>
                            {svc.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{svc.description}</p>
                          <div className="flex items-center justify-between">
                            <span className={cn('text-xl font-black', selected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white')}>
                              R$ {svc.price}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
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
                  className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none">
                  Continuar <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: DATA & HORA ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline mb-3">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Quando podemos ir?</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Escolha a data e o horário disponível</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Data
                  </label>
                  <input type="date" min={today}
                    value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none text-slate-900 dark:text-white font-medium transition-all"
                  />
                </div>

                {date && (
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Horários Disponíveis
                    </label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-slate-500 py-4">
                        <Loader2 className="w-5 h-5 animate-spin" /> Buscando horários...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                        Não há horários disponíveis nessa data. Tente outro dia.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button key={slot} onClick={() => setTime(slot)}
                            className={cn(
                              'py-3 rounded-xl font-bold text-sm transition-all border-2',
                              time === slot
                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600'
                            )}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={!date || !time}
                  onClick={() => setStep(3)}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none">
                  Continuar <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: DADOS DO CLIENTE ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline mb-3">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Seus dados</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Preencha onde seu carro está e como entrar em contato</p>

                <form onSubmit={(e) => { e.preventDefault(); if (validateStep3()) setStep(4); }} className="space-y-4">

                  {/* Linha 1: Nome + WhatsApp */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <User className="w-3 h-3 inline mr-1" /> Nome completo
                      </label>
                      <input type="text" placeholder="Seu nome"
                        value={customer.customer_name}
                        onChange={(e) => handleCustomer('customer_name', e.target.value)}
                        className={fieldCls('customer_name')}
                      />
                      {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <Phone className="w-3 h-3 inline mr-1" /> WhatsApp
                      </label>
                      <input type="tel" placeholder="(11) 99999-9999"
                        value={customer.customer_phone}
                        onChange={(e) => handleCustomer('customer_phone', e.target.value)}
                        className={fieldCls('customer_phone')}
                      />
                      {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>}
                    </div>
                  </div>

                  {/* Linha 2: E-mail + Modelo */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <Mail className="w-3 h-3 inline mr-1" /> E-mail
                      </label>
                      <input type="email" placeholder="seu@email.com"
                        value={customer.customer_email}
                        onChange={(e) => handleCustomer('customer_email', e.target.value)}
                        className={fieldCls('customer_email')}
                      />
                      {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <Car className="w-3 h-3 inline mr-1" /> Modelo do carro
                      </label>
                      <input type="text" placeholder="Ex: Toyota Corolla 2022"
                        value={customer.vehicle_model}
                        onChange={(e) => handleCustomer('vehicle_model', e.target.value)}
                        className={fieldCls('vehicle_model')}
                      />
                      {errors.vehicle_model && <p className="text-red-500 text-xs mt-1">{errors.vehicle_model}</p>}
                    </div>
                  </div>

                  {/* Linha 3: Placa + CEP */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Placa <span className="text-slate-300 dark:text-slate-600 font-medium normal-case">(opcional)</span>
                      </label>
                      <input type="text" placeholder="ABC1D23"
                        value={customer.vehicle_plate}
                        onChange={(e) => handleCustomer('vehicle_plate', e.target.value)}
                        className={fieldCls('vehicle_plate')}
                      />
                      {errors.vehicle_plate && <p className="text-red-500 text-xs mt-1">{errors.vehicle_plate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        <MapPin className="w-3 h-3 inline mr-1" /> CEP
                      </label>
                      <div className="relative">
                        <input type="text" placeholder="00000-000"
                          value={customer.zip_code}
                          onChange={(e) => handleCustomer('zip_code', e.target.value)}
                          className={fieldCls('zip_code')}
                        />
                        {fetchingCep && (
                          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
                      {!cepError && errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}
                    </div>
                  </div>

                  {/* Linha 4: Rua + Número */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Rua
                      </label>
                      <input type="text" placeholder="Nome da rua"
                        value={customer.street}
                        onChange={(e) => handleCustomer('street', e.target.value)}
                        className={fieldCls('street')}
                      />
                      {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                    </div>
                    <div className="sm:w-36">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Número
                      </label>
                      <input type="text" placeholder="123 ou S/N"
                        value={customer.number}
                        onChange={(e) => handleCustomer('number', e.target.value)}
                        className={fieldCls('number')}
                      />
                      {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number}</p>}
                    </div>
                  </div>

                  {/* Linha 5: Bairro + Cidade + Estado */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Bairro
                      </label>
                      <input type="text" placeholder="Bairro"
                        value={customer.neighborhood}
                        onChange={(e) => handleCustomer('neighborhood', e.target.value)}
                        className={fieldCls('neighborhood')}
                      />
                      {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Cidade
                      </label>
                      <input type="text" placeholder="Cidade"
                        value={customer.city}
                        onChange={(e) => handleCustomer('city', e.target.value)}
                        className={fieldCls('city')}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                        Estado
                      </label>
                      <input type="text" placeholder="UF" maxLength={2}
                        value={customer.state}
                        onChange={(e) => handleCustomer('state', e.target.value.toUpperCase())}
                        className={fieldCls('state')}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  {/* Complemento */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      Complemento <span className="text-slate-300 dark:text-slate-600 font-medium normal-case">(opcional)</span>
                    </label>
                    <input type="text" placeholder="Apto, bloco, portaria, ponto de referência"
                      value={customer.address_complement}
                      onChange={(e) => handleCustomer('address_complement', e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 outline-none text-slate-900 dark:text-white font-medium transition-all"
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      <FileText className="w-3 h-3 inline mr-1" /> Observações <span className="text-slate-300 dark:text-slate-600 font-medium normal-case">(opcional)</span>
                    </label>
                    <textarea rows={2} placeholder="Algum detalhe específico do carro ou instrução de acesso?"
                      value={customer.notes}
                      onChange={(e) => handleCustomer('notes', e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-xl focus:border-blue-600 outline-none text-slate-900 dark:text-white font-medium transition-all resize-none"
                    />
                  </div>

                  {/* Pagamento */}
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                      <CreditCard className="w-3 h-3 inline mr-1" /> Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'local', label: 'No local', sub: 'Pague ao profissional', icon: Wallet },
                        { value: 'online', label: 'Online', sub: 'PIX / Cartão', icon: CreditCard },
                      ].map(({ value, label, sub, icon: Icon }) => (
                        <button key={value} type="button"
                          onClick={() => handleCustomer('payment_method', value as PaymentMethod)}
                          className={cn(
                            'p-4 border-2 rounded-xl text-left transition-all',
                            customer.payment_method === value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                          )}>
                          <Icon className={cn('w-5 h-5 mb-2', customer.payment_method === value ? 'text-blue-600' : 'text-slate-400')} />
                          <p className={cn('font-bold text-sm', customer.payment_method === value ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300')}>{label}</p>
                          <p className="text-xs text-slate-400">{sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none">
                    Revisar Agendamento <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 4: CONFIRMAÇÃO ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline mb-3">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Confirmar agendamento</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verifique os detalhes antes de finalizar</p>
                </div>

                <div className="space-y-3">
                  {/* Services */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-5">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Serviços</p>
                    <div className="space-y-1">
                      {selectedServices.map((s) => (
                        <div key={s.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                          <span className="font-bold text-blue-700 dark:text-blue-400">R$ {s.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-blue-200 dark:border-blue-800 mt-2 pt-2 flex justify-between font-black">
                        <span className="text-slate-700 dark:text-slate-300">Total</span>
                        <span className="text-blue-700 dark:text-blue-400 text-lg">R$ {totalPrice}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Duração estimada: {totalDurationLabel}
                      </p>
                    </div>
                  </div>

                  {/* Date / Time */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 grid sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                      <p className="font-bold text-slate-900 dark:text-white">{date}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Horário</p>
                      <p className="font-bold text-slate-900 dark:text-white">{time}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento</p>
                      <p className="font-bold text-slate-900 dark:text-white capitalize">
                        {customer.payment_method === 'local' ? 'No local' : 'Online'}
                      </p>
                    </div>
                  </div>

                  {/* Client + Vehicle */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-sm space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cliente & Veículo</p>
                    {[
                      { label: 'Nome', val: customer.customer_name },
                      { label: 'WhatsApp', val: customer.customer_phone },
                      { label: 'E-mail', val: customer.customer_email },
                      { label: 'Veículo', val: customer.vehicle_model + (customer.vehicle_plate ? ` — ${customer.vehicle_plate}` : '') },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-slate-400 w-20 flex-shrink-0">{label}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{val || '—'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 text-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Endereço</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {customer.street}, {customer.number}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {customer.neighborhood} — {customer.city}, {customer.state}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{customer.zip_code}</p>
                    {customer.address_complement && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1">{customer.address_complement}</p>
                    )}
                    {customer.notes && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1 italic">"{customer.notes}"</p>
                    )}
                  </div>
                </div>

                <button
                  disabled={submitting}
                  onClick={handleConfirm}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none disabled:opacity-50">
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Confirmando...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Confirmar Agendamento</>
                  )}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
