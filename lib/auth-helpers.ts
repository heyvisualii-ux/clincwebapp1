import { supabase } from '@/lib/supabase';

// Check if a user id is an admin via the profiles table.
export async function isAdmin(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  return data?.role === 'admin';
}

// Generate a unique 6-char referral code (uppercase alnum, no ambiguous chars).
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// Normalize an Iranian mobile number to E.164 (+98...).
export function normalizePhone(input: string): string {
  let v = input.replace(/[^\d+]/g, '');
  if (v.startsWith('+98')) return v;
  if (v.startsWith('0098')) return '+' + v.slice(4);
  if (v.startsWith('09')) return '+98' + v.slice(1);
  if (v.startsWith('9')) return '+98' + v;
  if (v.startsWith('98')) return '+' + v;
  return v;
}

// Pretty-print a phone for UI: 0912 345 6789
export function prettyPhone(phone: string): string {
  const p = normalizePhone(phone);
  const local = p.replace(/^\+98/, '0');
  if (local.length === 11) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return local;
}
