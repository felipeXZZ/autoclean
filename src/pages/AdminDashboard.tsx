import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Calendar, Building2, Search, Phone, MapPin, Car,
  CheckCircle, X, Loader2, Star, ToggleLeft, ToggleRight, RefreshCw,
  Shield, Zap, TrendingUp, Users,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { getAllAppointments, updateAppointmentStatus, getAdminStats, type AppointmentFilters } from '../services/adminService';
import { getAllCompanies, updateCompany } from '../services/companyService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import type { Appointment, AppointmentStatus, AdminStats, Company } from '../types';

type Tab = 'overview' | 'companies' | 'appointments';

// ── STATS ──
function StatsGrid({ stats, totalCompanies }: { stats: AdminStats; totalCompanies: number }) {
  const cards = [
    { label: 'Empresas ativas', value: totalCompanies, color: 'text-blue-400',    bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.15)' },
    { label: 'Agendamentos',    value: stats.total,     color: 'text-violet-400',  bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.15)' },
    { label: 'Pendentes',       value: stats.pending,   color: 'text-yellow-400',  bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.15)' },
    { label: 'Concluídos',      value: stats.completed, color: 'text-green-400',   bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.15)' },
    { label: 'Receita realizada', value: `R$ ${stats.completed_revenue.toFixed(0)}`, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    { label: 'Cancelados',      value: stats.cancelled, color: 'text-red-400',     bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="p-4 rounded-2xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{c.label}</p>
          <p className={cn('text-2xl font-black', c.color)}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── COMPANIES TAB ──
function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch {
      toast.error('Erro ao carregar empresas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(id: string, field: 'is_active' | 'is_featured' | 'is_verified', current: boolean) {
    setUpdating(id + field);
    try {
      await updateCompany(id, { [field]: !current });
      setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, [field]: !current } : c));
      toast.success('Atualizado!');
    } catch {
      toast.error('Erro ao atualizar.');
    } finally {
      setUpdating(null);
    }
  }

  async function changePlan(id: string, plan: 'free' | 'starter' | 'pro') {
    setUpdating(id + 'plan');
    try {
      await updateCompany(id, { plan });
      setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, plan } : c));
      toast.success('Plano atualizado!');
    } catch {
      toast.error('Erro ao atualizar plano.');
    } finally {
      setUpdating(null);
    }
  }

  const filtered = companies.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Carregando empresas...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <p className="text-sm text-slate-500">{companies.length} empresas cadastradas</p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <button onClick={load} className="p-2 rounded-xl text-slate-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="font-black text-white">{c.name}</p>
                <a href={`/empresa/${c.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">/{c.slug}</a>
                <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full uppercase', c.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' : c.plan === 'starter' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-slate-400')}>
                  {c.plan}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                {(c.city || c.state) && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[c.city, c.state].filter(Boolean).join(', ')}</span>
                )}
                {c.category && <span>{c.category}</span>}
                {c.service_type && <span className="capitalize">{c.service_type}</span>}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {Number(c.rating_avg ?? 0).toFixed(1)} ({c.reviews_count ?? 0})
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
              {/* Plan */}
              <select
                value={c.plan}
                disabled={updating === c.id + 'plan'}
                onChange={(e) => changePlan(c.id, e.target.value as 'free' | 'starter' | 'pro')}
                className="text-xs font-bold px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
              </select>

              {/* Active toggle */}
              <button
                disabled={!!updating}
                onClick={() => toggle(c.id, 'is_active', c.is_active)}
                title={c.is_active ? 'Desativar' : 'Ativar'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: c.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${c.is_active ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  color: c.is_active ? '#4ade80' : '#64748b',
                }}
              >
                {updating === c.id + 'is_active'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : c.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                {c.is_active ? 'Ativa' : 'Inativa'}
              </button>

              {/* Featured toggle */}
              <button
                disabled={!!updating}
                onClick={() => toggle(c.id, 'is_featured', c.is_featured)}
                title={c.is_featured ? 'Remover destaque' : 'Marcar destaque'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: c.is_featured ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${c.is_featured ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: c.is_featured ? '#60a5fa' : '#64748b',
                }}
              >
                {updating === c.id + 'is_featured'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Zap className="w-3.5 h-3.5" />}
                {c.is_featured ? 'Destaque' : 'Destacar'}
              </button>

              {/* Verified toggle */}
              <button
                disabled={!!updating}
                onClick={() => toggle(c.id, 'is_verified', c.is_verified)}
                title={c.is_verified ? 'Remover verificação' : 'Verificar'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: c.is_verified ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${c.is_verified ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  color: c.is_verified ? '#10b981' : '#64748b',
                }}
              >
                {updating === c.id + 'is_verified'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Shield className="w-3.5 h-3.5" />}
                {c.is_verified ? 'Verificada' : 'Verificar'}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>Nenhuma empresa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APPOINTMENTS TAB ──
function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({ status: 'all' });
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments({ ...filters, search, date: dateFilter || undefined });
      setAppointments(data);
    } catch {
      toast.error('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [filters, search, dateFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleStatus(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar por nome, telefone ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <input
          type="date" value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <select
          value={filters.status ?? 'all'}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as AppointmentStatus | 'all' })}
          className="py-2.5 px-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="completed">Concluído</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <button onClick={load} className="p-2.5 rounded-xl text-slate-500 hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Carregando...
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={a.status} />
                  <span className="text-xs font-mono text-slate-500">#{a.id.slice(-8).toUpperCase()}</span>
                  <span className="text-xs text-slate-500">{a.appointment_date} · {a.appointment_time?.slice(0, 5)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.appointment_services?.map((s) => (
                    <span key={s.id} className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa' }}>
                      {s.service_name}
                    </span>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-1.5 text-xs text-slate-400">
                  <span className="font-bold text-white">{a.customer_name}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-blue-400" />{a.customer_phone}</span>
                  <span className="flex items-center gap-1"><Car className="w-3 h-3 text-blue-400" />{a.vehicle_model}</span>
                  <span className="flex items-center gap-1 sm:col-span-2"><MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" /><span className="truncate">{a.address}</span></span>
                </div>
              </div>
              <div className="flex md:flex-col items-center md:items-end gap-3 flex-shrink-0">
                <p className="text-xl font-black text-white">R$ {a.total_price}</p>
                <div className="flex gap-2">
                  <select
                    value={a.status}
                    disabled={updatingId === a.id}
                    onChange={(e) => handleStatus(a.id, e.target.value as AppointmentStatus)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <a
                    href={`https://wa.me/${a.customer_phone?.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    WA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalCompanies, setTotalCompanies] = useState(0);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      getAllCompanies(),
    ]).then(([s, companies]) => {
      setStats(s);
      setTotalCompanies(companies.filter((c) => c.is_active).length);
    }).catch(() => toast.error('Erro ao carregar dados.'))
      .finally(() => setStatsLoading(false));
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',     label: 'Visão Geral',  icon: LayoutDashboard },
    { id: 'companies',    label: 'Empresas',      icon: Building2 },
    { id: 'appointments', label: 'Agendamentos',  icon: Calendar },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12" style={{ background: '#040c1a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Plataforma</p>
          <h1 className="text-3xl font-black text-white">Painel Administrativo</h1>
          <p className="text-slate-500 mt-1">Gestão completa da plataforma AutoClean.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1.5 rounded-2xl mb-8 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                activeTab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

            {activeTab === 'overview' && (
              <div>
                {statsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
                  </div>
                ) : stats ? (
                  <StatsGrid stats={stats} totalCompanies={totalCompanies} />
                ) : null}

                <div className="grid lg:grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Building2,  label: 'Gerencie empresas',    desc: 'Ative/desative, destaque e verifique estéticas.', tab: 'companies' as Tab,    color: '#60a5fa' },
                    { icon: Calendar,   label: 'Todos agendamentos',   desc: 'Veja e atualize agendamentos de toda a plataforma.', tab: 'appointments' as Tab, color: '#34d399' },
                  ].map(({ icon: Icon, label, desc, tab, color }) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div>
                        <p className="font-black text-white">{label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" /> Agendamentos recentes
                  </h2>
                  <AppointmentsTab />
                </div>
              </div>
            )}

            {activeTab === 'companies' && (
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" /> Empresas cadastradas
                </h2>
                <CompaniesTab />
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> Todos os agendamentos
                </h2>
                <AppointmentsTab />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
