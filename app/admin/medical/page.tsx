'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatJalali } from '@/lib/date';
import { Input } from '@/components/ui/input';

export default function AdminMedicalPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('medical_records').select('*, patient:profiles(full_name, phone)').order('created_at', { ascending: false });
      setRecords(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return r.patient?.full_name?.toLowerCase().includes(q) || r.diagnosis?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پرونده‌های پزشکی</h1>
        <p className="text-sand-400 mt-1">مدیریت پرونده‌های بیماران</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sand-300" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجو..." className="pr-10" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <FileText className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">پرونده‌ای ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card p-5 shadow-soft border border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sand-800">{r.patient?.full_name ?? 'بیمار'}</h3>
                    <p className="text-xs text-sand-400">{formatJalali(r.created_at)}</p>
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {r.diagnosis && <div className="rounded-xl bg-muted/40 p-3"><span className="text-sand-400">تشخیص: </span><span className="text-sand-600">{r.diagnosis}</span></div>}
                {r.allergies && <div className="rounded-xl bg-muted/40 p-3"><span className="text-sand-400">حساسیت‌ها: </span><span className="text-sand-600">{r.allergies}</span></div>}
                {r.medications && <div className="rounded-xl bg-muted/40 p-3"><span className="text-sand-400">داروها: </span><span className="text-sand-600">{r.medications}</span></div>}
                {r.medical_history && <div className="rounded-xl bg-muted/40 p-3"><span className="text-sand-400">سوابق: </span><span className="text-sand-600">{r.medical_history}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
