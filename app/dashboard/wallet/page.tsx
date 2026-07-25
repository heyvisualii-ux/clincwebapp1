'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatPrice, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

const REASON_LABELS: Record<string, string> = {
  referral: 'معرفی دوستان', appointment: 'نوبت', refund: 'بازگشت وجه', topup: 'شارژ', admin_adjust: 'تنظیم توسط مدیریت',
};

export default function WalletPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: wallet }, { data: txnsData }] = await Promise.all([
        supabase.from('wallets').select('balance').eq('patient_id', user.id).maybeSingle(),
        supabase.from('wallet_transactions').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
      ]);
      setBalance(wallet?.balance ?? 0);
      setTxns(txnsData ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">کیف پول</h1>
        <p className="text-sand-400 mt-1">موجودی و تراکنش‌ها</p>
      </div>

      <div className="rounded-3xl gradient-rose p-8 text-white shadow-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-6 w-6" />
            <span className="text-white/80">موجودی فعلی</span>
          </div>
          <p className="font-heading text-4xl font-bold nums-fa">{formatPrice(balance)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
        <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">تاریخچه تراکنش‌ها</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}</div>
        ) : txns.length === 0 ? (
          <div className="text-center py-8 text-sand-400">تراکنشی ثبت نشده است</div>
        ) : (
          <div className="space-y-2">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', t.type === 'credit' ? 'bg-success-soft text-success' : 'bg-destructive/10 text-destructive')}>
                    {t.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sand-700">{REASON_LABELS[t.reason] ?? 'تراکنش'}</p>
                    <p className="text-xs text-sand-400">{formatJalali(t.created_at)}</p>
                  </div>
                </div>
                <span className={cn('font-bold nums-fa', t.type === 'credit' ? 'text-success' : 'text-destructive')}>
                  {t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
