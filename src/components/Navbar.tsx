import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car, Menu, X, LayoutDashboard, LogOut, Building2, Search,
  UserCircle, ChevronDown, Calendar, Users, Briefcase,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';
import { useAccountMode } from '../contexts/AccountModeContext';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isClientMode, isCompanyMode, switchToClientMode, switchToCompanyMode } = useAccountMode();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';
  const isHome = location.pathname === '/';
  const navBg = scrolled || !isHome ? 'rgba(4,12,26,0.95)' : 'rgba(4,12,26,0.5)';
  const navBorder = scrolled || !isHome ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';

  const modeBadgeStyle = isCompanyMode
    ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
    : { background: 'rgba(37,99,235,0.2)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' };

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

            {isCompanyMode ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors px-3 py-2 rounded-xl hover:bg-violet-500/10">
                <LayoutDashboard className="w-3.5 h-3.5" /> Painel da empresa
              </Link>
            ) : (
              <>
                {user && (
                  <Link
                    to="/meus-agendamentos"
                    className="text-sm font-bold text-white px-4 py-2 rounded-xl transition-all hover:opacity-90"
                    style={{ background: '#2563eb', boxShadow: '0 0 16px rgba(37,99,235,0.35)' }}>
                    Meus agendamentos
                  </Link>
                )}
                {!isCompanyOwner && (
                  <Link
                    to="/para-empresas"
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5">
                    Para empresas
                  </Link>
                )}
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors px-3 py-2 rounded-xl hover:bg-amber-500/10">
                <LayoutDashboard className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User chip — clickable */}
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:opacity-90 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {/* Mode badge */}
                  {isCompanyOwner && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wide" style={modeBadgeStyle}>
                      {isCompanyMode ? 'Empresa' : 'Cliente'}
                    </span>
                  )}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa' }}>
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-300 max-w-[80px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-2xl"
                      style={{
                        background: 'rgba(4,12,26,0.98)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(20px)',
                        width: '272px',
                      }}
                    >
                      {/* User info */}
                      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                            style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
                            {displayName[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{profile?.full_name || displayName}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mode toggle — company owners only */}
                      {isCompanyOwner && (
                        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Modo ativo</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { switchToClientMode(); setDropdownOpen(false); }}
                              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                              style={isClientMode
                                ? { background: 'rgba(37,99,235,0.25)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)' }
                                : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                              }
                            >
                              Cliente
                            </button>
                            <button
                              onClick={() => { switchToCompanyMode(); navigate('/dashboard'); setDropdownOpen(false); }}
                              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                              style={isCompanyMode
                                ? { background: 'rgba(139,92,246,0.25)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                                : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                              }
                            >
                              Empresa
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Context links */}
                      <div className="px-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        {isClientMode && (
                          <>
                            <Link
                              to="/meus-agendamentos"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" /> Meus agendamentos
                            </Link>
                            {!isCompanyOwner && (
                              <Link
                                to="/para-empresas"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                <Briefcase className="w-4 h-4 text-blue-400 flex-shrink-0" /> Cadastrar minha estética
                              </Link>
                            )}
                            {isCompanyOwner && (
                              <button
                                onClick={() => { switchToCompanyMode(); navigate('/dashboard'); setDropdownOpen(false); }}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all w-full text-left">
                                <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" /> Ir para o painel da empresa
                              </button>
                            )}
                          </>
                        )}
                        {isCompanyMode && (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                              <LayoutDashboard className="w-4 h-4 text-violet-400 flex-shrink-0" /> Painel da empresa
                            </Link>
                            <Link
                              to="/dashboard/appointments"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                              <Calendar className="w-4 h-4 text-violet-400 flex-shrink-0" /> Agendamentos recebidos
                            </Link>
                            <Link
                              to="/dashboard/services"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                              <Briefcase className="w-4 h-4 text-violet-400 flex-shrink-0" /> Serviços
                            </Link>
                            <Link
                              to="/dashboard/customers"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                              <Users className="w-4 h-4 text-violet-400 flex-shrink-0" /> Clientes
                            </Link>
                          </>
                        )}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all">
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" /> Admin da plataforma
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="px-2 py-2">
                        <button
                          onClick={() => { onLogout(); setDropdownOpen(false); }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full">
                          <LogOut className="w-4 h-4 flex-shrink-0" /> Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-all px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}>
                <UserCircle className="w-5 h-5 text-slate-400" />
                Entrar / Inscrever-se
              </Link>
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

              {isCompanyMode ? (
                <Link to="/dashboard" className="flex items-center gap-2 text-violet-400 font-bold px-3 py-2.5 rounded-xl hover:bg-violet-500/10 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Painel da empresa
                </Link>
              ) : (
                !isCompanyOwner && (
                  <Link to="/para-empresas" className="block text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                    Para empresas
                  </Link>
                )
              )}

              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 text-amber-400 font-bold px-3 py-2.5 rounded-xl hover:bg-amber-500/10 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}

              {user && isClientMode && (
                <>
                  <Link to="/meus-agendamentos" className="flex items-center gap-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                    <Calendar className="w-4 h-4" /> Meus agendamentos
                  </Link>
                  {!isCompanyOwner && (
                    <Link to="/para-empresas" className="flex items-center gap-2 text-base font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors px-3 py-2.5 rounded-xl">
                      <Users className="w-4 h-4" /> Cadastrar minha estética
                    </Link>
                  )}
                </>
              )}

              {/* Mode toggle mobile */}
              {user && isCompanyOwner && (
                <div className="pt-3 pb-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2">Modo ativo</p>
                  <div className="flex gap-1.5 px-1">
                    <button
                      onClick={() => { switchToClientMode(); setIsMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={isClientMode
                        ? { background: 'rgba(37,99,235,0.25)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      Cliente
                    </button>
                    <button
                      onClick={() => { switchToCompanyMode(); navigate('/dashboard'); setIsMenuOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={isCompanyMode
                        ? { background: 'rgba(139,92,246,0.25)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      Empresa
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-4 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: 'rgba(37,99,235,0.3)', color: '#60a5fa' }}>
                        {displayName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {isCompanyOwner && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wide mb-0.5 inline-block" style={modeBadgeStyle}>
                            {isCompanyMode ? 'Empresa' : 'Cliente'}
                          </span>
                        )}
                        <p className="text-sm font-bold text-white truncate">{profile?.full_name || displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 text-red-400 font-bold px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors w-full">
                      <LogOut className="w-4 h-4" /> Sair da conta
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="w-full text-slate-300 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)' }}>
                    <UserCircle className="w-5 h-5 text-slate-400" />
                    Entrar / Inscrever-se
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
