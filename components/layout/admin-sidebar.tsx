'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Gift,
  FileText,
  Stethoscope,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Sparkles,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

const NAV = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/patients', label: 'بیماران', icon: Users },
  { href: '/admin/appointments', label: 'نوبت‌ها', icon: CalendarDays },
  { href: '/admin/calendar', label: 'تقویم', icon: CalendarRange },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: CreditCard },
  { href: '/admin/referrals', label: 'معرفی‌ها', icon: Gift },
  { href: '/admin/medical', label: 'پرونده‌ها', icon: FileText },
  { href: '/admin/services', label: 'خدمات', icon: Stethoscope },
  { href: '/admin/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/admin/settings', label: 'تنظیمات', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-card shadow-soft border border-border"
        onClick={() => setOpen(!open)}
        aria-label="منو"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 right-0 h-screen w-72 bg-sand-800 text-sand-100 z-50 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-rose shadow-luxe">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-heading font-bold text-white">کلینیک آریا</p>
                <p className="text-xs text-sand-300">پنل مدیریت</p>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary font-semibold">
                {profile?.full_name?.charAt(0) ?? 'م'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name ?? 'مدیر'}
                </p>
                <p className="text-xs text-sand-300">مدیر کلینیک</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary text-white shadow-soft'
                      : 'text-sand-300 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-sand-300 hover:text-white hover:bg-white/5">
                <Home className="h-4 w-4 ml-2" />
                مشاهده سایت
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
