import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Wrench, Clock, Users, Building2,
  ExternalLink, LogOut, Copy, ChevronRight, Loader2, Menu, X, Car,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useOwnerCompany } from '../../hooks/useCompany';
import type { Company } from '../../types';
import type { User } from '@supabase/supabase-js';

export interface DashboardContext {
  user: User;
  company: Company;
  isAdmin: boolean;
  refreshCompany: () => Promise<void>;
}

const NAV_ITEMS = [
  { to: '/dashboard',              label: 'Visão Geral',    icon: LayoutDashboard, end: true },
  { to: '/dashboard/appointments', label: 'Agendamentos',   icon: Calendar },
  { to: '/dashboard/services',     label: 'Serviços',       icon: Wrench },
  { to: '/dashboard/schedule',     label: 'Horários',       icon: Clock },
  { to: '/dashboard/customers',    label: 'Clientes',       icon: Users },
  { to: '/dashboard/company',      label: 'Minha estética', icon: Building2 },
];

function Sidebar({
  company, onLogout, mobile, onClose,
}: {
  company: Company | null;
  onLogout: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();

  return (
    <aside
      className="flex flex-col h-full"
      style={{ background: '#03060f', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-tight">AutoClean</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Company info */}
      {company && (
        <div
          className="mx-3 mb-4 p-3 rounded-xl"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Empresa</p>
          <p className="text-sm font-black text-white truncate">{company.name}</p>
          <p className="text-xs text-slate-500 truncate">/empresa/{company.slug}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            {location.pathname === to && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-1">
        {company && (
          <>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/empresa/${company.slug}`);
                toast.success('Link copiado!');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Copy className="w-4 h-4 flex-shrink-0" />
              Copiar link
            </button>
            <Link
              to={`/empresa/${company.slug}`}
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              Ver página pública
            </Link>
          </>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, isCompanyOwner, loading: authLoading, signOut } = useAuth();
  const { company, loading: companyLoading, refresh } = useOwnerCompany(user?.id);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!authLoading && !companyLoading && user && !company && !isAdmin && !isCompanyOwner) {
      navigate('/');
    }
  }, [authLoading, companyLoading, user, company, isAdmin, isCompanyOwner, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success('Até logo!');
    navigate('/');
  };

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060b18' }}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!company && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center" style={{ background: '#060b18' }}>
        <p className="text-white font-black text-lg">Nenhuma estética encontrada</p>
        <p className="text-slate-400 text-sm max-w-xs">
          Seus dados de empresa não foram localizados. Crie sua estética para acessar o painel.
        </p>
        <Link to="/onboarding"
          className="mt-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
          Criar estética
        </Link>
        <button onClick={handleLogout} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          Sair
        </button>
      </div>
    );
  }

  const context: DashboardContext = {
    user,
    company: company!,
    isAdmin,
    refreshCompany: refresh,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060b18' }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 flex-shrink-0 flex-col h-full">
        <Sidebar company={company} onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col h-full z-50">
            <Sidebar company={company} onLogout={handleLogout} mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 h-14 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,11,24,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-sm font-black text-white truncate">
              {company?.name ?? 'Painel'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {company && (
              <Link
                to={`/empresa/${company.slug}`}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-500/10">
                <ExternalLink className="w-3.5 h-3.5" />
                Ver página
              </Link>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
              {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet context={context} />
        </main>
      </div>
    </div>
  );
};
