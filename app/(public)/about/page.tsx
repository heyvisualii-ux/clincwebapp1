import { supabase } from '@/lib/supabase';
import type { Clinic } from '@/types/database';
import { Award, Heart, ShieldCheck, Sparkles, Users, Stethoscope } from 'lucide-react';

export default async function AboutPage() {
  const { data } = await supabase.from('clinics').select('*').eq('is_active', true).limit(1).maybeSingle();
  const clinic = data as Clinic | null;

  const values = [
    { icon: Heart, title: 'تعهد به بیماران', desc: 'رضایت و سلامت بیماران اولویت اصلی ماست' },
    { icon: Award, title: 'تخصص و تجربه', desc: 'بیش از یک دهه تجربه در خدمات زیبایی' },
    { icon: ShieldCheck, title: 'استانداردهای ایمنی', desc: 'رعایت کامل پروتکل‌های بهداشتی' },
    { icon: Stethoscope, title: 'تجهیزات پیشرفته', desc: 'استفاده از مدرن‌ترین دستگاه‌ها' },
  ];

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-20 lg:py-28 text-center">
          <span className="text-sm font-medium text-primary">درباره ما</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800 mt-3">
            کلینیک زیبایی آریا
          </h1>
          <p className="text-sand-500 mt-4 max-w-2xl mx-auto leading-relaxed">
            {clinic?.about ?? 'کلینیک زیبایی آریا با بیش از یک دهه تجربه، ارائه‌دهنده خدمات تخصصی پوست، مو و زیبایی در فضایی لوکس و آرامش‌بخش است.'}
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-luxe aspect-[4/3]">
            <img
              src={clinic?.cover_url ?? 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800'}
              alt="کلینیک آریا"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-5">
            <h2 className="font-heading text-3xl font-bold text-sand-800">داستان ما</h2>
            <p className="text-sand-500 leading-relaxed">
              کلینیک زیبایی آریا در سال ۱۳۹۱ با هدف ارائه خدمات تخصصی پوست و زیبایی در
              فضایی مدرن و آرامش‌بخش تاسیس شد. ما با بهره‌گیری از دانش روز و تجهیزات
              پیشرفته، تجربه‌ای متمایز از مراقبت‌های زیبایی را برای شما فراهم می‌کنیم.
            </p>
            <p className="text-sand-500 leading-relaxed">
              تیم متخصص ما تحت نظر دکتر سارا محمدی، با تعهد به استانداردهای بین‌المللی،
              بهترین نتیجه را برای هر بیمار تضمین می‌کند. ما به حریم خصوصی بیماران
              احترام می‌گذاریم و اطمینان می‌دهیم که اطلاعات شما نزد ما محفوظ است.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center rounded-2xl bg-muted/50 p-4">
                <p className="font-heading text-2xl font-bold text-primary nums-fa">+۱۲</p>
                <p className="text-xs text-sand-400 mt-1">سال تجربه</p>
              </div>
              <div className="text-center rounded-2xl bg-muted/50 p-4">
                <p className="font-heading text-2xl font-bold text-primary nums-fa">+۸۰۰۰</p>
                <p className="text-xs text-sand-400 mt-1">بیمار راضی</p>
              </div>
              <div className="text-center rounded-2xl bg-muted/50 p-4">
                <p className="font-heading text-2xl font-bold text-primary nums-fa">۸</p>
                <p className="text-xs text-sand-400 mt-1">خدمت تخصصی</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-sand-800">ارزش‌های ما</h2>
          <p className="text-sand-400 mt-3">اصولی که ما به آن پایبندیم</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="rounded-2xl bg-card p-6 shadow-soft border border-border/40 hover:shadow-luxe transition-shadow text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary mx-auto mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading font-semibold text-sand-800 mb-2">{v.title}</h3>
                <p className="text-sm text-sand-400 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
