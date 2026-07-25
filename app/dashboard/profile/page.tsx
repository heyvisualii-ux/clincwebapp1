'use client';

import { useEffect, useState } from 'react';
import { User, Save, Loader2, Gift, Phone, Mail, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { prettyPhone } from '@/lib/auth-helpers';
import { toast } from 'sonner';

const PROVIDER_LABELS: Record<string, string> = {
  phone: 'شماره موبایل',
  google: 'حساب گوگل',
};

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setEmail(profile?.email ?? '');
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, email })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('پروفایل به‌روزرسانی شد');
    } catch {
      toast.error('به‌روزرسانی ناموفق بود');
    } finally {
      setSaving(false);
    }
  }

  const providers: string[] = profile?.auth_providers ?? [];
  const hasPhone = providers.includes('phone');
  const hasGoogle = providers.includes('google');

  async function linkGoogle() {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message ?? 'پیوند حساب گوگل ناموفق بود');
    }
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پروفایل</h1>
        <p className="text-sand-400 mt-1">اطلاعات شخصی شما</p>
      </div>

      {/* Avatar card */}
      <div className="flex items-center gap-4 rounded-2xl bg-card p-6 shadow-soft border border-border/40">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? ''}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary text-2xl font-bold">
            {profile?.full_name?.charAt(0) ?? 'ب'}
          </div>
        )}
        <div>
          <h2 className="font-heading text-lg font-semibold text-sand-800">{profile?.full_name ?? 'کاربر'}</h2>
          {profile?.phone && (
            <p className="text-sm text-sand-400 nums-fa" dir="ltr">{prettyPhone(profile.phone)}</p>
          )}
          {profile?.email && (
            <p className="text-sm text-sand-400" dir="ltr">{profile.email}</p>
          )}
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={save} className="rounded-2xl bg-card p-6 shadow-soft border border-border/40 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sand-600">نام و نام خانوادگی</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="نام شما" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-sand-600">شماره موبایل</label>
          <Input
            value={profile?.phone ? prettyPhone(profile.phone) : ''}
            disabled
            className="nums-fa"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-sand-600">ایمیل (اختیاری)</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="gradient-rose text-white shadow-soft hover:shadow-luxe"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              ذخیره تغییرات
            </>
          )}
        </Button>
      </form>

      {/* Linked accounts */}
      <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-sand-800">حساب‌های متصل</h3>
        </div>
        <p className="text-xs text-sand-400">روش‌هایی که می‌توانید با آن‌ها وارد شوید</p>

        {/* Phone row */}
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-sand-700">شماره موبایل</p>
              {hasPhone && profile?.phone ? (
                <p className="text-xs text-sand-400 nums-fa" dir="ltr">{prettyPhone(profile.phone)}</p>
              ) : (
                <p className="text-xs text-sand-400">متصل نیست</p>
              )}
            </div>
          </div>
          {hasPhone ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              متصل
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-sand-300">
              <XCircle className="h-4 w-4" />
              متصل نیست
            </span>
          )}
        </div>

        {/* Google row */}
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-border/50">
              <GoogleIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-sand-700">حساب گوگل</p>
              {hasGoogle && profile?.email ? (
                <p className="text-xs text-sand-400" dir="ltr">{profile.email}</p>
              ) : (
                <p className="text-xs text-sand-400">متصل نیست</p>
              )}
            </div>
          </div>
          {hasGoogle ? (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              متصل
            </span>
          ) : (
            <button
              type="button"
              onClick={linkGoogle}
              className="text-xs font-medium text-primary hover:underline transition-colors"
            >
              اتصال
            </button>
          )}
        </div>
      </div>

      {/* Referral code */}
      <div className="rounded-2xl bg-gradient-to-bl from-rose-50 to-gold-50 p-6 shadow-soft border border-border/40">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-sand-800">کد معرفی شما</h3>
        </div>
        <p className="font-heading text-xl font-bold text-primary tracking-widest">
          {profile?.referral_code ?? '------'}
        </p>
        <p className="text-sm text-sand-400 mt-1">با اشتراک‌گذاری این کد، پاداش دریافت کنید</p>
      </div>
    </div>
  );
}
