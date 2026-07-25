'use client';

import { useEffect, useState } from 'react';
import { Search, Users, Loader2, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali, toPersianDigits } from '@/lib/date';
import { prettyPhone } from '@/lib/auth-helpers';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function GoogleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ProviderBadges({ providers }: { providers: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {providers.includes('phone') && (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-100">
          <Phone className="h-3 w-3" />
          موبایل
        </span>
      )}
      {providers.includes('google') && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-sand-600 border border-border/60 shadow-sm">
          <GoogleIcon size={12} />
          گوگل
        </span>
      )}
      {providers.length === 0 && (
        <span className="text-xs text-sand-300">-</span>
      )}
    </div>
  );
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPatients(data ?? []); setLoading(false); });
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.phone?.includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.referral_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">بیماران</h1>
        <p className="text-sand-400 mt-1">مدیریت بیماران کلینیک</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-300" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو..."
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <Users className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">بیماری یافت نشد</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card shadow-soft border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-sand-500">
                <tr>
                  <th className="text-right p-4 font-medium">نام</th>
                  <th className="text-right p-4 font-medium">موبایل</th>
                  <th className="text-right p-4 font-medium">روش ورود</th>
                  <th className="text-right p-4 font-medium">کد معرفی</th>
                  <th className="text-right p-4 font-medium">تاریخ عضویت</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-medium">
                            {p.full_name?.charAt(0) ?? 'ب'}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-sand-700">{p.full_name ?? 'بدون نام'}</span>
                          {p.email && (
                            <p className="text-xs text-sand-400" dir="ltr">{p.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sand-500 nums-fa" dir="ltr">
                      {p.phone ? prettyPhone(p.phone) : '-'}
                    </td>
                    <td className="p-4">
                      <ProviderBadges providers={p.auth_providers ?? []} />
                    </td>
                    <td className="p-4 text-sand-500 font-mono">{p.referral_code ?? '-'}</td>
                    <td className="p-4 text-sand-400 nums-fa">{formatJalali(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
