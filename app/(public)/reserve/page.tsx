'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  User,
  CalendarHeart,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { formatPrice, formatJalali, formatTime, toJalali, toPersianDigits } from '@/lib/date';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Service, Doctor, ScheduleRule, ScheduleOverride, Appointment } from '@/types/database';

const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export default function ReservePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: svc }, { data: doc }] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('doctors').select('*').eq('is_active', true).limit(1).maybeSingle(),
      ]);
      setServices(svc as Service[]);
      setDoctor(doc as Doctor | null);
      const svcId = params.get('service');
      if (svcId) {
        const found = (svc as Service[]).find((s) => s.id === svcId);
        if (found) {
          setSelectedService(found);
          setStep(2);
        }
      }
    })();
  }, [params]);

  // Redirect to login if not authenticated when reaching step 3
  useEffect(() => {
    if (!authLoading && !user && step >= 3) {
      router.push('/login');
    }
  }, [authLoading, user, step, router]);

  const computeSlots = useCallback(async (date: Date) => {
    if (!doctor) return;
    setLoadingSlots(true);
    setSelectedTime(null);

    const weekday = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    const [{ data: rules }, { data: overrides }, { data: existing }] = await Promise.all([
      supabase.from('schedule_rules').select('*').eq('doctor_id', doctor.id).eq('weekday', weekday).eq('is_active', true),
      supabase.from('schedule_overrides').select('*').eq('doctor_id', doctor.id).eq('date', dateStr),
      supabase.from('appointments').select('start_time').eq('doctor_id', doctor.id).eq('date', dateStr).in('status', ['pending', 'confirmed']),
    ]);

    const override = (overrides as ScheduleOverride[] | null)?.[0];
    const rule = (rules as ScheduleRule[] | null)?.[0];

    if (override?.type === 'closed' || override?.type === 'holiday' || override?.type === 'vacation') {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    if (!rule) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    let startTime = override?.start_time ?? rule.start_time;
    let endTime = override?.end_time ?? rule.end_time;
    const breakStart = rule.break_start;
    const breakEnd = rule.break_end;
    const slotMin = rule.slot_minutes;

    const slots: string[] = [];
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const [bh, bm] = breakStart ? breakStart.split(':').map(Number) : [null, null];
    const [beh, bem] = breakEnd ? breakEnd.split(':').map(Number) : [null, null];
    const breakStartMin = bh !== null && bm !== null ? bh * 60 + bm : null;
    const breakEndMin = beh !== null && bem !== null ? beh * 60 + bem : null;
    const bookedTimes = new Set((existing as Appointment[] | null ?? []).map((a) => a.start_time));

    while (cur + slotMin <= end) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const inBreak = breakStartMin !== null && breakEndMin !== null && cur >= breakStartMin && cur < breakEndMin;
      if (!inBreak && !bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
      cur += slotMin;
    }

    setAvailableSlots(slots);
    setLoadingSlots(false);
  }, [doctor]);

  useEffect(() => {
    if (selectedDate) computeSlots(selectedDate);
  }, [selectedDate, computeSlots]);

  async function bookAppointment() {
    if (!user || !doctor || !selectedService || !selectedDate || !selectedTime) return;
    setBooking(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [h, m] = selectedTime.split(':').map(Number);
      const endMinutes = h * 60 + m + selectedService.duration_minutes;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

      const { error } = await supabase.from('appointments').insert({
        clinic_id: doctor.clinic_id,
        doctor_id: doctor.id,
        patient_id: user.id,
        service_id: selectedService.id,
        date: dateStr,
        start_time: selectedTime,
        end_time: endTime,
        status: 'pending',
        price: selectedService.price,
      });

      if (error) throw error;
      setStep(5);
      toast.success('نوبت شما با موفقیت ثبت شد');
    } catch (err: any) {
      toast.error(err.message ?? 'ثبت نوبت ناموفق بود');
    } finally {
      setBooking(false);
    }
  }

  // Calendar generation
  const [calMonth, setCalMonth] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
  }

  const jalaliMonth = toJalali(calMonth);

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-16 text-center">
          <span className="text-sm font-medium text-primary">رزرو آنلاین</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800 mt-3">
            رزرو نوبت
          </h1>
        </div>
      </section>

      <section className="container py-12 max-w-4xl">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-10">
          {[
            { n: 1, label: 'انتخاب خدمت', icon: Sparkles },
            { n: 2, label: 'انتخاب تاریخ', icon: CalendarDays },
            { n: 3, label: 'انتخاب ساعت', icon: Clock },
            { n: 4, label: 'تایید', icon: CheckCircle2 },
          ].map((s, i) => {
            const Icon = s.icon;
            const active = step >= s.n;
            return (
              <div key={s.n} className="flex items-center">
                <div className={cn('flex flex-col items-center gap-2', active ? 'text-primary' : 'text-sand-300')}>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl transition-all', active ? 'bg-primary text-white shadow-soft' : 'bg-muted')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 3 && <div className={cn('w-8 sm:w-16 h-0.5 mx-1 rounded-full transition-all', step > s.n ? 'bg-primary' : 'bg-border')} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedService(s); setStep(2); }}
                className={cn(
                  'group rounded-2xl bg-card p-5 text-right shadow-soft border-2 transition-all hover:shadow-luxe hover:-translate-y-0.5',
                  selectedService?.id === s.id ? 'border-primary' : 'border-border/40',
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-sand-800">{s.title}</h3>
                </div>
                <p className="text-sm text-sand-400 line-clamp-2 mb-3">{s.short_description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary font-medium nums-fa">{formatPrice(s.price)}</span>
                  <span className="text-sand-400 flex items-center gap-1 nums-fa">{s.duration_minutes} دقیقه</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date */}
        {step === 2 && (
          <div className="rounded-3xl bg-card p-8 shadow-luxe border border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-sand-800">انتخاب تاریخ</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <ChevronRight className="h-5 w-5 text-sand-500" />
                </button>
                <span className="font-medium text-sand-700 min-w-32 text-center">{jalaliMonth.monthName} {toPersianDigits(jalaliMonth.year)}</span>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <ChevronLeft className="h-5 w-5 text-sand-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d) => (
                <div key={d} className="text-center text-xs text-sand-400 font-medium py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, i) => {
                if (!date) return <div key={i} />;
                const isPast = date < today;
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const j = toJalali(date);
                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => { setSelectedDate(date); setStep(3); }}
                    className={cn(
                      'aspect-square rounded-xl text-sm font-medium transition-all nums-fa',
                      isPast && 'text-sand-200 cursor-not-allowed',
                      !isPast && !isSelected && 'text-sand-600 hover:bg-primary-soft hover:text-primary',
                      isSelected && 'bg-primary text-white shadow-soft',
                    )}
                  >
                    {toPersianDigits(j.day)}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(1)}>مرحله قبل</Button>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="rounded-3xl bg-card p-8 shadow-luxe border border-border/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-sand-800">انتخاب ساعت</h2>
              <span className="text-sm text-sand-400">{selectedDate && formatJalali(selectedDate, true)}</span>
            </div>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12 text-sand-400">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 text-sand-200" />
                <p>در این تاریخ نوبتی موجود نیست</p>
                <Button variant="ghost" className="mt-4" onClick={() => setStep(2)}>انتخاب تاریخ دیگر</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => { setSelectedTime(slot); setStep(4); }}
                      className={cn(
                        'rounded-xl py-3 text-sm font-medium transition-all nums-fa',
                        selectedTime === slot
                          ? 'bg-primary text-white shadow-soft'
                          : 'bg-muted/60 text-sand-600 hover:bg-primary-soft hover:text-primary',
                      )}
                    >
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-6">
                  <Button variant="ghost" onClick={() => setStep(2)}>مرحله قبل</Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && selectedService && selectedDate && selectedTime && (
          <div className="rounded-3xl bg-card p-8 shadow-luxe border border-border/40">
            <h2 className="font-heading text-xl font-bold text-sand-800 mb-6">تایید نوبت</h2>
            <div className="space-y-3 mb-6">
              {[
                { label: 'خدمت', value: selectedService.title, icon: Sparkles },
                { label: 'تاریخ', value: formatJalali(selectedDate, true), icon: CalendarDays },
                { label: 'ساعت', value: formatTime(selectedTime), icon: Clock },
                { label: 'پزشک', value: doctor?.full_name ?? '', icon: User },
                { label: 'مبلغ', value: formatPrice(selectedService.price), icon: CalendarHeart },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                    <div className="flex items-center gap-2.5 text-sand-400 text-sm">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <span className="font-medium text-sand-700">{item.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>مرحله قبل</Button>
              <Button onClick={bookAppointment} disabled={booking} className="gradient-rose text-white shadow-soft hover:shadow-luxe">
                {booking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تایید و ثبت نوبت'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="rounded-3xl bg-card p-12 shadow-luxe border border-border/40 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-sand-800 mb-3">نوبت شما ثبت شد!</h2>
            <p className="text-sand-400 mb-6">نوبت شما با موفقیت ثبت شد. می‌توانید جزئیات را در داشبورد خود مشاهده کنید.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/dashboard/appointments')} className="gradient-rose text-white">
                مشاهده نوبت‌ها
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>بازگشت به خانه</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
