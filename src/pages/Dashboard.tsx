import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Calendar, CheckCircle2, Clock, Copy, ExternalLink,
  DollarSign, AlertCircle, TrendingUp, Wrench,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import { getCompanyAppointments } from '../services/appointmentService';
import { getCompanyAllServices } from '../services/companyService';
import type { Appointment, Service } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24', confirmed: '#60a5fa', completed: '#34d399',
  cancelled: '#f87171', no_show: '#94a3b8',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', completed: 'Concluído',
  cancelled: 'Cancelado', no_show: 'Não compareceu',
};

const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

function KpiCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="p-5 rounded-2xl" style={cardStyle}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export const Dashboard = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!company) return;
    const [appts, svcs] = await Promise.all([
      getCompanyAppointments(company.id),
      getCompanyAllServices(company.id),
    ]);
    setAppointments(appts);
    setServices(svcs);
    setLoading(false);
  }, [company]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const todayAppts     = appointments.filter((a) => a.appointment_date === today);
  const todayRevenue   = todayAppts.filter((a) => a.status === 'completed').reduce((s, a) => s + Number(a.total_price), 0);
  const todayPending   = todayAppts.filter((a) => a.status === 'pending').length;
  const todayDone      = todayAppts.filter((a) => a.status === 'completed').length;

  const monthAppts     = appointments.filter((a) => a.appointment_date >= monthStart);
  const monthRevenue   = monthAppts.filter((a) => a.status === 'completed').reduce((s, a) => s + Number(a.total_price), 0);
  const totalPending   = appointments.filter((a) => a.status === 'pending').length;
  const activeServices = services.filter((s) => s.is_active).length;

  const upcomingAppts = appointments
    .filter((a) => a.appointment_date >= today && ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time))
    .slice(0, 6);

  const bookingLink = `${window.location.origin}/empresa/${company?.slug}/agendar`;

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
          <h1 className="text-2xl font-extrabold text-white">Visão Geral</h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Title */}
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
        <h1 className="text-2xl font-extrabold text-white">Visão Geral</h1>
      </div>

      {/* HOJE */}
      <div className="mb-2">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Hoje</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={Calendar}    label="Agendamentos" value={todayAppts.length}   color="#60a5fa" />
          <KpiCard icon={DollarSign}  label="Receita"      value={todayRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="#34d399" />
          <KpiCard icon={AlertCircle} label="Pendentes"    value={todayPending}        color="#fbbf24" />
          <KpiCard icon={CheckCircle2} label="Concluídos"  value={todayDone}           color="#a78bfa" />
        </div>
      </div>

      {/* ESTE MÊS */}
      <div className="mb-2">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Este mês</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <KpiCard icon={Calendar}    label="Agendamentos"  value={monthAppts.length}   color="#60a5fa" sub="no mês" />
          <KpiCard icon={TrendingUp}  label="Receita mensal" value={monthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} color="#34d399" sub="concluídos" />
          <KpiCard icon={Clock}       label="Em aberto"     value={totalPending}        color="#fbbf24" sub="pendentes totais" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Upcoming appointments */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={cardStyle}>
          <h3 className="text-sm font-extrabold text-white mb-4">Próximos agendamentos</h3>
          {upcomingAppts.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">Nenhum agendamento pendente.</p>
              <p className="text-slate-600 text-xs mt-1">Compartilhe seu link para receber clientes.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-sm truncate">{a.customer_name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {' · '}{a.appointment_time.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: STATUS_COLORS[a.status] }}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    <span className="text-xs font-black text-white">
                      {Number(a.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              ))}
              <Link to="/dashboard/appointments"
                className="block text-center text-xs font-bold text-blue-400 hover:text-blue-300 mt-3 transition-colors">
                Ver todos →
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <div className="p-5 rounded-2xl" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-white">Ações rápidas</h3>
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">{activeServices} serviços</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { icon: Wrench,  label: 'Gerenciar serviços', to: '/dashboard/services', color: '#a78bfa' },
                { icon: Clock,   label: 'Configurar horários', to: '/dashboard/schedule', color: '#60a5fa' },
                { icon: Calendar, label: 'Ver agendamentos',   to: '/dashboard/appointments', color: '#34d399' },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  {label}
                </Link>
              ))}
              <button
                onClick={() => { navigator.clipboard.writeText(bookingLink); toast.success('Link copiado!'); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Copy className="w-4 h-4 flex-shrink-0 text-green-400" />
                Copiar link de agendamento
              </button>
              <Link to={`/empresa/${company?.slug}`} target="_blank"
                className="flex items-center gap-3 p-3 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-blue-400" />
                Ver página pública
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
