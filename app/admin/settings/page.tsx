'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<'clinic' | 'faq'>('clinic');
  const [clinic, setClinic] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from('clinics').select('*').eq('is_active', true).limit(1).maybeSingle(),
        supabase.from('faqs').select('*').order('sort_order'),
      ]);
      setClinic(c);
      setFaqs(f ?? []);
    })();
  }, []);

  async function saveClinic() {
    if (!clinic) return;
    setSaving(true);
    const { error } = await supabase.from('clinics').update({
      name: clinic.name, phone: clinic.phone, email: clinic.email, address: clinic.address, city: clinic.city, about: clinic.about,
    }).eq('id', clinic.id);
    if (error) { toast.error('ذخیره ناموفق بود'); setSaving(false); return; }
    toast.success('اطلاعات کلینیک ذخیره شد');
    setSaving(false);
  }

  async function addFaq() {
    if (!newFaq.question || !newFaq.answer) return;
    const { data, error } = await supabase.from('faqs').insert({
      question: newFaq.question, answer: newFaq.answer, category: newFaq.category || null, sort_order: faqs.length + 1, is_active: true,
    }).select().single();
    if (error) { toast.error('افزودن ناموفق بود'); return; }
    setFaqs([...faqs, data]);
    setNewFaq({ question: '', answer: '', category: '' });
    toast.success('سوال اضافه شد');
  }

  async function removeFaq(id: string) {
    await supabase.from('faqs').delete().eq('id', id);
    setFaqs(faqs.filter((f) => f.id !== id));
    toast.success('سوال حذف شد');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">تنظیمات</h1>
        <p className="text-sand-400 mt-1">پیکربندی کلینیک و سایت</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('clinic')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'clinic' ? 'bg-primary text-white shadow-soft' : 'bg-muted text-sand-500 hover:bg-primary-soft'}`}>اطلاعات کلینیک</button>
        <button onClick={() => setTab('faq')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'faq' ? 'bg-primary text-white shadow-soft' : 'bg-muted text-sand-500 hover:bg-primary-soft'}`}>سوالات متداول</button>
      </div>

      {tab === 'clinic' && clinic && (
        <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40 space-y-5 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sand-600">نام کلینیک</label>
            <Input value={clinic.name ?? ''} onChange={(e) => setClinic({ ...clinic, name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">تلفن</label>
              <Input value={clinic.phone ?? ''} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} className="nums-fa" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-600">ایمیل</label>
              <Input value={clinic.email ?? ''} onChange={(e) => setClinic({ ...clinic, email: e.target.value })} dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sand-600">آدرس</label>
            <Input value={clinic.address ?? ''} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sand-600">شهر</label>
            <Input value={clinic.city ?? ''} onChange={(e) => setClinic({ ...clinic, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sand-600">درباره کلینیک</label>
            <Textarea value={clinic.about ?? ''} onChange={(e) => setClinic({ ...clinic, about: e.target.value })} rows={4} />
          </div>
          <Button onClick={saveClinic} disabled={saving} className="gradient-rose text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
            ذخیره تغییرات
          </Button>
        </div>
      )}

      {tab === 'faq' && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-2xl bg-card p-6 shadow-soft border border-border/40 space-y-4">
            <h3 className="font-heading font-semibold text-sand-800">افزودن سوال جدید</h3>
            <div className="space-y-2">
              <Input value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="سوال" />
            </div>
            <div className="space-y-2">
              <Textarea value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} placeholder="پاسخ" rows={3} />
            </div>
            <div className="space-y-2">
              <Input value={newFaq.category} onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })} placeholder="دسته (اختیاری)" />
            </div>
            <Button onClick={addFaq} className="gradient-rose text-white">
              <Plus className="h-4 w-4 ml-2" />
              افزودن
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div key={f.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border/40 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sand-700">{f.question}</p>
                  <p className="text-sm text-sand-400 mt-1">{f.answer}</p>
                </div>
                <button onClick={() => removeFaq(f.id)} className="text-destructive hover:bg-destructive/5 p-2 rounded-lg transition-colors shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
