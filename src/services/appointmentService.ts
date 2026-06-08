import { supabase } from '../lib/supabase';
import type { Appointment, CreateAppointmentInput, BusinessHours } from '../types';

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    current += intervalMinutes;
  }
  return slots;
}

export async function getAvailableSlots(date: string, companyId: string): Promise<string[]> {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();

  const { data: bh } = await supabase
    .from('business_hours')
    .select('*')
    .eq('company_id', companyId)
    .eq('weekday', dayOfWeek)
    .eq('is_active', true)
    .single<BusinessHours>();

  if (!bh) return [];

  const allSlots = generateTimeSlots(bh.start_time, bh.end_time, bh.slot_interval_minutes);

  const { data: booked } = await supabase
    .rpc('get_company_booked_slots', { p_company_id: companyId, p_date: date });

  const { data: blocked } = await supabase
    .from('blocked_slots')
    .select('blocked_time')
    .eq('company_id', companyId)
    .eq('blocked_date', date);

  const bookedTimes = new Set([
    ...(booked?.map((b: { appointment_time: string }) => b.appointment_time?.slice(0, 5)) ?? []),
    ...(blocked?.map((b: { blocked_time?: string }) => b.blocked_time?.slice(0, 5)).filter(Boolean) ?? []),
  ]);

  return allSlots.filter((slot) => !bookedTimes.has(slot));
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const { services, ...appointmentData } = input;

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error } = await supabase.from('appointments').insert({
    id: newId,
    ...appointmentData,
    status: 'pending',
    payment_status: 'pending',
  });

  if (error) throw new Error(error.message ?? 'Erro ao criar agendamento.');

  const serviceRows = services.map((s) => ({
    appointment_id: newId,
    service_id: s.id,
    service_name: s.name,
    service_price: s.price,
    service_duration_minutes: s.duration_minutes,
  }));

  const { error: svcError } = await supabase.from('appointment_services').insert(serviceRows);

  if (svcError) {
    await supabase.from('appointments').delete().eq('id', newId);
    throw new Error(svcError.message);
  }

  return {
    id: newId,
    ...appointmentData,
    status: 'pending',
    payment_status: 'pending',
    created_at: now,
    updated_at: now,
    appointment_services: serviceRows.map((s, idx) => ({
      id: `${newId}-${idx}`,
      appointment_id: newId,
      service_id: s.service_id ?? '',
      service_name: s.service_name,
      service_price: s.service_price,
      service_duration_minutes: s.service_duration_minutes,
    })),
  } as Appointment;
}

export async function getUserAppointments(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, appointment_services(*)')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Appointment[]) ?? [];
}

export async function getCompanyAppointments(companyId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, appointment_services(*)')
    .eq('company_id', companyId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Appointment[]) ?? [];
}

export async function updateAppointmentStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
