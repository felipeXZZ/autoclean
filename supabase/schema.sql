-- ============================================================
-- AutoClean SaaS — Multi-tenant Schema v3
-- Run entirely in Supabase SQL Editor (reset + rebuild)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- CLEAN SLATE (dev reset)
-- ============================================================
drop table if exists appointment_services  cascade;
drop table if exists appointments          cascade;
drop table if exists blocked_slots         cascade;
drop table if exists business_hours        cascade;
drop table if exists professionals         cascade;
drop table if exists reviews               cascade;
drop table if exists subscriptions         cascade;
drop table if exists customers             cascade;
drop table if exists services              cascade;
drop table if exists company_members       cascade;
drop table if exists companies             cascade;
drop table if exists profiles              cascade;

drop function if exists is_admin()                            cascade;
drop function if exists is_platform_admin()                   cascade;
drop function if exists is_company_member(uuid)               cascade;
drop function if exists get_booked_slots(date)                cascade;
drop function if exists get_company_booked_slots(uuid, date)  cascade;
drop function if exists handle_new_user()                     cascade;
drop function if exists update_updated_at()                   cascade;

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null default '',
  full_name   text not null default '',
  phone       text,
  avatar_url  text,
  role        text not null default 'client'
                check (role in ('client', 'company_owner', 'admin')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- COMPANIES  (SaaS tenant root)
-- ============================================================
create table companies (
  id                   uuid    primary key default gen_random_uuid(),
  name                 text    not null,
  slug                 text    not null unique,
  logo_url             text,
  cover_url            text,
  description          text,
  phone                text,
  whatsapp             text,
  email                text,
  address              text,
  city                 text,
  state                text,
  zip                  text,
  website              text,
  is_delivery          boolean not null default true,
  service_type         text    not null default 'delivery'
                         check (service_type in ('delivery', 'local', 'both')),
  delivery_description text,
  category             text    default 'estética automotiva',
  is_active            boolean not null default true,
  plan                 text    not null default 'free'
                         check (plan in ('free', 'starter', 'pro')),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ============================================================
-- COMPANY_MEMBERS  (owner → company link)
-- ============================================================
create table company_members (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'owner'
                check (role in ('owner', 'manager', 'staff')),
  created_at  timestamptz default now(),
  unique(company_id, user_id)
);

-- ============================================================
-- SERVICES  (per company)
-- ============================================================
create table services (
  id               uuid    primary key default gen_random_uuid(),
  company_id       uuid    not null references companies(id) on delete cascade,
  name             text    not null,
  description      text    default '',
  price            numeric(10,2) not null default 0,
  duration_minutes integer not null default 60,
  category         text    default 'Geral',
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  image_url        text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- APPOINTMENTS  (per company)
-- ============================================================
create table appointments (
  id                     uuid    primary key default gen_random_uuid(),
  company_id             uuid    not null references companies(id) on delete cascade,
  user_id                uuid    references auth.users(id) on delete set null,
  customer_name          text    not null,
  customer_email         text    not null,
  customer_phone         text    not null,
  vehicle_model          text    not null,
  vehicle_plate          text,
  address                text    not null,
  address_complement     text,
  notes                  text,
  appointment_date       date    not null,
  appointment_time       time    not null,
  status                 text    not null default 'pending'
                           check (status in ('pending','confirmed','completed','cancelled','no_show')),
  payment_method         text    not null default 'local'
                           check (payment_method in ('online','local')),
  payment_status         text    not null default 'pending'
                           check (payment_status in ('pending','paid','cancelled')),
  total_price            numeric(10,2) not null default 0,
  total_duration_minutes integer not null default 0,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ============================================================
-- APPOINTMENT_SERVICES
-- ============================================================
create table appointment_services (
  id                       uuid primary key default gen_random_uuid(),
  appointment_id           uuid not null references appointments(id) on delete cascade,
  service_id               uuid references services(id) on delete set null,
  service_name             text    not null,
  service_price            numeric(10,2) not null,
  service_duration_minutes integer not null
);

-- ============================================================
-- BUSINESS_HOURS  (per company, per weekday 0=Sun…6=Sat)
-- ============================================================
create table business_hours (
  id                         uuid    primary key default gen_random_uuid(),
  company_id                 uuid    not null references companies(id) on delete cascade,
  weekday                    integer not null check (weekday >= 0 and weekday <= 6),
  start_time                 time    not null default '08:00',
  end_time                   time    not null default '18:00',
  slot_interval_minutes      integer not null default 60,
  max_appointments_per_slot  integer not null default 1,
  is_active                  boolean not null default true,
  unique(company_id, weekday)
);

-- ============================================================
-- BLOCKED_SLOTS  (per company)
-- ============================================================
create table blocked_slots (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  blocked_date date not null,
  blocked_time time,
  reason       text,
  created_at   timestamptz default now()
);

-- ============================================================
-- CUSTOMERS  (per company, unique by phone)
-- ============================================================
create table customers (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  email      text,
  phone      text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, phone)
);

-- ============================================================
-- PROFESSIONALS  (per company)
-- ============================================================
create table professionals (
  id         uuid    primary key default gen_random_uuid(),
  company_id uuid    not null references companies(id) on delete cascade,
  name       text    not null,
  avatar_url text,
  bio        text,
  is_active  boolean not null default true,
  created_at timestamptz default now()
);

-- ============================================================
-- REVIEWS  (per company)
-- ============================================================
create table reviews (
  id             uuid    primary key default gen_random_uuid(),
  company_id     uuid    not null references companies(id) on delete cascade,
  appointment_id uuid    references appointments(id) on delete set null,
  user_id        uuid    references auth.users(id)   on delete set null,
  customer_name  text,
  rating         integer not null check (rating >= 1 and rating <= 5),
  comment        text,
  is_visible     boolean not null default true,
  created_at     timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS  (per company)
-- ============================================================
create table subscriptions (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  plan          text not null default 'free'
                  check (plan in ('free', 'starter', 'pro')),
  status        text not null default 'active'
                  check (status in ('active', 'cancelled', 'trial', 'expired')),
  price_monthly numeric(10,2),
  starts_at     timestamptz default now(),
  expires_at    timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_upd      before update on profiles      for each row execute function update_updated_at();
create trigger companies_upd     before update on companies      for each row execute function update_updated_at();
create trigger services_upd      before update on services       for each row execute function update_updated_at();
create trigger appointments_upd  before update on appointments   for each row execute function update_updated_at();
create trigger subscriptions_upd before update on subscriptions  for each row execute function update_updated_at();
create trigger customers_upd     before update on customers      for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
exception
  when others then return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

create or replace function is_platform_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and (role = 'admin' or email = 'phelippes593@gmail.com')
  );
$$;

create or replace function is_company_member(cid uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from company_members
    where company_id = cid and user_id = auth.uid()
  );
$$;

-- Bypasses RLS for anonymous slot checks
create or replace function get_company_booked_slots(p_company_id uuid, p_date date)
returns table (appointment_time time)
language sql security definer stable as $$
  select a.appointment_time
  from   appointments a
  where  a.company_id       = p_company_id
    and  a.appointment_date = p_date
    and  a.status in ('pending', 'confirmed');
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- PROFILES
alter table profiles enable row level security;
create policy "profiles_select" on profiles for select
  using (auth.uid() = id or is_platform_admin());
create policy "profiles_update" on profiles for update
  using (auth.uid() = id);
create policy "profiles_insert" on profiles for insert
  with check (auth.uid() = id);

-- COMPANIES
alter table companies enable row level security;
create policy "companies_select" on companies for select
  using (is_active = true or is_company_member(id) or is_platform_admin());
create policy "companies_insert" on companies for insert
  with check (auth.uid() is not null);
create policy "companies_update" on companies for update
  using (is_company_member(id) or is_platform_admin());
create policy "companies_delete" on companies for delete
  using (is_platform_admin());

-- COMPANY_MEMBERS
alter table company_members enable row level security;
create policy "cm_select" on company_members for select
  using (user_id = auth.uid() or is_platform_admin() or is_company_member(company_id));
create policy "cm_insert" on company_members for insert
  with check (auth.uid() is not null);
create policy "cm_delete" on company_members for delete
  using (is_platform_admin() or user_id = auth.uid());

-- SERVICES
alter table services enable row level security;
create policy "services_select" on services for select
  using (is_active = true or is_company_member(company_id) or is_platform_admin());
create policy "services_insert" on services for insert
  with check (is_company_member(company_id) or is_platform_admin());
create policy "services_update" on services for update
  using (is_company_member(company_id) or is_platform_admin());
create policy "services_delete" on services for delete
  using (is_company_member(company_id) or is_platform_admin());

-- APPOINTMENTS
alter table appointments enable row level security;
create policy "appt_insert" on appointments for insert with check (true);
create policy "appt_select" on appointments for select
  using (user_id = auth.uid() or is_company_member(company_id) or is_platform_admin());
create policy "appt_update" on appointments for update
  using (is_company_member(company_id) or is_platform_admin());

-- APPOINTMENT_SERVICES
alter table appointment_services enable row level security;
create policy "appt_svc_insert" on appointment_services for insert with check (true);
create policy "appt_svc_select" on appointment_services for select
  using (
    exists (
      select 1 from appointments a
      where  a.id = appointment_id
        and  (a.user_id = auth.uid() or is_company_member(a.company_id) or is_platform_admin())
    )
  );

-- BUSINESS_HOURS
alter table business_hours enable row level security;
create policy "bh_select" on business_hours for select using (true);
create policy "bh_insert" on business_hours for insert
  with check (is_company_member(company_id) or is_platform_admin());
create policy "bh_update" on business_hours for update
  using (is_company_member(company_id) or is_platform_admin());
create policy "bh_delete" on business_hours for delete
  using (is_company_member(company_id) or is_platform_admin());

-- BLOCKED_SLOTS
alter table blocked_slots enable row level security;
create policy "bs_select" on blocked_slots for select using (true);
create policy "bs_insert" on blocked_slots for insert
  with check (is_company_member(company_id) or is_platform_admin());
create policy "bs_delete" on blocked_slots for delete
  using (is_company_member(company_id) or is_platform_admin());

-- CUSTOMERS
alter table customers enable row level security;
create policy "cust_select" on customers for select
  using (is_company_member(company_id) or is_platform_admin());
create policy "cust_insert" on customers for insert
  with check (is_company_member(company_id) or is_platform_admin());
create policy "cust_update" on customers for update
  using (is_company_member(company_id) or is_platform_admin());

-- REVIEWS
alter table reviews enable row level security;
create policy "rev_select" on reviews for select
  using (is_visible = true or is_company_member(company_id) or is_platform_admin());
create policy "rev_insert" on reviews for insert with check (auth.uid() is not null);
create policy "rev_update" on reviews for update
  using (is_company_member(company_id) or is_platform_admin());

-- SUBSCRIPTIONS
alter table subscriptions enable row level security;
create policy "sub_select" on subscriptions for select
  using (is_company_member(company_id) or is_platform_admin());
create policy "sub_all" on subscriptions for all using (is_platform_admin());

-- ============================================================
-- MARKETPLACE COLUMNS (safe to run even after initial schema)
-- ============================================================
alter table companies add column if not exists is_verified  boolean not null default false;
alter table companies add column if not exists is_featured  boolean not null default false;
alter table companies add column if not exists rating_avg   numeric(3,2)    default 0;
alter table companies add column if not exists reviews_count integer        default 0;

-- Index for city-based search
create index if not exists idx_companies_city     on companies (city)           where is_active = true;
create index if not exists idx_companies_featured on companies (is_featured)    where is_active = true;
create index if not exists idx_companies_rating   on companies (rating_avg desc) where is_active = true;

-- Allow public read of active companies (marketplace search)
drop policy if exists "companies_select" on companies;
create policy "companies_select" on companies for select
  using (is_active = true or is_company_member(id) or is_platform_admin());

-- Allow public read of active services (marketplace browse)
drop policy if exists "services_select" on services;
create policy "services_select" on services for select
  using (is_active = true or is_company_member(company_id) or is_platform_admin());

-- ============================================================
-- STORAGE: service-images bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

create policy "service_images_read"   on storage.objects for select using (bucket_id = 'service-images');
create policy "service_images_insert" on storage.objects for insert with check (bucket_id = 'service-images' and auth.role() = 'authenticated');
create policy "service_images_delete" on storage.objects for delete using  (bucket_id = 'service-images' and auth.role() = 'authenticated');
