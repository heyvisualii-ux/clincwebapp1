// Auto-managed types describing the database schema.
// Keep in sync with migrations.

export type Role = 'patient' | 'admin';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentMethod = 'online' | 'cash' | 'in_person';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

export type ReferralStatus = 'pending' | 'completed' | 'rewarded';

export type WalletTxnType = 'credit' | 'debit';
export type WalletTxnReason = 'referral' | 'appointment' | 'refund' | 'topup' | 'admin_adjust';

export type MediaType = 'image' | 'file';

export type MessageDirection = 'inbound' | 'outbound';

export interface Profile {
  id: string;
  phone: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: Role;
  referral_code: string | null;
  referred_by: string | null;
  auth_providers: string[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  about: string | null;
  logo_url: string | null;
  cover_url: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  full_name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  specialty: string | null;
  years_experience: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleRule {
  id: string;
  doctor_id: string;
  clinic_id: string;
  weekday: number; // 0=Sun ... 6=Sat
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  break_start: string | null;
  break_end: string | null;
  slot_minutes: number;
  capacity_per_slot: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleOverride {
  id: string;
  doctor_id: string;
  clinic_id: string;
  date: string; // YYYY-MM-DD
  type: 'closed' | 'open' | 'holiday' | 'vacation';
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: AppointmentStatus;
  note: string | null;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string | null;
  patient_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  patient_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  patient_id: string;
  type: WalletTxnType;
  amount: number;
  reason: WalletTxnReason;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: ReferralStatus;
  reward_amount: number;
  discount_percentage: number;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralConfig {
  id: string;
  reward_amount: number;
  discount_percentage: number;
  wallet_credit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  diagnosis: string | null;
  allergies: string | null;
  medications: string | null;
  medical_history: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  medical_record_id: string;
  appointment_id: string | null;
  title: string;
  description: string | null;
  progress: number; // 0-100
  status: 'planned' | 'in_progress' | 'completed' | 'paused';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorNote {
  id: string;
  medical_record_id: string;
  doctor_id: string;
  body: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  type: MediaType;
  url: string;
  storage_path: string;
  title: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface Message {
  id: string;
  patient_id: string;
  direction: MessageDirection;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Record<string, any>; Update: Record<string, any> };
      services: { Row: Service; Insert: Record<string, any>; Update: Record<string, any> };
      clinics: { Row: Clinic; Insert: Record<string, any>; Update: Record<string, any> };
      doctors: { Row: Doctor; Insert: Record<string, any>; Update: Record<string, any> };
      schedule_rules: { Row: ScheduleRule; Insert: Record<string, any>; Update: Record<string, any> };
      schedule_overrides: { Row: ScheduleOverride; Insert: Record<string, any>; Update: Record<string, any> };
      appointments: { Row: Appointment; Insert: Record<string, any>; Update: Record<string, any> };
      payments: { Row: Payment; Insert: Record<string, any>; Update: Record<string, any> };
      wallets: { Row: Wallet; Insert: Record<string, any>; Update: Record<string, any> };
      wallet_transactions: { Row: WalletTransaction; Insert: Record<string, any>; Update: Record<string, any> };
      referrals: { Row: Referral; Insert: Record<string, any>; Update: Record<string, any> };
      referral_config: { Row: ReferralConfig; Insert: Record<string, any>; Update: Record<string, any> };
      medical_records: { Row: MedicalRecord; Insert: Record<string, any>; Update: Record<string, any> };
      treatments: { Row: Treatment; Insert: Record<string, any>; Update: Record<string, any> };
      doctor_notes: { Row: DoctorNote; Insert: Record<string, any>; Update: Record<string, any> };
      media_assets: { Row: MediaAsset; Insert: Record<string, any>; Update: Record<string, any> };
      messages: { Row: Message; Insert: Record<string, any>; Update: Record<string, any> };
      faqs: { Row: Faq; Insert: Record<string, any>; Update: Record<string, any> };
      site_settings: { Row: SiteSettings; Insert: Record<string, any>; Update: Record<string, any> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: Role;
      appointment_status: AppointmentStatus;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      referral_status: ReferralStatus;
      wallet_txn_type: WalletTxnType;
      wallet_txn_reason: WalletTxnReason;
      media_type: MediaType;
      message_direction: MessageDirection;
    };
  };
}

export type TableName = keyof Database['public']['Tables'];
export type RowOf<T extends TableName> = Database['public']['Tables'][T]['Row'];
