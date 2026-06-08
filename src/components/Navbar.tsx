import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, LayoutDashboard, LogOut, Building2, Search, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface NavbarProps {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isCompanyOwner: boolean;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar = ({ user, profile, isAdmin, isCompanyOwner, onLogout }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';
  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome ? 'rgba(4,12,26,0.95)' : 'rgba(4,12,26,0.5)';
  const navBorder = scrolled || !isHome ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${navBorder}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 16px rgba(37,99,235,0.5)' }}>
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">AutoClean</span>
          </Link>

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              to="/buscar"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
              <Search className="w-3.5 h-3.5" /> Buscar estéticas
            </Link>
            <Link
              to="/para-empresas"
              className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
              style={{ background: '#2563eb', boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}>
              Para empresas
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-xl hover:bg-blue-500/10">
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                {isCompanyOwner && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-2 rounded-xl hover:bg-blue-500/10">
                    <Building2 className="w-4 h-4" /> Painel da empresa
                  </Link>
                )}
                {!isCompanyOwner && !isAdmin && (
                  <Link
                    to="/meus-agendamentos"
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
                    Meus agendamentos
                  </Link>
                )}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa' }}>
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate">{displayName}</span>
                </div>
                <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl" title="Sair">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-all px-4 py-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}>
                  <UserCircle className="w-5 h-5 text-slate-400" />
                  Entrar / Inscrever-se
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="flex md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(4,12,26,0.98)', backdropFilter: 'blur(20px)' }}>
            <div className="px-4 py-6 space-y-1">
              <Link to="/buscar" className="flex items-center gap-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                <Search className="w-4 h-4" /> Buscar estéticas
              </Link>
              <Link to="/para-empresas" className="block text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                Para empresas
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 text-blue-400 font-bold px-3 py-2.5 rounded-xl hover:bg-blue-500/10 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              {isCompanyOwner && (
                <Link to="/dashboard" className="flex items-center gap-2 text-blue-400 font-bold px-3 py-2.5 rounded-xl hover:bg-blue-500/10 transition-colors">
                  <Building2 className="w-4 h-4" /> Painel da empresa
                </Link>
              )}
              {user && !isCompanyOwner && !isAdmin && (
                <Link to="/meus-agendamentos" className="block text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                  Meus agendamentos
                </Link>
              )}
              <div className="pt-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 px-3">Olá, <span className="text-white font-bold">{displayName}</span></p>
                    <button
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 text-red-400 font-bold px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors w-full">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/login" className="w-full text-slate-300 hover:text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}>
                      <UserCircle className="w-5 h-5 text-slate-400" />
                      Entrar / Inscrever-se
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
