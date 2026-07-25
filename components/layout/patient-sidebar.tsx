'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  FileText,
  MessageSquare,
  User,
  Gift,
  Images,
  Paperclip,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { prettyPhone } from '@/lib/auth-helpers';

const NAV = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/dashboard/appointments', label: 'نوبت‌ها', icon: CalendarDays },
  { href: '/dashboard/payments', label: 'پرداخت‌ها', icon: Wallet },
  { href: '/dashboard/wallet', label: 'کیف پول', icon: Wallet },
  { href: '/dashboard/medical', label: 'پرونده پزشکی', icon: FileText },
  { href: '/dashboard/messages', label: 'پیام‌ها', icon: MessageSquare },
  { href: '/dashboard/files', label: 'فایل‌ها', icon: Paperclip },
  { href: '/dashboard/images', label: 'تصاویر پزشکی', icon: Images },
  { href: '/dashboard/referral', label: 'معرفی دوستان', icon: Gift },
  { href: '/dashboard/profile', label: 'پروفایل', icon: User },
];

export function PatientSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

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
          'fixed lg:sticky top-0 right-0 h-screen w-72 bg-card border-l border-border/60 z-50 transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-6 border-b border-border/60">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-rose shadow-luxe">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="font-heading font-bold text-sand-800">کلینیک آریا</p>
                <p className="text-xs text-sand-400">داشبورد بیمار</p>
              </div>
            </Link>
          </div>

          <div className="p-4 border-b border-border/60">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary font-semibold">
                {profile?.full_name?.charAt(0) ?? 'ب'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sand-700 truncate">
                  {profile?.full_name ?? 'کاربر'}
                </p>
                <p className="text-xs text-sand-400 nums-fa" dir="ltr">
                  {profile?.phone ? prettyPhone(profile.phone) : ''}
                </p>
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
                      ? 'bg-primary-soft text-primary'
                      : 'text-sand-500 hover:bg-muted/60 hover:text-sand-700',
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border/60 space-y-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-sand-500">
                بازگشت به سایت
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5"
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
