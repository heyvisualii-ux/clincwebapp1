'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatPrice, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

const METHOD_LABELS: Record<string, string> = { online: 'آنلاین', cash: 'نقدی', in_person: 'حضوری' };
const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', paid: 'bg-success-soft text-success', refunded: 'bg-info-soft text-info', failed: 'bg-destructive/10 text-destructive' };
const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', paid: 'پرداخت شده', refunded: 'بازگشت داده شده', failed: 'ناموفق' };

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('payments').select('*, appointment:appointments(date, service:services(title))').eq('patient_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پرداخت‌های من</h1>
        <p className="text-sand-400 mt-1">تاریخچه پرداخت‌ها</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <CreditCard className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">پرداختی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sand-700">{p.appointment?.service?.title ?? 'پرداخت'}</p>
                  <p className="text-xs text-sand-400 mt-0.5">{formatJalali(p.created_at)} - {METHOD_LABELS[p.method]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary nums-fa">{formatPrice(p.amount)}</span>
                <span className={cn('text-xs font-medium px-3 py-1.5 rounded-full', STATUS_STYLES[p.status])}>{STATUS_LABELS[p.status]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
