import { supabase } from '../lib/supabase';
import type { Service, ServiceFormData } from '../types';

export async function getActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Service[]) ?? [];
}

export async function createService(form: ServiceFormData): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert(form)
    .select()
    .single<Service>();

  if (error || !data) throw new Error(error?.message ?? 'Erro ao criar serviço.');
  return data;
}

export async function updateService(id: string, form: Partial<ServiceFormData>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(form)
    .eq('id', id)
    .select()
    .single<Service>();

  if (error || !data) throw new Error(error?.message ?? 'Erro ao atualizar serviço.');
  return data;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
