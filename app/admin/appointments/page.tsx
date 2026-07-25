'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali, formatTime, formatPrice, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', confirmed: 'bg-info-soft text-info', completed: 'bg-success-soft text-success', cancelled: 'bg-destructive/10 text-destructive', no_show: 'bg-destructive/10 text-destructive' };
const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', confirmed: 'تایید شده', completed: 'تکمیل شده', cancelled: 'لغو شده', no_show: 'غیبت' };

export default function AdminAppointmentsPage() {
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('appointments').select('*, patient:profiles(full_name, phone), service:services(title)').order('date', { ascending: false });
      setAppts(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) { toast.error('به‌روزرسانی ناموفق بود'); return; }
    setAppts(appts.map((a) => a.id === id ? { ...a, status } : a));
    toast.success('وضعیت به‌روزرسانی شد');
  }

  const filtered = filter === 'all' ? appts : appts.filter((a) => a.status === filter);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">نوبت‌ها</h1>
        <p className="text-sand-400 mt-1">مدیریت نوبت‌های کلینیک</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'همه' },
          { key: 'pending', label: 'در انتظار' },
          { key: 'confirmed', label: 'تایید شده' },
          { key: 'completed', label: 'تکمیل شده' },
          { key: 'cancelled', label: 'لغو شده' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all', filter === f.key ? 'bg-primary text-white shadow-soft' : 'bg-muted text-sand-500 hover:bg-primary-soft')}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
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
                    <p className="text-sm text-sand-400 mt-0.5">{a.patient?.full_name ?? 'بیمار'} - {formatJalali(a.date, true)} - {formatTime(a.start_time)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full', STATUS_STYLES[a.status])}>{STATUS_LABELS[a.status]}</span>
                  <span className="text-sm font-bold text-primary nums-fa">{formatPrice(a.price)}</span>
                </div>
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <button onClick={() => updateStatus(a.id, 'confirmed')} className="inline-flex items-center gap-1.5 rounded-lg bg-info-soft text-info px-3 py-1.5 text-xs font-medium hover:bg-info hover:text-white transition-colors">
                    <CheckCircle2 className="h-3.5 w-3.5" /> تایید
                  </button>
                  <button onClick={() => updateStatus(a.id, 'cancelled')} className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/5 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive hover:text-white transition-colors">
                    <XCircle className="h-3.5 w-3.5" /> لغو
                  </button>
                </div>
              )}
              {a.status === 'confirmed' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border/40">
                  <button onClick={() => updateStatus(a.id, 'completed')} className="inline-flex items-center gap-1.5 rounded-lg bg-success-soft text-success px-3 py-1.5 text-xs font-medium hover:bg-success hover:text-white transition-colors">
                    <CheckCircle2 className="h-3.5 w-3.5" /> تکمیل
                  </button>
                  <button onClick={() => updateStatus(a.id, 'no_show')} className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/5 text-destructive px-3 py-1.5 text-xs font-medium hover:bg-destructive hover:text-white transition-colors">
                    <Clock className="h-3.5 w-3.5" /> غیبت
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
