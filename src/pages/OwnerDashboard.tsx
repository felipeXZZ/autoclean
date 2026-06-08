import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Calendar, Wrench, Clock, Building2, Plus, Trash2, Edit3, Check,
  X, Phone, ChevronDown, Loader2, ExternalLink, TrendingUp, Users, CheckCircle2,
  AlertCircle, Save,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

import { useOwnerCompany } from '../hooks/useCompany';
import {
  getCompanyAllServices, getCompanyBusinessHours,
  createService, updateService, deleteService,
  upsertBusinessHours, updateCompany,
} from '../services/companyService';
import { getCompanyAppointments, updateAppointmentStatus } from '../services/appointmentService';
import type { Appointment, Service, BusinessHours, Company, ServiceFormData } from '../types';

interface Props { user: User }

type Tab = 'overview' | 'appointments' | 'services' | 'hours' | 'company';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído',
  cancelled: 'Cancelado', no_show: 'Não compareceu',
};
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24' },
  confirmed: { bg: 'rgba(37,99,235,0.12)',   text: '#60a5fa' },
  completed: { bg: 'rgba(16,185,129,0.12)',  text: '#34d399' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   text: '#f87171' },
  no_show:   { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8' },
};

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const CATEGORIES = ['Lavagem', 'Higienização', 'Polimento', 'Proteção', 'Técnico', 'Geral'];

const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' };
const inputCls  = 'w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-slate-500 focus:border-blue-500';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

// ─── Sub-components ───────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl" style={cardStyle}>
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-black" style={{ color: color ?? 'white' }}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function ApptStatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────

export const OwnerDashboard = ({ user }: Props) => {
  const navigate = useNavigate();
  const { company, loading: companyLoading, refresh } = useOwnerCompany(user.id);

  const [tab, setTab]                   = useState<Tab>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices]         = useState<Service[]>([]);
  const [hours, setHours]               = useState<BusinessHours[]>([]);
  const [loading, setLoading]           = useState(false);

  // Service form
  const [svcForm, setSvcForm]       = useState<ServiceFormData & { id?: string } | null>(null);
  const [svcLoading, setSvcLoading] = useState(false);

  // Company form
  const [companyForm, setCompanyForm]   = useState<Partial<Company>>({});
  const [companyEditing, setCompanyEditing] = useState(false);
  const [companySaving, setCompanySaving]   = useState(false);

  // Appointment filters
  const [apptFilter, setApptFilter] = useState('all');
  const [apptSearch, setApptSearch] = useState('');

  const loadData = useCallback(async (c: Company) => {
    setLoading(true);
    const [appts, svcs, bh] = await Promise.all([
      getCompanyAppointments(c.id),
      getCompanyAllServices(c.id),
      getCompanyBusinessHours(c.id),
    ]);
    setAppointments(appts);
    setServices(svcs);
    setHours(bh);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (company) {
      loadData(company);
      setCompanyForm(company);
    }
  }, [company, loadData]);

  // Redirect if no company
  useEffect(() => {
    if (!companyLoading && !company) navigate('/criar-empresa');
  }, [companyLoading, company, navigate]);

  if (companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060b18' }}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }
  if (!company) return null;

  // ── Stats ──
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.appointment_date === today);
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const completedRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((s, a) => s + Number(a.total_price), 0);
  const estimatedRevenue = appointments
    .filter((a) => ['pending', 'confirmed'].includes(a.status))
    .reduce((s, a) => s + Number(a.total_price), 0);

  // ── Appointment actions ──
  async function changeStatus(id: string, status: string) {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: status as Appointment['status'] } : a));
      toast.success('Status atualizado.');
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  }

  // ── Service actions ──
  function openNewService() {
    setSvcForm({ name: '', description: '', price: 0, duration_minutes: 60, category: 'Geral', is_active: true, is_featured: false });
  }

  function openEditService(svc: Service) {
    setSvcForm({
      id: svc.id,
      name: svc.name,
      description: svc.description,
      price: svc.price,
      duration_minutes: svc.duration_minutes,
      category: svc.category,
      is_active: svc.is_active,
      is_featured: svc.is_featured,
    });
  }

  async function saveService() {
    if (!svcForm || !company) return;
    setSvcLoading(true);
    try {
      if (svcForm.id) {
        await updateService(svcForm.id, { ...svcForm });
      } else {
        await createService({ ...svcForm, company_id: company.id });
      }
      toast.success(svcForm.id ? 'Serviço atualizado.' : 'Serviço criado.');
      setSvcForm(null);
      const svcs = await getCompanyAllServices(company.id);
      setServices(svcs);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar serviço.');
    } finally {
      setSvcLoading(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Excluir este serviço?')) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success('Serviço excluído.');
    } catch {
      toast.error('Erro ao excluir serviço.');
    }
  }

  // ── Business hours ──
  function setHourField(weekday: number, field: keyof BusinessHours, value: string | boolean | number) {
    setHours((prev) => {
      const exists = prev.find((h) => h.weekday === weekday);
      if (exists) return prev.map((h) => h.weekday === weekday ? { ...h, [field]: value } : h);
      return [...prev, {
        id: '',
        company_id: company.id,
        weekday,
        start_time: '08:00',
        end_time: '18:00',
        slot_interval_minutes: 60,
        is_active: false,
        [field]: value,
      }];
    });
  }

  async function saveHours() {
    try {
      await upsertBusinessHours(hours.map(({ id: _id, ...h }) => h));
      toast.success('Horários salvos.');
      const bh = await getCompanyBusinessHours(company.id);
      setHours(bh);
    } catch {
      toast.error('Erro ao salvar horários.');
    }
  }

  // ── Company profile ──
  async function saveCompanyProfile() {
    setCompanySaving(true);
    try {
      await updateCompany(company.id, companyForm);
      await refresh();
      setCompanyEditing(false);
      toast.success('Perfil atualizado.');
    } catch {
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setCompanySaving(false);
    }
  }

  // ── Filtered appointments ──
  const filteredAppts = appointments.filter((a) => {
    if (apptFilter !== 'all' && a.status !== apptFilter) return false;
    if (apptSearch) {
      const q = apptSearch.toLowerCase();
      return (
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_phone.includes(q) ||
        a.vehicle_model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview',     label: 'Visão Geral',    icon: LayoutDashboard },
    { key: 'appointments', label: 'Agendamentos',   icon: Calendar },
    { key: 'services',     label: 'Serviços',        icon: Wrench },
    { key: 'hours',        label: 'Horários',        icon: Clock },
    { key: 'company',      label: 'Empresa',         icon: Building2 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20" style={{ background: '#060b18' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-6">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel da empresa</p>
            <h1 className="text-3xl font-extrabold text-white">{company.name}</h1>
          </div>
          <Link
            to={`/empresa/${company.slug}`}
            target="_blank"
            className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Ver página pública <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-8 overflow-x-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: tab === key ? 'rgba(37,99,235,0.2)' : 'transparent',
                color: tab === key ? '#60a5fa' : '#64748b',
                border: tab === key ? '1px solid rgba(37,99,235,0.3)' : '1px solid transparent',
              }}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {loading && tab !== 'company' ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Hoje" value={todayAppts.length} sub="agendamentos" color="#60a5fa" />
                  <StatCard label="Pendentes" value={pendingCount} color="#fbbf24" />
                  <StatCard label="Receita realizada" value={completedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="#34d399" />
                  <StatCard label="A receber" value={estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="#a78bfa" />
                </div>

                {/* Today's appointments */}
                <div className="p-6 rounded-2xl mb-6" style={cardStyle}>
                  <h3 className="text-lg font-extrabold text-white mb-4">Agendamentos de hoje</h3>
                  {todayAppts.length === 0 ? (
                    <p className="text-slate-500 text-sm">Nenhum agendamento para hoje.</p>
                  ) : (
                    <div className="space-y-3">
                      {todayAppts.map((a) => (
                        <div key={a.id} className="flex items-center justify-between gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{a.customer_name}</p>
                            <p className="text-sm text-slate-400">{a.appointment_time.slice(0, 5)} · {a.vehicle_model}</p>
                            <p className="text-xs text-slate-500">{a.appointment_services?.map((s) => s.service_name).join(', ')}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ApptStatusBadge status={a.status} />
                            <span className="text-sm font-black text-white">
                              {Number(a.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick metrics */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <p className="font-bold text-white">Total</p>
                    </div>
                    <p className="text-3xl font-black text-white">{appointments.length}</p>
                    <p className="text-xs text-slate-500 mt-1">agendamentos no total</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <p className="font-bold text-white">Concluídos</p>
                    </div>
                    <p className="text-3xl font-black text-white">
                      {appointments.filter((a) => a.status === 'completed').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">atendimentos realizados</p>
                  </div>
                  <div className="p-5 rounded-2xl" style={cardStyle}>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <p className="font-bold text-white">Serviços</p>
                    </div>
                    <p className="text-3xl font-black text-white">{services.filter((s) => s.is_active).length}</p>
                    <p className="text-xs text-slate-500 mt-1">serviços ativos</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── APPOINTMENTS ── */}
            {tab === 'appointments' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Buscar por nome, telefone ou veículo..."
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    className={`${inputCls} flex-1`}
                    style={inputStyle}
                  />
                  <select
                    value={apptFilter}
                    onChange={(e) => setApptFilter(e.target.value)}
                    className={inputCls}
                    style={{ ...inputStyle, width: '160px' }}>
                    <option value="all">Todos</option>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {filteredAppts.length === 0 && (
                    <p className="text-slate-500 text-center py-12">Nenhum agendamento encontrado.</p>
                  )}
                  {filteredAppts.map((a) => (
                    <div key={a.id} className="p-5 rounded-2xl" style={cardStyle}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-black text-white">{a.customer_name}</p>
                            <ApptStatusBadge status={a.status} />
                          </div>
                          <p className="text-sm text-slate-400 mb-1">
                            {a.appointment_date} · {a.appointment_time.slice(0, 5)} · {a.vehicle_model}
                            {a.vehicle_plate ? ` (${a.vehicle_plate})` : ''}
                          </p>
                          <p className="text-sm text-blue-400 font-medium">
                            {a.appointment_services?.map((s) => s.service_name).join(' + ') || '—'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{a.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <p className="text-lg font-black text-white">
                            {Number(a.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          <div className="flex gap-2">
                            {a.customer_phone && (
                              <a
                                href={`https://wa.me/55${a.customer_phone.replace(/\D/g, '')}`}
                                target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-green-400 px-2.5 py-1.5 rounded-lg transition-all hover:bg-green-500/10">
                                <Phone className="w-3.5 h-3.5" /> WhatsApp
                              </a>
                            )}
                            <select
                              value={a.status}
                              onChange={(e) => changeStatus(a.id, e.target.value)}
                              className="text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer transition-colors"
                              style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── SERVICES ── */}
            {tab === 'services' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {/* Service form modal */}
                {svcForm && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="w-full max-w-md p-6 rounded-3xl" style={cardStyle}>
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-extrabold text-white">
                          {svcForm.id ? 'Editar serviço' : 'Novo serviço'}
                        </h3>
                        <button onClick={() => setSvcForm(null)} className="text-slate-500 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome</label>
                          <input type="text" value={svcForm.name}
                            onChange={(e) => setSvcForm((p) => p ? { ...p, name: e.target.value } : p)}
                            className={inputCls} style={inputStyle} placeholder="Nome do serviço" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                          <textarea rows={2} value={svcForm.description}
                            onChange={(e) => setSvcForm((p) => p ? { ...p, description: e.target.value } : p)}
                            className={`${inputCls} resize-none`} style={inputStyle} placeholder="Breve descrição" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Preço (R$)</label>
                            <input type="number" min={0} step={0.01} value={svcForm.price}
                              onChange={(e) => setSvcForm((p) => p ? { ...p, price: Number(e.target.value) } : p)}
                              className={inputCls} style={inputStyle} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Duração (min)</label>
                            <input type="number" min={15} step={15} value={svcForm.duration_minutes}
                              onChange={(e) => setSvcForm((p) => p ? { ...p, duration_minutes: Number(e.target.value) } : p)}
                              className={inputCls} style={inputStyle} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                          <select value={svcForm.category}
                            onChange={(e) => setSvcForm((p) => p ? { ...p, category: e.target.value } : p)}
                            className={inputCls} style={inputStyle}>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="isActive" checked={svcForm.is_active}
                            onChange={(e) => setSvcForm((p) => p ? { ...p, is_active: e.target.checked } : p)}
                            className="w-4 h-4 rounded accent-blue-600" />
                          <label htmlFor="isActive" className="text-sm text-slate-300 font-medium">Serviço ativo</label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setSvcForm(null)}
                          className="flex-1 py-3 rounded-xl font-bold text-slate-400 transition-all"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          Cancelar
                        </button>
                        <button onClick={saveService} disabled={svcLoading || !svcForm.name}
                          className="flex-1 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                          style={{ background: '#2563eb' }}>
                          {svcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-white">Serviços</h2>
                  <button
                    onClick={openNewService}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
                    style={{ background: '#2563eb' }}>
                    <Plus className="w-4 h-4" /> Novo serviço
                  </button>
                </div>

                <div className="space-y-3">
                  {services.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500">Nenhum serviço cadastrado.</p>
                      <button onClick={openNewService} className="text-blue-400 font-bold hover:text-blue-300 mt-2 transition-colors">
                        Adicionar primeiro serviço
                      </button>
                    </div>
                  )}
                  {services.map((svc) => (
                    <div key={svc.id} className="flex items-center justify-between gap-3 p-5 rounded-2xl" style={cardStyle}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-white">{svc.name}</p>
                          {!svc.is_active && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(100,116,139,0.12)', color: '#94a3b8' }}>
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{svc.category} · {svc.duration_minutes} min</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="text-lg font-black text-white">
                          {Number(svc.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <button onClick={() => openEditService(svc)}
                          className="p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteService(svc.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── HOURS ── */}
            {tab === 'hours' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-white">Horários de funcionamento</h2>
                  <button
                    onClick={saveHours}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
                    style={{ background: '#2563eb' }}>
                    <Save className="w-4 h-4" /> Salvar horários
                  </button>
                </div>

                <div className="space-y-3">
                  {WEEKDAY_NAMES.map((name, weekday) => {
                    const h = hours.find((x) => x.weekday === weekday);
                    const active = h?.is_active ?? false;
                    return (
                      <div key={weekday} className="flex items-center gap-4 p-5 rounded-2xl" style={cardStyle}>
                        <button
                          onClick={() => setHourField(weekday, 'is_active', !active)}
                          className={`flex-shrink-0 w-11 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`} />
                        </button>
                        <p className="w-24 font-bold text-white text-sm flex-shrink-0">{name}</p>
                        {active ? (
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <input
                              type="time"
                              value={h?.start_time ?? '08:00'}
                              onChange={(e) => setHourField(weekday, 'start_time', e.target.value)}
                              className="px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none"
                              style={inputStyle}
                            />
                            <span className="text-slate-500 text-sm">até</span>
                            <input
                              type="time"
                              value={h?.end_time ?? '18:00'}
                              onChange={(e) => setHourField(weekday, 'end_time', e.target.value)}
                              className="px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none"
                              style={inputStyle}
                            />
                            <div className="flex items-center gap-1.5">
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                              <select
                                value={h?.slot_interval_minutes ?? 60}
                                onChange={(e) => setHourField(weekday, 'slot_interval_minutes', Number(e.target.value))}
                                className="px-2 py-1.5 rounded-lg text-sm text-white focus:outline-none"
                                style={inputStyle}>
                                {[30, 45, 60, 90, 120].map((v) => (
                                  <option key={v} value={v}>{v} min</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">Fechado</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── COMPANY PROFILE ── */}
            {tab === 'company' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-white">Perfil da empresa</h2>
                  {!companyEditing ? (
                    <button
                      onClick={() => setCompanyEditing(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                      <Edit3 className="w-4 h-4" /> Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCompanyEditing(false); setCompanyForm(company); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-slate-400 text-sm transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <X className="w-4 h-4" /> Cancelar
                      </button>
                      <button
                        onClick={saveCompanyProfile}
                        disabled={companySaving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50"
                        style={{ background: '#2563eb' }}>
                        {companySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                {/* Link público */}
                <div
                  className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
                  <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Link público da empresa</p>
                    <p className="text-white font-bold truncate">/empresa/{company.slug}</p>
                  </div>
                  <Link
                    to={`/empresa/${company.slug}`}
                    target="_blank"
                    className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">
                    Visitar →
                  </Link>
                </div>

                <div className="p-6 rounded-2xl space-y-5" style={cardStyle}>
                  {([
                    { key: 'name', label: 'Nome da empresa', type: 'text' },
                    { key: 'description', label: 'Descrição', type: 'textarea' },
                    { key: 'phone', label: 'Telefone', type: 'tel' },
                    { key: 'whatsapp', label: 'WhatsApp', type: 'tel' },
                    { key: 'email', label: 'E-mail', type: 'email' },
                    { key: 'city', label: 'Cidade', type: 'text' },
                    { key: 'state', label: 'Estado (UF)', type: 'text' },
                    { key: 'address', label: 'Endereço', type: 'text' },
                    { key: 'website', label: 'Site', type: 'url' },
                    { key: 'delivery_description', label: 'Descrição do atendimento delivery', type: 'textarea' },
                  ] as const).map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
                      {companyEditing ? (
                        type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={(companyForm as Record<string, string>)[key] ?? ''}
                            onChange={(e) => setCompanyForm((p) => ({ ...p, [key]: e.target.value }))}
                            className={`${inputCls} resize-none`}
                            style={inputStyle}
                          />
                        ) : (
                          <input
                            type={type}
                            value={(companyForm as Record<string, string>)[key] ?? ''}
                            onChange={(e) => setCompanyForm((p) => ({ ...p, [key]: e.target.value }))}
                            className={inputCls}
                            style={inputStyle}
                          />
                        )
                      ) : (
                        <p className="text-white font-medium text-sm">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(company as any)[key] ? String((company as any)[key]) : '—'}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* is_delivery toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Atendimento</label>
                    {companyEditing ? (
                      <div className="flex gap-3">
                        {[
                          { val: true, label: 'Delivery' },
                          { val: false, label: 'Loja física' },
                        ].map(({ val, label }) => (
                          <button
                            key={String(val)}
                            type="button"
                            onClick={() => setCompanyForm((p) => ({ ...p, is_delivery: val }))}
                            className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{
                              background: companyForm.is_delivery === val ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${companyForm.is_delivery === val ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`,
                              color: companyForm.is_delivery === val ? '#60a5fa' : '#64748b',
                            }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white font-medium text-sm">{company.is_delivery ? 'Delivery' : 'Loja física'}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </>
        )}
      </div>
    </div>
  );
};
