'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatPrice, formatTime, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(title, price)')
        .eq('patient_id', user.id)
        .order('date', { ascending: false });
      setAppts(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  async function cancelAppt(id: string) {
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    if (error) { toast.error('لغو ناموفق بود'); return; }
    setAppts(appts.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
    toast.success('نوبت لغو شد');
  }

  const today = new Date().toISOString().split('T')[0];
  const filtered = appts.filter((a) => {
    if (filter === 'upcoming') return a.date >= today && a.status !== 'cancelled' && a.status !== 'completed';
    if (filter === 'completed') return a.status === 'completed';
    if (filter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">نوبت‌های من</h1>
        <p className="text-sand-400 mt-1">تاریخچه و نوبت‌های پیش رو</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'همه' },
          { key: 'upcoming', label: 'پیش رو' },
          { key: 'completed', label: 'تکمیل شده' },
          { key: 'cancelled', label: 'لغو شده' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === f.key ? 'bg-primary text-white shadow-soft' : 'bg-muted text-sand-500 hover:bg-primary-soft',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">نوبتی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sand-800">{a.service?.title ?? 'نوبت'}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-sand-400">
                      <span>{formatJalali(a.date, true)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(a.start_time)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full', STATUS_STYLES[a.status])}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  {a.status === 'pending' && (
                    <button onClick={() => cancelAppt(a.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-sm">
                <span className="text-sand-400">مبلغ</span>
                <span className="font-medium text-primary nums-fa">{formatPrice(a.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
