import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        if (name.trim().length < 2) { toast.error('Informe seu nome completo.'); return; }
        const { error } = await signUp(email, password, name.trim());
        if (error) throw error;
        toast.success('Conta criada! Vamos configurar sua estética.');
        navigate('/onboarding');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Bem-vindo de volta!');
        navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 pt-24 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800 transition-colors">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100 dark:shadow-none">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isRegister ? 'Criar Conta' : 'Área do Cliente'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {isRegister
              ? 'Junte-se à revolução da limpeza automotiva.'
              : 'Entre para gerenciar seus agendamentos.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                required type="text" placeholder="Nome completo"
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-medium text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              required type="email" placeholder="Seu e-mail"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              required type={showPass ? 'text' : 'password'} placeholder="Sua senha (mín. 6 caracteres)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl focus:border-blue-600 outline-none transition-all font-medium text-slate-900 dark:text-white"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            disabled={loading} type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 dark:shadow-none disabled:opacity-50 mt-2">
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

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isRegister ? 'Já possui conta?' : 'Ainda não é cliente?'}
            <button onClick={() => setIsRegister(!isRegister)}
              className="ml-2 text-blue-600 font-bold hover:underline">
              {isRegister ? 'Fazer login' : 'Criar conta gratuita'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
