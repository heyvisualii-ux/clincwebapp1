'use client';

import { useEffect, useState } from 'react';
import { Gift, Copy, Share2, Users, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatPrice, toPersianDigits } from '@/lib/date';
import { toast } from 'sonner';

export default function ReferralPage() {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: refs }, { data: cfg }] = await Promise.all([
        supabase.from('referrals').select('*, referred:profiles!referrals_referred_id_fkey(full_name, phone, created_at)').eq('referrer_id', user.id).order('created_at', { ascending: false }),
        supabase.from('referral_config').select('*').eq('is_active', true).maybeSingle(),
      ]);
      setReferrals(refs ?? []);
      setConfig(cfg);
      setLoading(false);
    })();
  }, [user]);

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${profile?.referral_code ?? ''}` : '';

  function copyCode() {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success('کد کپی شد');
    setTimeout(() => setCopied(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    toast.success('لینک کپی شد');
  }

  const STATUS_STYLES: Record<string, string> = { pending: 'bg-warning-soft text-warning', completed: 'bg-info-soft text-info', rewarded: 'bg-success-soft text-success' };
  const STATUS_LABELS: Record<string, string> = { pending: 'در انتظار', completed: 'تکمیل شده', rewarded: 'پاداش داده شده' };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">معرفی دوستان</h1>
        <p className="text-sand-400 mt-1">دوستان خود را دعوت کنید و پاداش بگیرید</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-gradient-to-bl from-rose-50 to-gold-50 p-8 shadow-soft border border-border/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-rose text-white shadow-soft">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-sand-800">کد معرفی شما</h2>
              <p className="text-sm text-sand-400">این کد را با دوستان خود به اشتراک بگذارید</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 rounded-xl bg-white px-5 py-4 text-center">
              <span className="font-heading text-2xl font-bold text-primary tracking-widest">{profile?.referral_code ?? '------'}</span>
            </div>
            <button onClick={copyCode} className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white hover:opacity-90 transition-opacity">
              {copied ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
            </button>
          </div>

          <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm text-sand-600 hover:bg-white transition-colors">
            <Share2 className="h-4 w-4" />
            کپی لینک دعوت
          </button>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-soft border border-border/40 space-y-4">
          <h3 className="font-heading font-semibold text-sand-800">پاداش معرفی</h3>
          {config ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-sand-400">مبلغ پاداش</span>
                <span className="font-bold text-primary nums-fa">{formatPrice(config.reward_amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-sand-400">درصد تخفیف</span>
                <span className="font-bold text-sand-700 nums-fa">{toPersianDigits(config.discount_percentage)}٪</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-sand-400">اعتبار کیف پول</span>
                <span className="font-bold text-sand-700 nums-fa">{formatPrice(config.wallet_credit)}</span>
              </div>
            </>
          ) : <div className="h-20 animate-pulse bg-muted/40 rounded-xl" />}
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-sand-800">دوستان دعوت شده</h2>
          <span className="flex items-center gap-1.5 text-sm text-sand-400">
            <Users className="h-4 w-4" />
            <span className="nums-fa">{toPersianDigits(referrals.length)} نفر</span>
          </span>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-8 text-sand-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-sand-200" />
            <p>هنوز کسی را دعوت نکرده‌اید</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary font-medium">
                    {r.referred?.full_name?.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sand-700">{r.referred?.full_name ?? 'کاربر'}</p>
                    <p className="text-xs text-sand-400">{formatJalali(r.created_at)}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
