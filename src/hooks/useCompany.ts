import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Company } from '../types';

export function useOwnerCompany(userId: string | undefined) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('company_members')
      .select('companies(*)')
      .eq('user_id', userId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCompany(data ? ((data as any).companies as Company) : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { company, loading, refresh: load, hasCompany: !!company };
}
