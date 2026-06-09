import type { User } from '@supabase/supabase-js';

export type { User };

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'client' | 'company_owner' | 'admin';
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  cover_url?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  is_delivery: boolean;
  service_type: 'delivery' | 'local' | 'both';
  delivery_description?: string;
  category?: string;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  rating_avg: number;
  reviews_count: number;
  plan: 'free' | 'starter' | 'pro';
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'staff';
  created_at: string;
}

export interface Service {
  id: string;
  company_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentMethod = 'online' | 'local';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface AppointmentService {
  id: string;
  appointment_id: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration_minutes: number;
}

export interface Appointment {
  id: string;
  company_id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_model: string;
  vehicle_plate?: string;
  address: string;
  address_complement?: string;
  notes?: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_price: number;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
  appointment_services?: AppointmentService[];
  companies?: {
    id: string;
    name: string;
    whatsapp?: string;
    phone?: string;
  };
}

export interface BusinessHours {
  id: string;
  company_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_interval_minutes: number;
  max_appointments_per_slot?: number;
  is_active: boolean;
}

export interface BlockedSlot {
  id: string;
  company_id: string;
  blocked_date: string;
  blocked_time?: string;
  reason?: string;
  created_at: string;
}

export interface Review {
  id: string;
  company_id: string;
  appointment_id?: string;
  user_id?: string;
  customer_name?: string;
  rating: number;
  comment?: string;
  is_visible: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan: 'free' | 'starter' | 'pro';
  status: 'active' | 'cancelled' | 'trial' | 'expired';
  price_monthly?: number;
  starts_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  estimated_revenue: number;
  completed_revenue: number;
}

export interface CreateAppointmentInput {
  company_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_model: string;
  vehicle_plate?: string;
  address: string;
  address_complement?: string;
  notes?: string;
  appointment_date: string;
  appointment_time: string;
  payment_method: PaymentMethod;
  total_price: number;
  total_duration_minutes: number;
  user_id?: string;
  services: { id: string; name: string; price: number; duration_minutes: number }[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone: string;
  created_at: string;
  updated_at: string;
}
