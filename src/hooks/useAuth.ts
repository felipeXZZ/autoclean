import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isCompanyOwner: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isCompanyOwner: false,
  });

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single<Profile>();
    return data ?? null;
  }

  function resolveAdmin(profile: Profile | null, user: User | null): boolean {
    return profile?.role === 'admin' || user?.email === 'phelippes593@gmail.com';
  }

  function resolveCompanyOwner(profile: Profile | null, user: User | null): boolean {
    if (resolveAdmin(profile, user)) return false;
    return profile?.role === 'company_owner';
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      const profile = user ? await fetchProfile(user.id) : null;
      setState({
        user,
        session,
        profile,
        loading: false,
        isAdmin: resolveAdmin(profile, user),
        isCompanyOwner: resolveCompanyOwner(profile, user),
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      const profile = user ? await fetchProfile(user.id) : null;
      setState({
        user,
        session,
        profile,
        loading: false,
        isAdmin: resolveAdmin(profile, user),
        isCompanyOwner: resolveCompanyOwner(profile, user),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'client',
      });
    }

    return { data, error };
  }

  async function refreshProfile() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setState(prev => ({
      ...prev,
      profile,
      isAdmin: resolveAdmin(profile, user),
      isCompanyOwner: resolveCompanyOwner(profile, user),
    }));
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  return { ...state, signIn, signUp, signOut, refreshProfile, isPlatformAdmin: state.isAdmin };
}
