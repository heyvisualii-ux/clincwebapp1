'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, CalendarDays, CreditCard, TrendingUp, Clock, ChevronLeft, Stethoscope, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali, formatPrice, formatTime, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ patients: 0, appts: 0, revenue: 0, pending: 0 });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const [{ data: profiles }, { data: appts }, { data: payments }, { data: todayData }, { data: recent }] = await Promise.all([
        supabase.from('profiles').select('id').eq('role', 'patient'),
        supabase.from('appointments').select('*'),
        supabase.from('payments').select('amount').eq('status', 'paid'),
        supabase.from('appointments').select('*, patient:profiles(full_name, phone), service:services(title)').eq('date', today).order('start_time'),
        supabase.from('profiles').select('*').eq('role', 'patient').order('created_at', { ascending: false }).limit(5),
      ]);
      setStats({
        patients: profiles?.length ?? 0,
        appts: appts?.length ?? 0,
        revenue: payments?.reduce((s, p) => s + p.amount, 0) ?? 0,
        pending: appts?.filter((a) => a.status === 'pending').length ?? 0,
      });
      setTodayAppts(todayData ?? []);
      setRecentPatients(recent ?? []);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'بیماران', value: toPersianDigits(stats.patients), icon: Users, color: 'text-info', bg: 'bg-info-soft' },
    { label: 'کل نوبت‌ها', value: toPersianDigits(stats.appts), icon: CalendarDays, color: 'text-primary', bg: 'bg-primary-soft' },
    { label: 'درآمد کل', value: formatPrice(stats.revenue), icon: TrendingUp, color: 'text-success', bg: 'bg-success-soft' },
    { label: 'نوبت‌های در انتظار', value: toPersianDigits(stats.pending), icon: Clock, color: 'text-warning', bg: 'bg-warning-soft' },
  ];

  const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', confirmed: 'bg-info-soft text-info', completed: 'bg-success-soft text-success', cancelled: 'bg-destructive/10 text-destructive', no_show: 'bg-destructive/10 text-destructive' };
  const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', confirmed: 'تایید شده', completed: 'تکمیل شده', cancelled: 'لغو شده', no_show: 'غیبت' };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-sand-800">داشبورد مدیریت</h1>
        <p className="text-sand-400 mt-1">نمای کلی کلینیک</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl mb-3', c.bg)}>
                <Icon className={cn('h-5 w-5', c.color)} />
              </div>
              <p className="text-xl lg:text-2xl font-bold text-sand-800 nums-fa">{c.value}</p>
              <p className="text-xs text-sand-400 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-sand-800">نوبت‌های امروز</h2>
            <Link href="/admin/appointments" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
              مشاهده همه <ChevronLeft className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}</div>
          ) : todayAppts.length === 0 ? (
            <div className="text-center py-10 text-sand-400">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-sand-200" />
              <p>نوبتی برای امروز ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary text-sm font-medium nums-fa">
                      {formatTime(a.start_time).split(' ')[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sand-700">{a.patient?.full_name ?? 'بیمار'}</p>
                      <p className="text-xs text-sand-400">{a.service?.title ?? ''}</p>
                    </div>
                  </div>
                  <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full', STATUS_STYLES[a.status])}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-5">بیماران جدید</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />)}</div>
          ) : recentPatients.length === 0 ? (
            <p className="text-center py-6 text-sand-400">بیماری ثبت نشده است</p>
          ) : (
            <div className="space-y-2">
              {recentPatients.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary text-sm font-medium">
                    {p.full_name?.charAt(0) ?? 'ب'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-sand-700 truncate">{p.full_name ?? 'بیمار'}</p>
                    <p className="text-xs text-sand-400">{formatJalali(p.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/patients', label: 'بیماران', icon: Users },
          { href: '/admin/calendar', label: 'تقویم', icon: CalendarDays },
          { href: '/admin/services', label: 'خدمات', icon: Stethoscope },
          { href: '/admin/referrals', label: 'معرفی‌ها', icon: Gift },
        ].map((q, i) => {
          const Icon = q.icon;
          return (
            <Link key={i} href={q.href} className="group rounded-2xl bg-card p-5 shadow-soft border border-border/40 hover:shadow-luxe transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sand-700">{q.label}</span>
                <ChevronLeft className="h-4 w-4 text-sand-300 mr-auto group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
