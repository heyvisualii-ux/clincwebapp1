'use client';

import { useEffect, useState } from 'react';
import { Gift, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali, formatPrice, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', completed: 'bg-info-soft text-info', rewarded: 'bg-success-soft text-success' };
const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', completed: 'تکمیل شده', rewarded: 'پاداش داده شده' };

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: refs }, { data: cfg }] = await Promise.all([
        supabase.from('referrals').select('*, referrer:profiles!referrals_referrer_id_fkey(full_name), referred:profiles!referrals_referred_id_fkey(full_name, phone)').order('created_at', { ascending: false }),
        supabase.from('referral_config').select('*').eq('is_active', true).maybeSingle(),
      ]);
      setReferrals(refs ?? []);
      setConfig(cfg);
      setLoading(false);
    })();
  }, []);

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase.from('referral_config').update({
      reward_amount: config.reward_amount, discount_percentage: config.discount_percentage, wallet_credit: config.wallet_credit,
    }).eq('id', config.id);
    if (error) { toast.error('ذخیره ناموفق بود'); setSaving(false); return; }
    toast.success('تنظیمات ذخیره شد');
    setSaving(false);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">معرفی دوستان</h1>
        <p className="text-sand-400 mt-1">مدیریت سیستم معرفی و پاداش‌ها</p>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
        <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">تنظیمات پاداش</h2>
        {config ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">مبلغ پاداش (تومان)</label>
              <Input type="number" value={config.reward_amount} onChange={(e) => setConfig({ ...config, reward_amount: Number(e.target.value) })} className="nums-fa" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">درصد تخفیف</label>
              <Input type="number" value={config.discount_percentage} onChange={(e) => setConfig({ ...config, discount_percentage: Number(e.target.value) })} className="nums-fa" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">اعتبار کیف پول (تومان)</label>
              <Input type="number" value={config.wallet_credit} onChange={(e) => setConfig({ ...config, wallet_credit: Number(e.target.value) })} className="nums-fa" />
            </div>
            <div className="sm:col-span-3">
              <Button onClick={saveConfig} disabled={saving} className="gradient-rose text-white">
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
              </Button>
            </div>
          </div>
        ) : <div className="h-20 animate-pulse bg-muted/40 rounded-xl" />}
      </div>

      <div className="rounded-2xl bg-card shadow-soft border border-border/40 overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800">لیست معرفی‌ها</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}</div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-3 text-sand-200" />
            <p className="text-sand-400">معرفی‌ای ثبت نشده است</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-sand-500">
                <tr>
                  <th className="text-right p-4 font-medium">معرفی‌کننده</th>
                  <th className="text-right p-4 font-medium">معرفی‌شده</th>
                  <th className="text-right p-4 font-medium">کد</th>
                  <th className="text-right p-4 font-medium">پاداش</th>
                  <th className="text-right p-4 font-medium">وضعیت</th>
                  <th className="text-right p-4 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sand-700 font-medium">{r.referrer?.full_name ?? '-'}</td>
                    <td className="p-4 text-sand-500">{r.referred?.full_name ?? '-'}</td>
                    <td className="p-4 text-sand-500 font-mono">{r.referral_code}</td>
                    <td className="p-4 text-primary font-bold nums-fa">{formatPrice(r.reward_amount)}</td>
                    <td className="p-4"><span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', STATUS_STYLES[r.status])}>{STATUS_LABELS[r.status]}</span></td>
                    <td className="p-4 text-sand-400 nums-fa">{formatJalali(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
