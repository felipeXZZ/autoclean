import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, Calendar, Phone, Car, Loader2, MapPin, Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import { getCompanyAppointments, updateAppointmentStatus } from '../services/appointmentService';
import type { Appointment, AppointmentStatus } from '../types';

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

const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const inputCls = 'px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-slate-500';

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export const DashboardAppointments = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter]     = useState('');

  const load = useCallback(async () => {
    const data = await getCompanyAppointments(company.id);
    setAppointments(data);
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, status: string) {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: status as AppointmentStatus } : a)
      );
      toast.success('Status atualizado.');
    } catch { toast.error('Erro ao atualizar status.'); }
  }

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (dateFilter && a.appointment_date !== dateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_phone.includes(q) ||
        a.vehicle_model.toLowerCase().includes(q) ||
        (a.appointment_services?.some((s) => s.service_name.toLowerCase().includes(q)) ?? false)
      );
    }
    return true;
  });

  const buildWhatsApp = (a: Appointment) => {
    const svcs = a.appointment_services?.map((s) => s.service_name).join(', ') ?? '—';
    const date = new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR');
    const msg = `Olá, acabei de realizar um agendamento pelo AutoClean.\n\nServiço: ${svcs}\nData: ${date}\nHorário: ${a.appointment_time.slice(0,5)}\nNome: ${a.customer_name}\nCarro: ${a.vehicle_model}\nEndereço: ${a.address}\nValor: ${Number(a.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    return `https://wa.me/55${a.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
        <h1 className="text-2xl font-extrabold text-white">Agendamentos</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" placeholder="Buscar por nome, telefone, veículo..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-full pl-9`} style={inputStyle} />
        </div>
        <div className="flex gap-2">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            className={`${inputCls} flex-1 sm:flex-none`} style={inputStyle} />
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} w-full pl-9 pr-3`} style={inputStyle}>
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500 mb-3">
        {filtered.length} agendamento{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== appointments.length ? ` de ${appointments.length}` : ''}
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Nenhum agendamento encontrado</p>
          <p className="text-slate-500 text-sm">Compartilhe o link da sua página para começar a receber clientes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <motion.div key={a.id} layout className="p-5 rounded-2xl" style={cardStyle}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-white">{a.customer_name}</p>
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-slate-500 font-mono">#{a.id.slice(-6).toUpperCase()}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {a.appointment_services?.map((s) => (
                      <span key={s.id} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa' }}>
                        {s.service_name}
                      </span>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                      {' · '}{a.appointment_time.slice(0, 5)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-blue-400" /> {a.customer_phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-blue-400" /> {a.vehicle_model}
                      {a.vehicle_plate && <span className="text-slate-600">· {a.vehicle_plate}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span className="truncate">{a.address}</span>
                    </div>
                  </div>

                  {a.notes && <p className="text-xs text-slate-500 italic">"{a.notes}"</p>}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                  <p className="text-lg font-black text-white">
                    {Number(a.total_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <a href={buildWhatsApp(a)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-green-400 px-2.5 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </a>
                    <select value={a.status}
                      onChange={(e) => changeStatus(a.id, e.target.value)}
                      className="text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
