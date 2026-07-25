import { supabase } from '@/lib/supabase';
import type { Service } from '@/types/database';
import { formatPrice } from '@/lib/date';
import { Clock, ChevronLeft } from 'lucide-react';

export default async function ServicesPage() {
  const { data } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order');
  const services = (data ?? []) as Service[];

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-20 lg:py-28 text-center">
          <span className="text-sm font-medium text-primary">خدمات ما</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800 mt-3">
            خدمات تخصصی زیبایی
          </h1>
          <p className="text-sand-500 mt-4 max-w-2xl mx-auto">
            مجموعه‌ای کامل از خدمات پوست، مو و زیبایی با استفاده از پیشرفته‌ترین تجهیزات و توسط متخصصین مجرب
          </p>
        </div>
      </section>

      <section className="container py-16">
        {categories.map((cat) => (
          <div key={cat} className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-sand-800 mb-6">{cat}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.filter((s) => s.category === cat).map((s) => (
                <div
                  key={s.id}
                  id={s.slug}
                  className="group rounded-2xl bg-card overflow-hidden shadow-soft border border-border/40 hover:shadow-luxe transition-all duration-300 hover:-translate-y-1 scroll-mt-24"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={s.image_url ?? 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-sand-800 mb-2">{s.title}</h3>
                    <p className="text-sm text-sand-400 leading-relaxed mb-4 line-clamp-3">{s.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="space-y-1">
                        <p className="text-primary font-bold nums-fa">{formatPrice(s.price)}</p>
                        <p className="text-xs text-sand-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="nums-fa">{s.duration_minutes} دقیقه</span>
                        </p>
                      </div>
                      <a
                        href={`/reserve?service=${s.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary-soft px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-all"
                      >
                        رزرو نوبت
                        <ChevronLeft className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
