import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Mail, Lock, User, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (name.trim().length < 2) { toast.error('Informe seu nome completo.'); return; }
        const { error } = await signUp(email, password, name.trim());
        if (error) throw error;
        toast.success('Conta criada com sucesso!');
        navigate(redirectTo, { replace: true });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message ?? '';
      if (msg.includes('Invalid login credentials')) toast.error('E-mail ou senha incorretos.');
      else if (msg.includes('User already registered')) toast.error('Este e-mail já possui conta.');
      else if (msg.includes('Password should be')) toast.error('A senha deve ter pelo menos 6 caracteres.');
      else toast.error(msg || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#060b18' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 0 32px rgba(37,99,235,0.35)' }}>
            <Car className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Criar Conta' : 'Área do Cliente'}
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            {isRegister
              ? 'Junte-se à revolução da limpeza automotiva.'
              : 'Entre para gerenciar seus agendamentos.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  required type="text" placeholder="Nome completo"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-colors placeholder-slate-500"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required type="email" placeholder="Seu e-mail"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white text-sm outline-none transition-colors placeholder-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                required type={showPass ? 'text' : 'password'} placeholder="Sua senha (mín. 6 caracteres)"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 rounded-xl text-white text-sm outline-none transition-colors placeholder-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              disabled={loading} type="submit"
              className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
              style={{ background: '#2563eb', boxShadow: '0 0 24px rgba(37,99,235,0.35)' }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? 'Criar Conta' : 'Entrar Agora'}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isRegister ? 'Já possui conta?' : 'Ainda não é cliente?'}
            <button onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
              {isRegister ? 'Fazer login' : 'Criar conta gratuita'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
