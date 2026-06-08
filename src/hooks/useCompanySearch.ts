import { useState, useCallback, useEffect, useRef } from 'react';
import { searchCompanies, type SearchFilters } from '../services/companySearchService';
import type { Company } from '../types';

export function useCompanySearch(initialFilters: SearchFilters = {}) {
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const search = useCallback(async (override?: SearchFilters) => {
    const f = override ?? filters;
    setLoading(true);
    try {
      const data = await searchCompanies(f);
      if (mountedRef.current) setResults(data);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => { search(); }, [search]);

  function updateFilters(updates: Partial<SearchFilters>) {
    setFilters((prev) => ({ ...prev, ...updates }));
  }

  return { results, loading, filters, updateFilters, search };
}
