/*
# Beauty Clinic — Initial Schema

## Overview
Production schema for a single-clinic, single-doctor Persian beauty clinic app.
Designed to scale to multi-doctor / multi-clinic in the future without rewrites:
every domain table carries `clinic_id` and (where relevant) `doctor_id`.

## Tables
1. `profiles` — extends auth.users. Holds role (patient/admin), phone, referral code.
2. `clinics` — clinic metadata (name, address, about, logo).
3. `doctors` — doctor profiles, linked to a clinic.
4. `services` — catalog of offered beauty services (price, duration, image).
5. `schedule_rules` — recurring weekly availability per doctor (weekday, start/end, breaks, slot size, capacity).
6. `schedule_overrides` — per-date exceptions: closed / open / holiday / vacation.
7. `appointments` — bookings linking patient + doctor + service + slot.
8. `payments` — payments per appointment/patient (online/cash/in_person).
9. `wallets` — per-patient wallet balance.
10. `wallet_transactions` — wallet ledger entries.
11. `referrals` — referral relationships + reward tracking.
12. `referral_config` — admin-configurable reward rules.
13. `medical_records` — per-patient digital medical file.
14. `treatments` — treatment progress entries linked to a medical record.
15. `doctor_notes` — free-text notes by doctor on a medical record.
16. `media_assets` — uploaded medical images / files (Supabase Storage URLs).
17. `messages` — patient <-> clinic secure messages.
18. `faqs` — public FAQ entries.
19. `site_settings` — key/value site configuration.

## Security (RLS)
- `profiles`: each user reads/updates own row. Admins read all.
- `clinics`, `doctors`, `services`, `faqs`, `site_settings`, `referral_config`: public read (anon+authenticated), admin write.
- `schedule_rules`, `schedule_overrides`: public read (patients need to see availability), admin write.
- `appointments`: patient reads/inserts own; admin full access.
- `payments`, `wallets`, `wallet_transactions`, `referrals`, `medical_records`, `treatments`, `doctor_notes`, `media_assets`, `messages`: patient reads own; admin full access.
- All write-for-others restricted to admin role via a helper check.

## Important notes
1. `profiles.role` defaults to 'patient'. Admins are set manually in DB.
2. `profiles.referral_code` auto-generated on insert via trigger.
3. A wallet row is auto-created for each new patient via trigger.
4. All timestamps are timestamptz default now().
5. Foreign keys use ON DELETE CASCADE for owned child rows.
6. `auth.uid()` used for ownership — never `current_user`.
*/

-- ============================================================
-- profiles table (created before is_admin so the function can reference it)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  full_name text,
  email text,
  avatar_url text,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','admin')),
  referral_code text UNIQUE,
  referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: is_admin() — true if the current user's profile role is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Now profiles policies (is_admin exists)
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- clinics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  phone text,
  email text,
  address text,
  city text,
  about text,
  logo_url text,
  cover_url text,
  lat double precision,
  lng double precision,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinics_public_read" ON public.clinics;
CREATE POLICY "clinics_public_read" ON public.clinics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "clinics_admin_insert" ON public.clinics;
CREATE POLICY "clinics_admin_insert" ON public.clinics FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "clinics_admin_update" ON public.clinics;
CREATE POLICY "clinics_admin_update" ON public.clinics FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "clinics_admin_delete" ON public.clinics;
CREATE POLICY "clinics_admin_delete" ON public.clinics FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  specialty text,
  years_experience integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_public_read" ON public.doctors;
CREATE POLICY "doctors_public_read" ON public.doctors FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "doctors_admin_insert" ON public.doctors;
CREATE POLICY "doctors_admin_insert" ON public.doctors FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "doctors_admin_update" ON public.doctors;
CREATE POLICY "doctors_admin_update" ON public.doctors FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "doctors_admin_delete" ON public.doctors;
CREATE POLICY "doctors_admin_delete" ON public.doctors FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- services
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  short_description text,
  price integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 30,
  image_url text,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "services_admin_insert" ON public.services;
CREATE POLICY "services_admin_insert" ON public.services FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "services_admin_update" ON public.services;
CREATE POLICY "services_admin_update" ON public.services FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "services_admin_delete" ON public.services;
CREATE POLICY "services_admin_delete" ON public.services FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- schedule_rules (recurring weekly availability)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedule_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time text NOT NULL,
  end_time text NOT NULL,
  break_start text,
  break_end text,
  slot_minutes integer NOT NULL DEFAULT 30,
  capacity_per_slot integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedule_rules_public_read" ON public.schedule_rules;
CREATE POLICY "schedule_rules_public_read" ON public.schedule_rules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "schedule_rules_admin_insert" ON public.schedule_rules;
CREATE POLICY "schedule_rules_admin_insert" ON public.schedule_rules FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "schedule_rules_admin_update" ON public.schedule_rules;
CREATE POLICY "schedule_rules_admin_update" ON public.schedule_rules FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "schedule_rules_admin_delete" ON public.schedule_rules;
CREATE POLICY "schedule_rules_admin_delete" ON public.schedule_rules FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- schedule_overrides (per-date exceptions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedule_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('closed','open','holiday','vacation')),
  start_time text,
  end_time text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, date)
);
ALTER TABLE public.schedule_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schedule_overrides_public_read" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_public_read" ON public.schedule_overrides FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "schedule_overrides_admin_insert" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_admin_insert" ON public.schedule_overrides FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "schedule_overrides_admin_update" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_admin_update" ON public.schedule_overrides FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "schedule_overrides_admin_delete" ON public.schedule_overrides;
CREATE POLICY "schedule_overrides_admin_delete" ON public.schedule_overrides FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  note text,
  price integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select_own_or_admin" ON public.appointments;
CREATE POLICY "appointments_select_own_or_admin" ON public.appointments FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "appointments_insert_own" ON public.appointments;
CREATE POLICY "appointments_insert_own" ON public.appointments FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
CREATE POLICY "appointments_update_own" ON public.appointments FOR UPDATE
  TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "appointments_admin_update" ON public.appointments;
CREATE POLICY "appointments_admin_update" ON public.appointments FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "appointments_delete_own_or_admin" ON public.appointments;
CREATE POLICY "appointments_delete_own_or_admin" ON public.appointments FOR DELETE
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

-- ============================================================
-- payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'online' CHECK (method IN ('online','cash','in_person')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','refunded','failed')),
  reference text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own_or_admin" ON public.payments;
CREATE POLICY "payments_select_own_or_admin" ON public.payments FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payments_insert_own_or_admin" ON public.payments;
CREATE POLICY "payments_insert_own_or_admin" ON public.payments FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "payments_admin_update" ON public.payments;
CREATE POLICY "payments_admin_update" ON public.payments FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "payments_delete_admin" ON public.payments;
CREATE POLICY "payments_delete_admin" ON public.payments FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_payments_patient ON public.payments(patient_id);

-- ============================================================
-- wallets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own_or_admin" ON public.wallets;
CREATE POLICY "wallets_select_own_or_admin" ON public.wallets FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "wallets_admin_insert" ON public.wallets;
CREATE POLICY "wallets_admin_insert" ON public.wallets FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "wallets_admin_update" ON public.wallets;
CREATE POLICY "wallets_admin_update" ON public.wallets FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- wallet_transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit','debit')),
  amount integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT 'admin_adjust' CHECK (reason IN ('referral','appointment','refund','topup','admin_adjust')),
  reference_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_txns_select_own_or_admin" ON public.wallet_transactions;
CREATE POLICY "wallet_txns_select_own_or_admin" ON public.wallet_transactions FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "wallet_txns_admin_insert" ON public.wallet_transactions;
CREATE POLICY "wallet_txns_admin_insert" ON public.wallet_transactions FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_wallet_txns_patient ON public.wallet_transactions(patient_id);

-- ============================================================
-- referrals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','rewarded')),
  reward_amount integer NOT NULL DEFAULT 0,
  discount_percentage integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (referred_id)
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own_or_admin" ON public.referrals;
CREATE POLICY "referrals_select_own_or_admin" ON public.referrals FOR SELECT
  TO authenticated USING (referrer_id = auth.uid() OR referred_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "referrals_admin_insert" ON public.referrals;
CREATE POLICY "referrals_admin_insert" ON public.referrals FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "referrals_admin_update" ON public.referrals;
CREATE POLICY "referrals_admin_update" ON public.referrals FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- ============================================================
-- referral_config
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_amount integer NOT NULL DEFAULT 50000,
  discount_percentage integer NOT NULL DEFAULT 10,
  wallet_credit integer NOT NULL DEFAULT 50000,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_config_public_read" ON public.referral_config;
CREATE POLICY "referral_config_public_read" ON public.referral_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "referral_config_admin_insert" ON public.referral_config;
CREATE POLICY "referral_config_admin_insert" ON public.referral_config FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "referral_config_admin_update" ON public.referral_config;
CREATE POLICY "referral_config_admin_update" ON public.referral_config FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "referral_config_admin_delete" ON public.referral_config;
CREATE POLICY "referral_config_admin_delete" ON public.referral_config FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- medical_records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  diagnosis text,
  allergies text,
  medications text,
  medical_history text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medical_records_select_own_or_admin" ON public.medical_records;
CREATE POLICY "medical_records_select_own_or_admin" ON public.medical_records FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "medical_records_insert_own_or_admin" ON public.medical_records;
CREATE POLICY "medical_records_insert_own_or_admin" ON public.medical_records FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "medical_records_update_own_or_admin" ON public.medical_records;
CREATE POLICY "medical_records_update_own_or_admin" ON public.medical_records FOR UPDATE
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin()) WITH CHECK (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "medical_records_delete_admin" ON public.medical_records;
CREATE POLICY "medical_records_delete_admin" ON public.medical_records FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);

-- ============================================================
-- treatments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id uuid NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','paused')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "treatments_select_own_or_admin" ON public.treatments;
CREATE POLICY "treatments_select_own_or_admin" ON public.treatments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.medical_records mr WHERE mr.id = treatments.medical_record_id AND (mr.patient_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "treatments_admin_insert" ON public.treatments;
CREATE POLICY "treatments_admin_insert" ON public.treatments FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "treatments_admin_update" ON public.treatments;
CREATE POLICY "treatments_admin_update" ON public.treatments FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "treatments_delete_admin" ON public.treatments;
CREATE POLICY "treatments_delete_admin" ON public.treatments FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- doctor_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id uuid NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctor_notes_select_own_or_admin" ON public.doctor_notes;
CREATE POLICY "doctor_notes_select_own_or_admin" ON public.doctor_notes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.medical_records mr WHERE mr.id = doctor_notes.medical_record_id AND (mr.patient_id = auth.uid() OR public.is_admin()))
  );

DROP POLICY IF EXISTS "doctor_notes_admin_insert" ON public.doctor_notes;
CREATE POLICY "doctor_notes_admin_insert" ON public.doctor_notes FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "doctor_notes_delete_admin" ON public.doctor_notes;
CREATE POLICY "doctor_notes_delete_admin" ON public.doctor_notes FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- media_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('image','file')),
  url text NOT NULL,
  storage_path text NOT NULL,
  title text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_select_own_or_admin" ON public.media_assets;
CREATE POLICY "media_select_own_or_admin" ON public.media_assets FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "media_insert_own" ON public.media_assets;
CREATE POLICY "media_insert_own" ON public.media_assets FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "media_delete_own_or_admin" ON public.media_assets;
CREATE POLICY "media_delete_own_or_admin" ON public.media_assets FOR DELETE
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_media_patient ON public.media_assets(patient_id);

-- ============================================================
-- messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own_or_admin" ON public.messages;
CREATE POLICY "messages_select_own_or_admin" ON public.messages FOR SELECT
  TO authenticated USING (patient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  TO authenticated WITH CHECK (patient_id = auth.uid());

DROP POLICY IF EXISTS "messages_admin_update" ON public.messages;
CREATE POLICY "messages_admin_update" ON public.messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_messages_patient ON public.messages(patient_id);

-- ============================================================
-- faqs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "faqs_public_read" ON public.faqs;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "faqs_admin_insert" ON public.faqs;
CREATE POLICY "faqs_admin_insert" ON public.faqs FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "faqs_admin_update" ON public.faqs;
CREATE POLICY "faqs_admin_update" ON public.faqs FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "faqs_admin_delete" ON public.faqs;
CREATE POLICY "faqs_admin_delete" ON public.faqs FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_admin_insert" ON public.site_settings;
CREATE POLICY "settings_admin_insert" ON public.site_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_admin_update" ON public.site_settings;
CREATE POLICY "settings_admin_update" ON public.site_settings FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_admin_delete" ON public.site_settings;
CREATE POLICY "settings_admin_delete" ON public.site_settings FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER clinics_touch BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER doctors_touch BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER services_touch BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER schedule_rules_touch BEFORE UPDATE ON public.schedule_rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER payments_touch BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER wallets_touch BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER referral_config_touch BEFORE UPDATE ON public.referral_config FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER medical_records_touch BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER treatments_touch BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- referral_code auto-generation + wallet auto-creation triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code text;
BEGIN
  LOOP
    code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  NEW.referral_code := code;

  IF NEW.role = 'patient' THEN
    INSERT INTO public.wallets (patient_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_profile_created
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
