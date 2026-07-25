import {
  Sparkles,
  CalendarHeart,
  ChevronLeft,
  ShieldCheck,
  Award,
  Users,
  Stethoscope,
  Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Service, Doctor, Clinic } from '@/types/database';

async function getData() {
  const [services, doctor, clinic] = await Promise.all([
    supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('doctors').select('*').eq('is_active', true).limit(1).maybeSingle(),
    supabase.from('clinics').select('*').eq('is_active', true).limit(1).maybeSingle(),
  ]);
  return {
    services: (services.data ?? []) as Service[],
    doctor: doctor.data as Doctor | null,
    clinic: clinic.data as Clinic | null,
  };
}

export default async function HomePage() {
  const { services, doctor, clinic } = await getData();

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-luxe" />
        <div className="absolute inset-0 bg-grain opacity-60" />
        <div className="container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-primary shadow-soft backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                زیبایی، تخصص و اعتماد
              </span>
              <h1 className="font-heading text-4xl lg:text-6xl font-bold text-sand-800 leading-tight text-balance">
                تجربه‌ای متفاوت از
                <br />
                <span className="text-gradient-rose">مراقبت‌های زیبایی</span>
              </h1>
              <p className="text-lg text-sand-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {clinic?.about ?? 'کلینیک زیبایی آریا با بیش از یک دهه تجربه، ارائه‌دهنده خدمات تخصصی پوست، مو و زیبایی در فضایی لوکس و آرامش‌بخش است.'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <a href="/reserve">
                  <span className="inline-flex items-center gap-2 rounded-xl gradient-rose px-7 py-3.5 text-white font-medium shadow-luxe hover:shadow-lg transition-all hover:scale-[1.02]">
                    <CalendarHeart className="h-5 w-5" />
                    رزرو آنلاین نوبت
                  </span>
                </a>
                <a href="/services">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-7 py-3.5 text-sand-700 font-medium shadow-soft backdrop-blur hover:bg-white transition-all">
                    مشاهده خدمات
                    <ChevronLeft className="h-5 w-5" />
                  </span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-luxe aspect-[4/5] max-w-md mx-auto">
                <img
                  src="https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="کلینیک زیبایی"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-2xl bg-white p-5 shadow-luxe hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sand-800 nums-fa">+۸۰۰۰</p>
                    <p className="text-xs text-sand-400">بیمار راضی</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: '+۱۲', label: 'سال تجربه', icon: Award },
            { value: '+۸۰۰۰', label: 'بیمار راضی', icon: Users },
            { value: '۸', label: 'خدمت تخصصی', icon: Stethoscope },
            { value: '۹۸٪', label: 'رضایت بیماران', icon: Heart },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="rounded-2xl bg-card p-5 shadow-soft border border-border/40 hover:shadow-luxe transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-bold text-sand-800 nums-fa">{stat.value}</p>
                    <p className="text-xs text-sand-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services preview */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary">خدمات ما</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold text-sand-800 mt-2">
            خدمات تخصصی کلینیک
          </h2>
          <p className="text-sand-400 mt-3 max-w-xl mx-auto">
            مجموعه‌ای کامل از خدمات پوست، مو و زیبایی با استفاده از پیشرفته‌ترین تجهیزات
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.slice(0, 4).map((s) => (
            <a
              key={s.id}
              href={`/services#${s.slug}`}
              className="group rounded-2xl bg-card overflow-hidden shadow-soft border border-border/40 hover:shadow-luxe transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={s.image_url ?? 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-sand-800 mb-1">{s.title}</h3>
                <p className="text-sm text-sand-400 line-clamp-2 mb-3">{s.short_description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-medium nums-fa">
                    {new Intl.NumberFormat('fa-IR').format(s.price)} تومان
                  </span>
                  <ChevronLeft className="h-4 w-4 text-sand-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl bg-muted px-6 py-3 text-sand-600 font-medium hover:bg-primary-soft hover:text-primary transition-all"
          >
            مشاهده همه خدمات
            <ChevronLeft className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Doctor section */}
      {doctor && (
        <section className="container py-16">
          <div className="rounded-3xl bg-gradient-to-bl from-rose-50 to-gold-50 p-8 lg:p-14">
            <div className="grid lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-2">
                <div className="relative rounded-2xl overflow-hidden shadow-luxe aspect-square max-w-sm mx-auto">
                  <img
                    src={doctor.avatar_url ?? 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={doctor.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-3 space-y-4 text-center lg:text-right">
                <span className="text-sm font-medium text-primary">{doctor.title}</span>
                <h2 className="font-heading text-3xl lg:text-4xl font-bold text-sand-800">
                  {doctor.full_name}
                </h2>
                <p className="text-sand-500 leading-relaxed">{doctor.bio}</p>
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
                  {['لیزر', 'بوتاکس', 'فیلر', 'پاکسازی', 'مزوتراپی'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/70 px-3.5 py-1.5 text-sm text-sand-600 shadow-soft">
                      {tag}
                    </span>
                  ))}
                </div>
                <a href="/doctor" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
                  اطلاعات بیشتر
                  <ChevronLeft className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-3xl gradient-rose p-10 lg:p-16 text-center text-white shadow-luxe relative overflow-hidden">
          <div className="absolute inset-0 bg-grain opacity-20" />
          <div className="relative space-y-5">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold">
              آماده‌اید تا زیبایی خود را کشف کنید؟
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              همین حالا نوبت خود را رزرو کنید و اولین قدم را به سمت زیبایی مطلق بردارید
            </p>
            <a href="/reserve">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-primary font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                <CalendarHeart className="h-5 w-5" />
                رزرو نوبت
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
