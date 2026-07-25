'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Phone, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { normalizePhone } from '@/lib/auth-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type LoginView = 'choose' | 'phone' | 'otp';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<LoginView>('choose');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('لطفاً شماره موبایل صحیح وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setView('otp');
      toast.success('کد تایید ارسال شد');
    } catch (err: any) {
      setError(err.message ?? 'ارسال کد ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length < 6) {
      setError('کد تایید ۶ رقمی را وارد کنید');
      return;
    }
    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { error } = await supabase.auth.verifyOtp({
        phone: normalized,
        token: otp,
        type: 'sms',
      });
      if (error) throw error;

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('auth_providers')
          .eq('id', userId)
          .maybeSingle();

        const current: string[] = existing?.auth_providers ?? [];
        const updated = current.includes('phone') ? current : [...current, 'phone'];

        await supabase.from('profiles').upsert(
          { id: userId, phone: normalized, auth_providers: updated },
          { onConflict: 'id' },
        );
      }

      toast.success('ورود موفقیت‌آمیز بود');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'تایید ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'ورود با گوگل ناموفق بود');
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-rose-50 via-background to-gold-50 p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-rose shadow-luxe mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </span>
          <h1 className="font-heading text-2xl font-bold text-sand-800">کلینیک زیبایی آریا</h1>
          <p className="text-sand-400 mt-2">ورود به حساب کاربری</p>
        </div>

        <div className="rounded-3xl bg-card p-8 shadow-luxe border border-border/40">

          {/* ── Choose method ── */}
          {view === 'choose' && (
            <div className="space-y-4">
              <p className="text-sm text-center text-sand-500 mb-6">روش ورود را انتخاب کنید</p>

              {/* Google */}
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-white hover:bg-sand-50 active:bg-sand-100 transition-all h-12 text-sm font-medium text-sand-700 shadow-sm hover:shadow-md disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-sand-400" />
                ) : (
                  <GoogleIcon />
                )}
                <span>ادامه با گوگل</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-xs text-sand-300">یا</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              {/* Phone */}
              <button
                type="button"
                onClick={() => { setError(null); setView('phone'); }}
                className="w-full flex items-center justify-center gap-3 rounded-xl gradient-rose h-12 text-sm font-medium text-white shadow-soft hover:shadow-luxe transition-all"
              >
                <Phone className="h-5 w-5" />
                ادامه با شماره موبایل
              </button>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
          )}

          {/* ── Phone entry ── */}
          {view === 'phone' && (
            <form onSubmit={sendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">شماره موبایل</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sand-300" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 6789"
                    className="pr-11 nums-fa text-left"
                    dir="ltr"
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-rose text-white h-12 text-base shadow-soft hover:shadow-luxe"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'ارسال کد تایید'}
              </Button>

              <button
                type="button"
                onClick={() => { setView('choose'); setError(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-sand-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                بازگشت
              </button>
            </form>
          )}

          {/* ── OTP entry ── */}
          {view === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">کد تایید</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  className="text-center text-2xl tracking-[0.5em] nums-fa h-14"
                  dir="ltr"
                  autoFocus
                />
                <p className="text-xs text-sand-400">
                  کد ۶ رقمی به شماره{' '}
                  <span className="nums-fa" dir="ltr">{phone}</span> ارسال شد
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-rose text-white h-12 text-base shadow-soft hover:shadow-luxe"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تایید و ورود'}
              </Button>

              <button
                type="button"
                onClick={() => { setView('phone'); setOtp(''); setError(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-sand-400 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                تغییر شماره موبایل
              </button>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-sand-400">
          <ShieldCheck className="h-4 w-4" />
          اطلاعات شما با رمزنگاری محافظت می‌شود
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-sand-400 hover:text-primary transition-colors">
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
