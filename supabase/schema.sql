-- KATSUKO SALON Supabase schema
-- 1) Supabase SQL Editorで実行
-- 2) Authenticationで管理者/施術師ユーザーを作成
-- 3) profiles.user_idにauth.users.idを紐付け

create extension if not exists pgcrypto;

create type user_role as enum ('admin', 'therapist');
create type reservation_status as enum ('reserved', 'visited', 'cancelled', 'no_show');
create type payment_method as enum ('cash', 'card', 'stripe', 'other');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  email text,
  role user_role not null default 'therapist',
  commission_rate numeric(5,2) not null default 40,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table beds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table service_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null default 60,
  price int not null default 0,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  reservation_date date not null,
  start_time time not null,
  end_time time not null,
  menu_id uuid references service_menus(id) on delete restrict,
  therapist_id uuid references profiles(id) on delete restrict,
  bed_id uuid references beds(id) on delete restrict,
  status reservation_status not null default 'reserved',
  amount int not null default 0,
  memo text not null default '',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_time_valid check (end_time > start_time)
);

-- 同じ日に、同じベッド/施術師の時間重複を防ぐための補助インデックスはアプリ側でチェック。
-- より厳密にするなら tstzrange への変更を推奨。
create index reservations_date_idx on reservations(reservation_date);
create index reservations_bed_idx on reservations(bed_id, reservation_date);
create index reservations_therapist_idx on reservations(therapist_id, reservation_date);

create table treatment_sales (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid references reservations(id) on delete set null,
  sale_date date not null default current_date,
  customer_name text not null,
  menu_id uuid references service_menus(id),
  therapist_id uuid references profiles(id),
  amount int not null,
  payment_method payment_method not null default 'cash',
  commission_target boolean not null default true,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price int not null default 0,
  cost int not null default 0,
  stock int not null default 0,
  low_stock_threshold int not null default 10,
  image_url text,
  stripe_payment_link text,
  stripe_price_id text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_sales (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete restrict,
  sale_date date not null default current_date,
  customer_name text,
  customer_email text,
  quantity int not null default 1,
  unit_price int not null,
  total_amount int not null,
  payment_method payment_method not null default 'stripe',
  stripe_payment_id text,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid references profiles(id) on delete cascade,
  target_month date not null,
  amount int not null default 0,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create view monthly_therapist_payroll as
select
  date_trunc('month', ts.sale_date)::date as target_month,
  p.id as therapist_id,
  p.name as therapist_name,
  p.commission_rate,
  count(ts.id) as treatment_count,
  coalesce(sum(ts.amount), 0)::int as treatment_sales,
  round(coalesce(sum(ts.amount), 0) * p.commission_rate / 100)::int as base_commission,
  coalesce((
    select sum(pa.amount)::int
    from payroll_adjustments pa
    where pa.therapist_id = p.id
      and pa.target_month = date_trunc('month', ts.sale_date)::date
  ), 0) as adjustment_amount,
  round(coalesce(sum(ts.amount), 0) * p.commission_rate / 100)::int + coalesce((
    select sum(pa.amount)::int
    from payroll_adjustments pa
    where pa.therapist_id = p.id
      and pa.target_month = date_trunc('month', ts.sale_date)::date
  ), 0) as payable_amount
from treatment_sales ts
join profiles p on p.id = ts.therapist_id
where ts.commission_target = true
  and p.role = 'therapist'
group by date_trunc('month', ts.sale_date), p.id, p.name, p.commission_rate;

insert into beds(name) values ('ベッド1'), ('ベッド2'), ('ベッド3');
insert into service_menus(name, duration_minutes, price, description) values
('温熱ケア 60分', 60, 8800, '体を温め、リラックスと美容・健康維持をサポートします。'),
('温熱ケア 90分', 90, 12000, 'ゆったり受けたい方向けの温熱ケアです。'),
('温熱＋美容ケア', 90, 15000, '年齢に応じた美容ケアを意識したコースです。');

alter table profiles enable row level security;
alter table beds enable row level security;
alter table service_menus enable row level security;
alter table customers enable row level security;
alter table reservations enable row level security;
alter table treatment_sales enable row level security;
alter table products enable row level security;
alter table product_sales enable row level security;
alter table payroll_adjustments enable row level security;

create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

create policy "active users can read menus" on service_menus for select using (true);
create policy "active users can read beds" on beds for select using (true);
create policy "public can read public products" on products for select using (is_public = true);

create policy "admins manage everything profiles" on profiles for all using (is_admin()) with check (is_admin());
create policy "users read own profile" on profiles for select using (user_id = auth.uid());

create policy "admins manage customers" on customers for all using (is_admin()) with check (is_admin());
create policy "admins manage reservations" on reservations for all using (is_admin()) with check (is_admin());
create policy "therapists read reservations" on reservations for select using (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'therapist' and is_active = true)
);
create policy "therapists insert reservations" on reservations for insert with check (
  exists (select 1 from profiles where user_id = auth.uid() and role in ('admin','therapist') and is_active = true)
);

create policy "admins manage sales" on treatment_sales for all using (is_admin()) with check (is_admin());
create policy "therapists read own sales" on treatment_sales for select using (
  therapist_id in (select id from profiles where user_id = auth.uid())
);
create policy "admins manage products" on products for all using (is_admin()) with check (is_admin());
create policy "admins manage product sales" on product_sales for all using (is_admin()) with check (is_admin());
create policy "admins manage payroll adjustments" on payroll_adjustments for all using (is_admin()) with check (is_admin());
