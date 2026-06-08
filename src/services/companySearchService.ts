import { supabase } from '../lib/supabase';
import type { Company, Service } from '../types';

export interface SearchFilters {
  query?: string;
  city?: string;
  state?: string;
  category?: string;
  serviceType?: string;
  minRating?: number;
  featuredOnly?: boolean;
}

export async function searchCompanies(filters: SearchFilters = {}): Promise<Company[]> {
  let q = supabase.from('companies').select('*').eq('is_active', true);

  if (filters.query) {
    const term = filters.query.replace(/'/g, "''");
    q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`);
  }
  if (filters.city) q = q.ilike('city', `%${filters.city}%`);
  if (filters.state) q = q.eq('state', filters.state);
  if (filters.category) q = q.ilike('category', `%${filters.category}%`);
  if (filters.serviceType && filters.serviceType !== 'todos') {
    if (filters.serviceType === 'both') {
      // no extra filter — both means any
    } else {
      q = q.in('service_type', [filters.serviceType, 'both']);
    }
  }
  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    q = q.gte('rating_avg', filters.minRating);
  }
  if (filters.featuredOnly) q = q.eq('is_featured', true);

  const { data } = await q
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(60);

  return (data as Company[]) ?? [];
}

export async function getFeaturedCompanies(limit = 6): Promise<Company[]> {
  const { data: featured } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('rating_avg', { ascending: false })
    .limit(limit);

  if (featured && featured.length > 0) return featured as Company[];

  const { data: fallback } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (fallback as Company[]) ?? [];
}

export async function getCompaniesByCity(city: string, limit = 20): Promise<Company[]> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .ilike('city', `%${city}%`)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(limit);
  return (data as Company[]) ?? [];
}

export async function getCompaniesByService(service: string, limit = 20): Promise<Company[]> {
  const term = service.replace(/'/g, "''");
  const { data: serviceRows } = await supabase
    .from('services')
    .select('company_id')
    .eq('is_active', true)
    .or(`name.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`);

  if (!serviceRows || serviceRows.length === 0) return [];

  const ids = [...new Set(serviceRows.map((r) => r.company_id as string))];

  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .in('id', ids)
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .limit(limit);

  return (data as Company[]) ?? [];
}

export async function getPopularCities(): Promise<{ city: string; state: string; count: number }[]> {
  const { data } = await supabase
    .from('companies')
    .select('city, state')
    .eq('is_active', true)
    .not('city', 'is', null);

  if (!data) return [];

  const counts: Record<string, { city: string; state: string; count: number }> = {};
  for (const row of data) {
    if (!row.city) continue;
    const key = (row.city as string).toLowerCase().trim();
    if (counts[key]) {
      counts[key].count += 1;
    } else {
      counts[key] = { city: row.city as string, state: (row.state as string) ?? '', count: 1 };
    }
  }

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

export async function getCompanyMinPrice(companyId: string): Promise<number> {
  const { data } = await supabase
    .from('services')
    .select('price')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('price', { ascending: true })
    .limit(1);
  if (!data || data.length === 0) return 0;
  return Number((data[0] as { price: number }).price) ?? 0;
}

export async function getCompaniesWithMinPrice(companies: Company[]): Promise<(Company & { minPrice: number })[]> {
  if (companies.length === 0) return [];
  const ids = companies.map((c) => c.id);

  const { data } = await supabase
    .from('services')
    .select('company_id, price')
    .in('company_id', ids)
    .eq('is_active', true)
    .order('price', { ascending: true });

  const minMap: Record<string, number> = {};
  if (data) {
    for (const row of data as { company_id: string; price: number }[]) {
      if (!(row.company_id in minMap)) {
        minMap[row.company_id] = Number(row.price);
      }
    }
  }

  return companies.map((c) => ({ ...c, minPrice: minMap[c.id] ?? 0 }));
}
