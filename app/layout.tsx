import './globals.css';
import type { Metadata } from 'next';
import { Vazirmatn, Noto_Naskh_Arabic } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth-context';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'کلینیک زیبایی | رزرو آنلاین و مدیریت پذیرش',
  description:
    'کلینیک زیبایی لوکس — رزرو آنلاین نوبت، داشبورد بیمار و سامانه مدیریت پذیرش. تجربه‌ای مدرن از مراقبت‌های زیبایی.',
  openGraph: {
    title: 'کلینیک زیبایی',
    description: 'رزرو آنلاین نوبت و مدیریت پذیرش',
  },
};

export const viewport = {
  themeColor: '#f7f5f1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${notoNaskh.variable} font-body antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <SonnerToaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}
