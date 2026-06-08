import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'motion/react';
import { Car } from 'lucide-react';

import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { MyAppointments } from './pages/MyAppointments';
import { AdminDashboard } from './pages/AdminDashboard';
import { CompanyPage } from './pages/CompanyPage';
import { CompanyBookingPage } from './pages/CompanyBookingPage';
import { BuscarPage } from './pages/BuscarPage';
import { CidadePage } from './pages/CidadePage';
import { ServicoPagina } from './pages/ServicoPagina';
import { ParaEmpresas } from './pages/ParaEmpresas';

// New full-screen dashboard system
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { DashboardCompany } from './pages/DashboardCompany';
import { DashboardServices } from './pages/DashboardServices';
import { DashboardSchedule } from './pages/DashboardSchedule';
import { DashboardAppointments } from './pages/DashboardAppointments';
import { DashboardCustomers } from './pages/DashboardCustomers';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Footer = () => (
  <footer style={{ background: '#03060f', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 16px rgba(37,99,235,0.4)' }}>
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">AutoClean</span>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
            Plataforma de agendamento online para estéticas automotivas. Lava-rápidos, detailers e serviços delivery.
          </p>
        </div>
        <div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Para clientes</p>
          <ul className="space-y-3">
            {[
              { label: 'Buscar estéticas', href: '/buscar' },
              { label: 'Entrar', href: '/login' },
              { label: 'Cadastrar', href: '/register' },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-slate-500 hover:text-white transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Para empresas</p>
          <ul className="space-y-3">
            {[
              { label: 'Cadastrar estética', href: '/para-empresas' },
              { label: 'Painel da empresa', href: '/dashboard' },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-slate-500 hover:text-white transition-colors">{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Contato</p>
          <ul className="space-y-3">
            <li className="text-sm text-slate-500">Suporte à plataforma</li>
            <li>
              <a href="https://wa.me/5511999999999"
                className="text-sm text-green-500 hover:text-green-400 transition-colors font-medium"
                target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li className="text-sm text-slate-500">Seg–Sex 08h–18h</li>
          </ul>
        </div>
      </div>
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-600"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p>© {new Date().getFullYear()} AutoClean Plataforma. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">Termos</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Privacidade</a>
        </div>
      </div>
    </div>
  </footer>
);

// Routes that render a full-screen layout (no global Navbar/Footer)
const FULLSCREEN_PATHS = ['/dashboard', '/onboarding'];

function AppContent() {
  const { user, profile, isAdmin, isCompanyOwner, loading, signOut, refreshProfile } = useAuth();
  const { pathname } = useLocation();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Até logo!');
    } catch {
      toast.error('Erro ao sair.');
    }
  };

  const isFullscreen = FULLSCREEN_PATHS.some((p) => pathname.startsWith(p));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060b18' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black text-blue-600 animate-pulse tracking-widest uppercase text-xs">Carregando</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

      {!isFullscreen && (
        <Navbar
          user={user}
          profile={profile}
          isAdmin={isAdmin}
          isCompanyOwner={isCompanyOwner}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        />
      )}

      <main>
        <AnimatePresence mode="sync">
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/login"    element={user ? <Navigate to={isAdmin || isCompanyOwner ? '/dashboard' : '/'} /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to={isCompanyOwner ? '/dashboard' : '/'} /> : <Register />} />

            {/* ── Onboarding ── */}
            <Route
              path="/onboarding"
              element={user ? <Onboarding user={user} onCompanyCreated={refreshProfile} /> : <Navigate to="/login" />}
            />

            {/* ── Owner dashboard (nested, full-screen layout) ── */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index             element={<Dashboard />} />
              <Route path="company"      element={<DashboardCompany />} />
              <Route path="services"     element={<DashboardServices />} />
              <Route path="schedule"     element={<DashboardSchedule />} />
              <Route path="appointments" element={<DashboardAppointments />} />
              <Route path="customers"    element={<DashboardCustomers />} />
            </Route>

            {/* ── Legacy redirects ── */}
            <Route path="/criar-empresa" element={<Navigate to="/onboarding" replace />} />
            <Route path="/agendar"       element={<Navigate to="/" replace />} />

            {/* ── Marketplace ── */}
            <Route path="/buscar"           element={<BuscarPage />} />
            <Route path="/cidade/:city"     element={<CidadePage />} />
            <Route path="/servico/:service" element={<ServicoPagina />} />
            <Route path="/para-empresas"    element={<ParaEmpresas />} />

            {/* ── Public company pages ── */}
            <Route path="/empresa/:slug"         element={<CompanyPage />} />
            <Route path="/empresa/:slug/agendar" element={<CompanyBookingPage user={user} profile={profile} />} />

            {/* ── Client ── */}
            <Route path="/meus-agendamentos" element={<MyAppointments user={user} />} />

            {/* ── Platform admin ── */}
            <Route
              path="/admin"
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
            />
          </Routes>
        </AnimatePresence>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

const App = () => (
  <Router>
    <ScrollToTop />
    <AppContent />
  </Router>
);

export default App;
