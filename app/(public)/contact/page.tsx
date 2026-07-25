'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setForm({ name: '', phone: '', email: '', message: '' });
    toast.success('پیام شما ارسال شد. به زودی با شما تماس می‌گیریم.');
  }

  const info = [
    { icon: MapPin, label: 'آدرس', value: 'تهران، خیابان فرشته، پلاک ۲۴، طبقه سوم' },
    { icon: Phone, label: 'تلفن', value: '۰۲۱-۸۸۱۲۳۴۵۶', ltr: true },
    { icon: Mail, label: 'ایمیل', value: 'info@aria-clinic.ir', ltr: true },
    { icon: Clock, label: 'ساعات کاری', value: 'شنبه تا چهارشنبه ۹ تا ۱۷، پنجشنبه ۹ تا ۱۳' },
  ];

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-20 lg:py-28 text-center">
          <span className="text-sm font-medium text-primary">تماس با ما</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800 mt-3">
            با ما در ارتباط باشید
          </h1>
          <p className="text-sand-500 mt-4 max-w-xl mx-auto">
            هرگونه سوال یا پیشنهاد دارید، خوشحال می‌شویم بشنویم
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            {info.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4 rounded-2xl bg-card p-5 shadow-soft border border-border/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-sand-400 mb-1">{item.label}</p>
                    <p className="text-sand-700 font-medium nums-fa" dir={item.ltr ? 'ltr' : 'rtl'}>{item.value}</p>
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl overflow-hidden shadow-soft border border-border/40 aspect-video mt-6">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=51.38%2C35.75%2C51.42%2C35.78&layer=mapnik"
                className="w-full h-full"
                title="موقعیت کلینیک"
                loading="lazy"
              />
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl bg-card p-8 shadow-luxe border border-border/40 space-y-5">
            <h2 className="font-heading text-xl font-bold text-sand-800">فرم تماس</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">نام و نام خانوادگی</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="نام شما" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">شماره موبایل</label>
                <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="0912..." className="nums-fa" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">ایمیل (اختیاری)</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">پیام شما</label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} placeholder="پیام خود را بنویسید..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-rose text-white h-12 shadow-soft hover:shadow-luxe">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  ارسال پیام
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
