'use client';

import { useEffect, useState } from 'react';
import { CalendarRange, Plus, X, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatTime, toJalali, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const WEEKDAYS = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

export default function AdminCalendarPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newOverride, setNewOverride] = useState({ date: '', type: 'closed' as string, note: '' });

  const doctorId = '22222222-2222-2222-2222-222222222222';
  const clinicId = '11111111-1111-1111-1111-111111111111';

  useEffect(() => {
    (async () => {
      const [{ data: r }, { data: o }, { data: a }] = await Promise.all([
        supabase.from('schedule_rules').select('*').eq('doctor_id', doctorId),
        supabase.from('schedule_overrides').select('*').eq('doctor_id', doctorId),
        supabase.from('appointments').select('*').eq('doctor_id', doctorId),
      ]);
      setRules(r ?? []);
      setOverrides(o ?? []);
      setAppts(a ?? []);
      setLoading(false);
    })();
  }, []);

  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));

  async function addOverride() {
    if (!newOverride.date) return;
    const { error } = await supabase.from('schedule_overrides').upsert({
      doctor_id: doctorId, clinic_id: clinicId, date: newOverride.date, type: newOverride.type, note: newOverride.note,
    }, { onConflict: 'doctor_id,date' });
    if (error) { toast.error('ثبت ناموفق بود'); return; }
    const { data } = await supabase.from('schedule_overrides').select('*').eq('doctor_id', doctorId);
    setOverrides(data ?? []);
    setShowAdd(false);
    setNewOverride({ date: '', type: 'closed', note: '' });
    toast.success('استثنا ثبت شد');
  }

  async function removeOverride(id: string) {
    await supabase.from('schedule_overrides').delete().eq('id', id);
    setOverrides(overrides.filter((o) => o.id !== id));
    toast.success('استثنا حذف شد');
  }

  function getDayStatus(date: Date): { type: string; label: string; color: string } {
    const dateStr = date.toISOString().split('T')[0];
    const override = overrides.find((o) => o.date === dateStr);
    if (override) {
      const styles: Record<string, string> = { closed: 'bg-destructive/10 text-destructive', holiday: 'bg-destructive/10 text-destructive', vacation: 'bg-warning-soft text-warning', open: 'bg-success-soft text-success' };
      const labels: Record<string, string> = { closed: 'تعطیل', holiday: 'تعطیلی', vacation: 'مرخصی', open: 'باز' };
      return { type: override.type, label: labels[override.type] ?? '', color: styles[override.type] ?? '' };
    }
    const weekday = date.getDay();
    const rule = rules.find((r) => r.weekday === weekday && r.is_active);
    const apptCount = appts.filter((a) => a.date === dateStr && a.status !== 'cancelled').length;
    if (rule) return { type: 'open', label: `${toPersianDigits(apptCount)} نوبت`, color: 'bg-info-soft text-info' };
    return { type: 'closed', label: 'تعطیل', color: 'bg-muted text-sand-300' };
  }

  const jalaliMonth = toJalali(calMonth);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-sand-800">تقویم</h1>
          <p className="text-sand-400 mt-1">مدیریت تقویم و ساعات کاری</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gradient-rose text-white">
          <Plus className="h-4 w-4 ml-1" />
          افزودن استثنا
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-semibold text-sand-800">{jalaliMonth.monthName} {toPersianDigits(jalaliMonth.year)}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronRight className="h-5 w-5 text-sand-500" />
              </button>
              <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="h-5 w-5 text-sand-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((d) => <div key={d} className="text-center text-xs text-sand-400 font-medium py-2">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} />;
              const status = getDayStatus(date);
              const j = toJalali(date);
              return (
                <div key={i} className={cn('aspect-square rounded-xl p-1.5 flex flex-col items-center justify-center text-sm transition-all', status.color)}>
                  <span className="font-medium nums-fa">{toPersianDigits(j.day)}</span>
                  <span className="text-[10px] mt-0.5">{status.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">ساعات کاری هفتگی</h2>
          <div className="space-y-2">
            {rules.sort((a, b) => a.weekday - b.weekday).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                <span className="text-sm text-sand-600">{WEEKDAYS[r.weekday]}</span>
                <span className="text-sm text-sand-500 nums-fa" dir="ltr">{r.start_time} - {r.end_time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {overrides.length > 0 && (
        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
          <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">استثناهای تقویم</h2>
          <div className="space-y-2">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                <div>
                  <span className="text-sm font-medium text-sand-700 nums-fa">{toJalali(o.date).year}/{toPersianDigits(String(toJalali(o.date).month).padStart(2, '0'))}/{toPersianDigits(String(toJalali(o.date).day).padStart(2, '0'))}</span>
                  {o.note && <span className="text-sm text-sand-400 mr-2">- {o.note}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-warning-soft text-warning">{o.type === 'closed' ? 'تعطیل' : o.type === 'holiday' ? 'تعطیلی' : o.type === 'vacation' ? 'مرخصی' : 'باز'}</span>
                  <button onClick={() => removeOverride(o.id)} className="text-destructive hover:bg-destructive/5 p-1.5 rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="rounded-3xl bg-card p-6 w-full max-w-md shadow-luxe" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-bold text-sand-800 mb-4">افزودن استثنای تقویم</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-sand-600 mb-1.5 block">تاریخ</label>
                <input type="date" value={newOverride.date} onChange={(e) => setNewOverride({ ...newOverride, date: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-sand-600 mb-1.5 block">نوع</label>
                <select value={newOverride.type} onChange={(e) => setNewOverride({ ...newOverride, type: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm">
                  <option value="closed">تعطیل</option>
                  <option value="holiday">تعطیلی رسمی</option>
                  <option value="vacation">مرخصی</option>
                  <option value="open">باز کردن</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-sand-600 mb-1.5 block">یادداشت (اختیاری)</label>
                <input type="text" value={newOverride.note} onChange={(e) => setNewOverride({ ...newOverride, note: e.target.value })} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm" placeholder="مثال: تعطیلی نوروز" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={addOverride} className="flex-1 gradient-rose text-white">ثبت</Button>
                <Button variant="ghost" onClick={() => setShowAdd(false)}>انصراف</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
