'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Activity, Pill, AlertTriangle, Stethoscope, ClipboardList } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, toPersianDigits } from '@/lib/date';

const TREATMENT_STATUS: Record<string, string> = { planned: 'برنامه‌ریزی شده', in_progress: 'در حال انجام', completed: 'تکمیل شده', paused: 'متوقف شده' };

export default function MedicalPage() {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rec } = await supabase.from('medical_records').select('*').eq('patient_id', user.id).maybeSingle();
      setRecord(rec);
      if (rec) {
        const [{ data: trts }, { data: nts }] = await Promise.all([
          supabase.from('treatments').select('*').eq('medical_record_id', rec.id).order('created_at', { ascending: false }),
          supabase.from('doctor_notes').select('*').eq('medical_record_id', rec.id).order('created_at', { ascending: false }),
        ]);
        setTreatments(trts ?? []);
        setNotes(nts ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const infoCards = [
    { icon: AlertTriangle, label: 'حساسیت‌ها', value: record?.allergies ?? 'ثبت نشده' },
    { icon: Pill, label: 'داروها', value: record?.medications ?? 'ثبت نشده' },
    { icon: Activity, label: 'سوابق پزشکی', value: record?.medical_history ?? 'ثبت نشده' },
    { icon: ClipboardList, label: 'تشخیص', value: record?.diagnosis ?? 'ثبت نشده' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پرونده پزشکی</h1>
        <p className="text-sand-400 mt-1">اطلاعات پزشکی و درمانی شما</p>
      </div>

      {!record ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <FileText className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">پرونده پزشکی شما هنوز ایجاد نشده است</p>
          <p className="text-sm text-sand-300 mt-1">پس از اولین ویزیت، پرونده شما توسط پزشک تکمیل می‌شود</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {infoCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-sm font-medium text-sand-600">{c.label}</span>
                  </div>
                  <p className="text-sm text-sand-500 leading-relaxed">{c.value}</p>
                </div>
              );
            })}
          </div>

          {record?.notes && (
            <div className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <h3 className="font-heading font-semibold text-sand-800 mb-2">یادداشت‌های عمومی</h3>
              <p className="text-sm text-sand-500 leading-relaxed">{record.notes}</p>
            </div>
          )}

          <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">تاریخچه درمان‌ها</h2>
            {treatments.length === 0 ? (
              <p className="text-center py-6 text-sand-400">درمانی ثبت نشده است</p>
            ) : (
              <div className="space-y-3">
                {treatments.map((t) => (
                  <div key={t.id} className="rounded-xl bg-muted/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sand-700">{t.title}</h4>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary-soft text-primary">{TREATMENT_STATUS[t.status]}</span>
                    </div>
                    {t.description && <p className="text-sm text-sand-400 mb-3">{t.description}</p>}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full gradient-rose rounded-full transition-all" style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="text-sm font-medium text-sand-600 nums-fa">{toPersianDigits(t.progress)}٪</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40">
            <h2 className="font-heading text-lg font-semibold text-sand-800 mb-4">یادداشت‌های پزشک</h2>
            {notes.length === 0 ? (
              <p className="text-center py-6 text-sand-400">یادداشتی ثبت نشده است</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-xl bg-muted/40 p-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft text-info shrink-0">
                      <Stethoscope className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm text-sand-600 leading-relaxed">{n.body}</p>
                      <p className="text-xs text-sand-300 mt-1">{formatJalali(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
