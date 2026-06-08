import { supabase } from '../lib/supabase';
import type { Appointment, AdminStats, AppointmentStatus, BusinessHours } from '../types';

export interface AppointmentFilters {
  status?: AppointmentStatus | 'all';
  date?: string;
  search?: string;
}

export async function getAllAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select('*, appointment_services(*)')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.date) {
    query = query.eq('appointment_date', filters.date);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data as Appointment[]) ?? [];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (a) =>
        a.customer_name?.toLowerCase().includes(s) ||
        a.customer_phone?.toLowerCase().includes(s) ||
        a.vehicle_model?.toLowerCase().includes(s) ||
        a.address?.toLowerCase().includes(s) ||
        a.appointment_services?.some((svc) => svc.service_name?.toLowerCase().includes(s))
    );
  }

  return results;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase
    .from('appointments')
    .select('status, total_price');

  if (error) throw new Error(error.message);

  const all = data ?? [];
  return {
    total: all.length,
    pending: all.filter((a) => a.status === 'pending').length,
    confirmed: all.filter((a) => a.status === 'confirmed').length,
    completed: all.filter((a) => a.status === 'completed').length,
    cancelled: all.filter((a) => a.status === 'cancelled').length,
    no_show: all.filter((a) => a.status === 'no_show').length,
    estimated_revenue: all
      .filter((a) => a.status !== 'cancelled')
      .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
    completed_revenue: all
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (a.total_price ?? 0), 0),
  };
}

export async function getBusinessHours(): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .order('weekday', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as BusinessHours[]) ?? [];
}

export async function updateBusinessHours(id: string, updates: Partial<BusinessHours>): Promise<void> {
  const { error } = await supabase
    .from('business_hours')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}
