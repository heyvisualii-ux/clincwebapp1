import Link from 'next/link';
import { Sparkles, Phone, MapPin, Mail, Instagram, Send } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-background to-rose-50/40 mt-20">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-rose shadow-luxe">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <span className="font-heading text-xl font-bold text-sand-800">
                کلینیک آریا
              </span>
            </div>
            <p className="text-sm text-sand-500 leading-relaxed max-w-xs">
              کلینیک زیبایی آریا، ارائه‌دهنده خدمات تخصصی پوست، مو و زیبایی در
              فضایی لوکس و آرامش‌بخش.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary-soft hover:text-primary transition-colors"
                aria-label="اینستاگرام"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary-soft hover:text-primary transition-colors"
                aria-label="تلگرام"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sand-700 mb-4">
              دسترسی سریع
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-sand-500 hover:text-primary transition-colors">
                  درباره کلینیک
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sand-500 hover:text-primary transition-colors">
                  خدمات
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="text-sand-500 hover:text-primary transition-colors">
                  پزشک
                </Link>
              </li>
              <li>
                <Link href="/reserve" className="text-sand-500 hover:text-primary transition-colors">
                  رزرو آنلاین
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sand-500 hover:text-primary transition-colors">
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sand-700 mb-4">
              خدمات
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="text-sand-500">پاکسازی پوست</li>
              <li className="text-sand-500">تزریق بوتاکس و فیلر</li>
              <li className="text-sand-500">لیزر موهای زائد</li>
              <li className="text-sand-500">مزوتراپی</li>
              <li className="text-sand-500">هیدروفیشیال</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sand-700 mb-4">
              تماس
            </h3>
            <ul className="space-y-3 text-sm text-sand-500">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>تهران، خیابان فرشته، پلاک ۲۴، طبقه سوم</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span className="nums-fa" dir="ltr">۰۲۱-۸۸۱۲۳۴۵۶</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@aria-clinic.ir</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-sand-400">
          <p>© ۱۴۰۳ کلینیک زیبایی آریا. تمام حقوق محفوظ است.</p>
          <p>طراحی و توسعه با عشق</p>
        </div>
      </div>
    </footer>
  );
}
