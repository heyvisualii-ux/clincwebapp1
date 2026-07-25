'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Wallet,
  Gift,
  FileText,
  TrendingUp,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatPrice, formatTime, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning-soft text-warning',
  confirmed: 'bg-info-soft text-info',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  no_show: 'bg-destructive/10 text-destructive',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  confirmed: 'تایید شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  no_show: 'غیبت',
};

export default function PatientDashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, completed: 0, wallet: 0, referrals: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: appts }, { data: wallet }, { data: refs }, { data: upcomingAppts }] = await Promise.all([
        supabase.from('appointments').select('*').eq('patient_id', user.id),
        supabase.from('wallets').select('balance').eq('patient_id', user.id).maybeSingle(),
        supabase.from('referrals').select('*').eq('referrer_id', user.id),
        supabase.from('appointments').select('*, service:services(title)').eq('patient_id', user.id).gte('date', today).order('date', { ascending: true }).limit(5),
      ]);
      const apptArr = appts ?? [];
      setStats({
        appointments: apptArr.length,
        completed: apptArr.filter((a) => a.status === 'completed').length,
        wallet: wallet?.balance ?? 0,
        referrals: refs?.length ?? 0,
      });
      setUpcoming(upcomingAppts ?? []);
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: 'کل نوبت‌ها', value: toPersianDigits(stats.appointments), icon: CalendarDays, color: 'text-info', bg: 'bg-info-soft' },
    { label: 'نوبت‌های تکمیل شده', value: toPersianDigits(stats.completed), icon: TrendingUp, color: 'text-success', bg: 'bg-success-soft' },
    { label: 'موجودی کیف پول', value: formatPrice(stats.wallet), icon: Wallet, color: 'text-primary', bg: 'bg-primary-soft' },
    { label: 'معرفی‌ها', value: toPersianDigits(stats.referrals), icon: Gift, color: 'text-warning', bg: 'bg-warning-soft' },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-sand-800">
          سلام، {profile?.full_name ?? 'کاربر گرامی'} 👋
        </h1>
        <p className="text-sand-400 mt-1">به داشبورد خود خوش آمدید</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl mb-3', c.bg)}>
                <Icon className={cn('h-5 w-5', c.color)} />
              </div>
              <p className="text-2xl font-bold text-sand-800 nums-fa">{c.value}</p>
              <p className="text-xs text-sand-400 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-sand-800">نوبت‌های پیش رو</h2>
            <Link href="/dashboard/appointments" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
              مشاهده همه <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-12 text-sand-400">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-sand-200" />
              <p>نوبت آینده‌ای ندارید</p>
              <Link href="/reserve" className="inline-block mt-3 text-primary text-sm hover:underline">رزرو نوبت جدید</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sand-700">{a.service?.title ?? 'نوبت'}</p>
                      <p className="text-xs text-sand-400">{formatJalali(a.date, true)} - {formatTime(a.start_time)}</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-medium px-3 py-1 rounded-full', STATUS_STYLES[a.status])}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-bl from-rose-50 to-gold-50 p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-2">دسترسی سریع</h2>
          <p className="text-sm text-sand-400 mb-5">به بخش‌های پرکاربرد سریع دسترسی پیدا کنید</p>
          <div className="space-y-2.5">
            {[
              { href: '/reserve', label: 'رزرو نوبت جدید', icon: CalendarDays },
              { href: '/dashboard/medical', label: 'پرونده پزشکی', icon: FileText },
              { href: '/dashboard/referral', label: 'معرفی دوستان', icon: Gift },
              { href: '/dashboard/wallet', label: 'کیف پول', icon: Wallet },
            ].map((q, i) => {
              const Icon = q.icon;
              return (
                <Link key={i} href={q.href} className="flex items-center justify-between rounded-xl bg-white/70 p-3.5 hover:bg-white transition-colors group">
                  <span className="flex items-center gap-2.5 text-sm text-sand-600">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                    {q.label}
                  </span>
                  <ChevronLeft className="h-4 w-4 text-sand-300 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
