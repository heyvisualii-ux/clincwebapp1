import { supabase } from '@/lib/supabase';
import type { Doctor } from '@/types/database';
import { Award, Stethoscope, CalendarHeart, GraduationCap, CheckCircle2 } from 'lucide-react';

export default async function DoctorPage() {
  const { data } = await supabase.from('doctors').select('*').eq('is_active', true).limit(1).maybeSingle();
  const doctor = data as Doctor | null;

  if (!doctor) {
    return (
      <div className="container py-20 text-center text-sand-400">اطلاعات پزشک در حال بارگذاری است.</div>
    );
  }

  const expertise = ['لیزر موهای زائد', 'تزریق بوتاکس', 'تزریق فیلر', 'پاکسازی پوست', 'مزوتراپی', 'هیدروفیشیال', 'پیلینگ شیمیایی', 'میکرونیدلینگ'];

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-5 text-center lg:text-right">
              <span className="inline-block text-sm font-medium text-primary">{doctor.title}</span>
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800">{doctor.full_name}</h1>
              <p className="text-sand-500 leading-relaxed max-w-lg mx-auto lg:mx-0">{doctor.bio}</p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-2">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm text-sand-500 nums-fa">{doctor.years_experience} سال تجربه</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span className="text-sm text-sand-500">{doctor.specialty}</span>
                </div>
              </div>
              <a href="/reserve" className="inline-flex items-center gap-2 rounded-xl gradient-rose px-7 py-3.5 text-white font-medium shadow-luxe hover:scale-[1.02] transition-transform">
                <CalendarHeart className="h-5 w-5" />
                رزرو نوبت
              </a>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-luxe aspect-[4/5] max-w-md mx-auto">
                <img
                  src={doctor.avatar_url ?? 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={doctor.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="rounded-3xl bg-card p-8 shadow-soft border border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-xl font-bold text-sand-800">تحصیلات و سوابق</h2>
            </div>
            <ul className="space-y-3 text-sm text-sand-500">
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" /> فارغ‌التحصیل رشته پزشکی از دانشگاه علوم پزشکی تهران</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" /> تخصص پوست و زیبایی با بورد تخصصی</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" /> عضو انجمن متخصصین پوست ایران</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" /> گذراندن دوره‌های تخصصی لیزر و تزریق در اروپا</li>
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4.5 w-4.5 text-success mt-0.5 shrink-0" /> بیش از ۸۰۰۰ بیمار درمان‌شده</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-card p-8 shadow-soft border border-border/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="font-heading text-xl font-bold text-sand-800">تخصص‌ها</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {expertise.map((e) => (
                <span key={e} className="rounded-xl bg-muted/60 px-4 py-2.5 text-sm text-sand-600 border border-border/40">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
