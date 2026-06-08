import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Phone, Mail, Users, Calendar, DollarSign } from 'lucide-react';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import { getCompanyCustomersSummary, type CustomerSummary } from '../services/companyService';

const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

export const DashboardCustomers = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  const load = useCallback(async () => {
    const data = await getCompanyCustomersSummary(company.id);
    setCustomers(data);
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
        <h1 className="text-2xl font-extrabold text-white">Clientes</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users,    label: 'Total de clientes', value: customers.length,  color: '#60a5fa' },
          { icon: Calendar, label: 'Agendamentos',       value: customers.reduce((s, c) => s + c.total_appointments, 0), color: '#a78bfa' },
          { icon: DollarSign, label: 'Receita realizada', value: customers.reduce((s, c) => s + c.total_spent, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: '#34d399' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 rounded-2xl" style={cardStyle}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text" placeholder="Buscar por nome, telefone ou e-mail..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-sm focus:outline-none placeholder-slate-500"
          style={inputStyle}
        />
      </div>

      <p className="text-xs text-slate-500 mb-3">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Nenhum cliente encontrado</p>
          <p className="text-slate-500 text-sm">Os clientes aparecem aqui conforme os agendamentos são recebidos.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Cliente</span>
            <span>Contato</span>
            <span className="text-center">Agendamentos</span>
            <span className="text-right">Total gasto</span>
          </div>

          {filtered.map((c, i) => (
            <div key={i} className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center p-4 rounded-2xl" style={cardStyle}>
              {/* Name + avatar */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #2563eb44, #4f46e544)' }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    Último: {new Date(c.last_appointment + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Phone className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <a href={`https://wa.me/55${c.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                    className="hover:text-green-400 transition-colors">
                    {c.phone}
                  </a>
                </div>
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="w-3 h-3 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
              </div>

              {/* Appointments count */}
              <div className="sm:text-center">
                <span
                  className="text-sm font-black px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(37,99,235,0.12)', color: '#60a5fa' }}>
                  {c.total_appointments}× agend.
                </span>
              </div>

              {/* Revenue */}
              <div className="sm:text-right">
                <p className="text-sm font-black text-white">
                  {c.total_spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-slate-500">realizados</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
