'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Phone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/', label: 'خانه' },
  { href: '/about', label: 'درباره کلینیک' },
  { href: '/services', label: 'خدمات' },
  { href: '/doctor', label: 'پزشک' },
  { href: '/faq', label: 'سوالات متداول' },
  { href: '/contact', label: 'تماس با ما' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/60">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-rose shadow-luxe">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="font-heading text-xl font-bold text-sand-800">
            کلینیک آریا
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'text-primary bg-primary-soft'
                    : 'text-sand-600 hover:text-primary hover:bg-muted/60',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <a
            href="tel:02188123456"
            className="flex items-center gap-2 text-sm text-sand-600 hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="nums-fa">۰۲۱-۸۸۱۲۳۴۵۶</span>
          </a>
          <Link href="/reserve">
            <Button size="sm" className="gradient-rose text-white shadow-soft hover:shadow-luxe transition-shadow">
              رزرو آنلاین
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="منو"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary bg-primary-soft'
                    : 'text-sand-600 hover:bg-muted/60',
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/reserve" onClick={() => setOpen(false)}>
              <Button className="w-full mt-2 gradient-rose text-white">
                رزرو آنلاین
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
