'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali, formatPrice, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

const METHOD_LABELS: Record<string, string> = { online: 'آنلاین', cash: 'نقدی', in_person: 'حضوری' };
const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', paid: 'bg-success-soft text-success', refunded: 'bg-info-soft text-info', failed: 'bg-destructive/10 text-destructive' };
const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', paid: 'پرداخت شده', refunded: 'بازگشت داده شده', failed: 'ناموفق' };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('payments').select('*, patient:profiles(full_name), appointment:appointments(date, service:services(title))').order('created_at', { ascending: false });
      setPayments(data ?? []);
      setTotalRevenue((data ?? []).filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پرداخت‌ها</h1>
        <p className="text-sand-400 mt-1">مدیریت پرداخت‌های کلینیک</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-xl font-bold text-sand-800 nums-fa">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-sand-400 mt-1">درآمد کل</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info-soft text-info mb-3">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-xl font-bold text-sand-800 nums-fa">{toPersianDigits(payments.length)}</p>
          <p className="text-xs text-sand-400 mt-1">کل تراکنش‌ها</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft text-warning mb-3">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-xl font-bold text-sand-800 nums-fa">{toPersianDigits(payments.filter((p) => p.status === 'pending').length)}</p>
          <p className="text-xs text-sand-400 mt-1">در انتظار پرداخت</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <CreditCard className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">پرداختی ثبت نشده است</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card shadow-soft border border-border/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-sand-500">
                <tr>
                  <th className="text-right p-4 font-medium">بیمار</th>
                  <th className="text-right p-4 font-medium">خدمت</th>
                  <th className="text-right p-4 font-medium">مبلغ</th>
                  <th className="text-right p-4 font-medium">روش</th>
                  <th className="text-right p-4 font-medium">وضعیت</th>
                  <th className="text-right p-4 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sand-700 font-medium">{p.patient?.full_name ?? '-'}</td>
                    <td className="p-4 text-sand-500">{p.appointment?.service?.title ?? '-'}</td>
                    <td className="p-4 text-primary font-bold nums-fa">{formatPrice(p.amount)}</td>
                    <td className="p-4 text-sand-500">{METHOD_LABELS[p.method]}</td>
                    <td className="p-4"><span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_STYLES[p.status])}>{STATUS_LABELS[p.status]}</span></td>
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
