'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, CalendarDays, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, toPersianDigits, toJalali } from '@/lib/date';

export default function AdminReportsPage() {
  const [data, setData] = useState({ totalPatients: 0, totalAppts: 0, totalRevenue: 0, completed: 0, cancelled: 0, pending: 0, monthlyAppts: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: profiles }, { data: appts }, { data: payments }] = await Promise.all([
        supabase.from('profiles').select('id, created_at').eq('role', 'patient'),
        supabase.from('appointments').select('*'),
        supabase.from('payments').select('amount, status').eq('status', 'paid'),
      ]);
      const apptArr = appts ?? [];
      const monthlyMap: Record<string, number> = {};
      apptArr.forEach((a) => {
        const j = toJalali(a.date);
        const key = `${toPersianDigits(j.year)}/${toPersianDigits(String(j.month).padStart(2, '0'))}`;
        monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
      });
      const monthlyAppts = Object.entries(monthlyMap).slice(-6).map(([month, count]) => ({ month, count }));
      setData({
        totalPatients: profiles?.length ?? 0,
        totalAppts: apptArr.length,
        totalRevenue: (payments ?? []).reduce((s, p) => s + p.amount, 0),
        completed: apptArr.filter((a) => a.status === 'completed').length,
        cancelled: apptArr.filter((a) => a.status === 'cancelled').length,
        pending: apptArr.filter((a) => a.status === 'pending').length,
        monthlyAppts,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const maxMonthly = Math.max(...data.monthlyAppts.map((m) => m.count), 1);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">گزارش‌ها</h1>
        <p className="text-sand-400 mt-1">تحلیل و آمار کلینیک</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'بیماران', value: toPersianDigits(data.totalPatients), icon: Users, color: 'text-info', bg: 'bg-info-soft' },
          { label: 'نوبت‌ها', value: toPersianDigits(data.totalAppts), icon: CalendarDays, color: 'text-primary', bg: 'bg-primary-soft' },
          { label: 'درآمد', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'text-success', bg: 'bg-success-soft' },
          { label: 'تکمیل شده', value: toPersianDigits(data.completed), icon: BarChart3, color: 'text-warning', bg: 'bg-warning-soft' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl mb-3 ${c.bg}`}>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-xl font-bold text-sand-800 nums-fa">{c.value}</p>
              <p className="text-xs text-sand-400 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-5">نوبت‌های ماهانه</h2>
          {data.monthlyAppts.length === 0 ? (
            <p className="text-center py-8 text-sand-400">داده‌ای موجود نیست</p>
          ) : (
            <div className="space-y-3">
              {data.monthlyAppts.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-sand-500 w-20 nums-fa">{m.month}</span>
                  <div className="flex-1 h-8 rounded-lg bg-muted/40 overflow-hidden">
                    <div className="h-full gradient-rose rounded-lg flex items-center justify-end px-2 transition-all" style={{ width: `${(m.count / maxMonthly) * 100}%` }}>
                      <span className="text-xs text-white font-medium nums-fa">{toPersianDigits(m.count)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-5">وضعیت نوبت‌ها</h2>
          <div className="space-y-3">
            {[
              { label: 'تکمیل شده', value: data.completed, color: 'bg-success' },
              { label: 'در انتظار', value: data.pending, color: 'bg-warning' },
              { label: 'لغو شده', value: data.cancelled, color: 'bg-destructive' },
            ].map((s, i) => {
              const pct = data.totalAppts > 0 ? (s.value / data.totalAppts) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-sand-500">{s.label}</span>
                    <span className="text-sm font-medium text-sand-700 nums-fa">{toPersianDigits(s.value)} ({toPersianDigits(Math.round(pct))}٪)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
