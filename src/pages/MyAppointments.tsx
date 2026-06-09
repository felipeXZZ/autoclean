import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Car, User, Phone, X, Loader2, CreditCard, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { useAppointments } from '../hooks/useAppointments';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import { useAccountMode } from '../contexts/AccountModeContext';

interface MyAppointmentsProps {
  user: SupabaseUser | null;
}

function waLink(booking: { id: string; companies?: { whatsapp?: string; phone?: string } }): string {
  const raw = booking.companies?.whatsapp ?? booking.companies?.phone ?? '';
  const digits = raw.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : digits ? `55${digits}` : '';
  const text = encodeURIComponent(`Olá! Preciso de ajuda com meu agendamento #${booking.id.slice(-8).toUpperCase()}`);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export const MyAppointments = ({ user }: MyAppointmentsProps) => {
  const { appointments, loading, cancel } = useAppointments(user?.id);
  const { isCompanyMode, switchToClientMode } = useAccountMode();
  const [cancelling, setCancelling] = useState<string | null>(null);

  if (user && isCompanyMode) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-violet-100 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40">
            <Building2 className="w-10 h-10 text-violet-500 dark:text-violet-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Você está no modo Empresa</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Para ver seus agendamentos como cliente, altere para o modo Cliente no menu do usuário.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={switchToClientMode}
              className="block bg-blue-600 text-white py-3.5 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
              Mudar para modo Cliente
            </button>
            <a
              href="/dashboard"
              className="block bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-3.5 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800">
              Ir para o painel da empresa
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Acesse sua conta</h2>
          <p className="text-slate-500 dark:text-slate-400">Você precisa estar logado para ver seus agendamentos.</p>
          <a href="/login" className="block bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  async function handleCancel(id: string) {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    setCancelling(id);
    try {
      await cancel(id);
      toast.success('Agendamento cancelado.');
    } catch {
      toast.error('Erro ao cancelar. Tente novamente.');
    } finally {
      setCancelling(null);
    }
  }

  const stats = {
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="dark min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Meus Agendamentos</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Acompanhe e gerencie seus serviços.</p>
          </div>
          {!loading && (
            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
              {appointments.length} {appointments.length === 1 ? 'REGISTRO' : 'REGISTROS'}
            </div>
          )}
        </div>

        {/* Stats cards */}
        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Pendentes</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.pending}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Confirmados</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.confirmed}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-xs font-bold text-green-500 uppercase tracking-wide">Concluídos</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.completed}</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Cancelados</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.cancelled}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nenhum agendamento</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Você ainda não agendou nenhum serviço.</p>
            <a href="/agendar"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
              Agendar Agora
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {appointments.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={booking.status} />
                      <span className="text-xs font-mono text-slate-400">#{booking.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white flex-shrink-0">
                      R$ {booking.total_price}
                    </p>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {booking.appointment_services?.map((s) => (
                        <span key={s.id}
                          className="text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
                          {s.service_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">{booking.appointment_date} às {booking.appointment_time?.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Car className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium truncate">{booking.vehicle_model}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{booking.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium capitalize">
                        {booking.payment_method === 'local' ? 'Pagamento no local' : 'Pagamento online'}
                      </span>
                    </div>
                    {booking.companies?.name && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="font-medium truncate">{booking.companies.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-50 dark:border-slate-800 flex-wrap">
                    <a
                      href={waLink(booking)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" /> Precisa de ajuda?
                    </a>

                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                        className="ml-auto text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 transition-colors">
                        {cancelling === booking.id
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelando...</>
                          : <><X className="w-4 h-4" /> Cancelar</>
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};
