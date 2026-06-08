import { supabase } from '../lib/supabase';
import type { Company, Service, Review, BusinessHours } from '../types';

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single<Company>();
  return data ?? null;
}

export async function getCompanyServices(companyId: string): Promise<Service[]> {
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('category')
    .order('name');
  return (data as Service[]) ?? [];
}

export async function getCompanyAllServices(companyId: string): Promise<Service[]> {
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('company_id', companyId)
    .order('category')
    .order('name');
  return (data as Service[]) ?? [];
}

export async function getCompanyReviews(companyId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data as Review[]) ?? [];
}

export async function getCompanyBusinessHours(companyId: string): Promise<BusinessHours[]> {
  const { data } = await supabase
    .from('business_hours')
    .select('*')
    .eq('company_id', companyId)
    .order('weekday');
  return (data as BusinessHours[]) ?? [];
}

export async function getOwnerCompany(userId: string): Promise<Company | null> {
  const { data } = await supabase
    .from('company_members')
    .select('companies(*)')
    .eq('user_id', userId)
    .single();
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any).companies as Company) ?? null;
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  return !data;
}

export async function createCompany(
  input: {
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    is_delivery?: boolean;
    service_type?: 'delivery' | 'local' | 'both';
    category?: string;
  },
  userId: string
): Promise<Company> {
  const { data: company, error } = await supabase
    .from('companies')
    .insert(input)
    .select()
    .single<Company>();

  if (error || !company) throw new Error(error?.message ?? 'Erro ao criar empresa.');

  const { error: memberError } = await supabase
    .from('company_members')
    .insert({ company_id: company.id, user_id: userId, role: 'owner' });

  if (memberError) throw new Error(memberError.message);

  await supabase
    .from('profiles')
    .update({ role: 'company_owner' })
    .eq('id', userId);

  // Default business hours Mon–Sat
  const defaultHours = [1, 2, 3, 4, 5, 6].map((day) => ({
    company_id: company.id,
    weekday: day,
    start_time: '08:00',
    end_time: day === 6 ? '14:00' : '18:00',
    slot_interval_minutes: 60,
    max_appointments_per_slot: 1,
    is_active: true,
  }));
  await supabase.from('business_hours').insert(defaultHours);

  // Seed starter services
  const starterServices = [
    { name: 'Lavagem Simples',      description: 'Lavagem externa completa do veículo.',               price: 80,  duration_minutes: 45,  category: 'Lavagem',      is_featured: false },
    { name: 'Lavagem Completa',     description: 'Lavagem externa e interna com aspiração.',            price: 120, duration_minutes: 90,  category: 'Lavagem',      is_featured: true  },
    { name: 'Higienização Interna', description: 'Higienização profunda do interior do veículo.',       price: 250, duration_minutes: 180, category: 'Higienização', is_featured: false },
    { name: 'Polimento Técnico',    description: 'Polimento para remoção de riscos e oxidação.',        price: 500, duration_minutes: 240, category: 'Polimento',    is_featured: false },
    { name: 'Vitrificação',         description: 'Proteção cerâmica de longa duração para a pintura.',  price: 800, duration_minutes: 360, category: 'Proteção',     is_featured: false },
  ];
  await supabase.from('services').insert(
    starterServices.map((s) => ({ ...s, company_id: company.id, is_active: true }))
  );

  return company;
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<void> {
  const { error } = await supabase.from('companies').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createService(
  data: Omit<Service, 'id' | 'created_at' | 'updated_at'>
): Promise<Service> {
  const { data: svc, error } = await supabase
    .from('services')
    .insert(data)
    .select()
    .single<Service>();
  if (error || !svc) throw new Error(error?.message ?? 'Erro ao criar serviço.');
  return svc;
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  const { error } = await supabase.from('services').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function upsertBusinessHours(hours: Omit<BusinessHours, 'id'>[]): Promise<void> {
  const { error } = await supabase
    .from('business_hours')
    .upsert(hours, { onConflict: 'company_id,weekday' });
  if (error) throw new Error(error.message);
}

export async function getAllCompanies(): Promise<Company[]> {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });
  return (data as Company[]) ?? [];
}

export interface CustomerSummary {
  name: string;
  phone: string;
  email: string;
  total_appointments: number;
  total_spent: number;
  last_appointment: string;
}

export async function getCompanyCustomersSummary(companyId: string): Promise<CustomerSummary[]> {
  const { data } = await supabase
    .from('appointments')
    .select('customer_name, customer_phone, customer_email, total_price, appointment_date, status')
    .eq('company_id', companyId)
    .order('appointment_date', { ascending: false });

  if (!data) return [];

  const map = new Map<string, CustomerSummary>();

  for (const a of data) {
    const key = a.customer_phone;
    const spent = a.status === 'completed' ? Number(a.total_price) : 0;
    const existing = map.get(key);
    if (existing) {
      existing.total_appointments += 1;
      existing.total_spent += spent;
    } else {
      map.set(key, {
        name: a.customer_name,
        phone: a.customer_phone,
        email: a.customer_email ?? '',
        total_appointments: 1,
        total_spent: spent,
        last_appointment: a.appointment_date,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total_appointments - a.total_appointments);
}
