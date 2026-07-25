'use client';

import { useEffect, useState } from 'react';
import { Stethoscope, Plus, X, Loader2, Save, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, toPersianDigits } from '@/lib/date';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', short_description: '', description: '', price: 0, duration_minutes: 30, category: '', slug: '' });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    setServices(data ?? []);
    setLoading(false);
  }

  function openEdit(s: any) {
    setEditing(s);
    setForm({ title: s.title, short_description: s.short_description ?? '', description: s.description ?? '', price: s.price, duration_minutes: s.duration_minutes, category: s.category ?? '', slug: s.slug });
    setShowForm(true);
  }

  function openAdd() {
    setEditing(null);
    setForm({ title: '', short_description: '', description: '', price: 0, duration_minutes: 30, category: '', slug: '' });
    setShowForm(true);
  }

  async function save() {
    const slug = form.slug || form.title.trim().toLowerCase().replace(/\s+/g, '-');
    const payload = { ...form, slug, is_active: true, sort_order: services.length + 1 };
    if (editing) {
      const { error } = await supabase.from('services').update(payload).eq('id', editing.id);
      if (error) { toast.error('به‌روزرسانی ناموفق بود'); return; }
      toast.success('خدمت به‌روزرسانی شد');
    } else {
      const { error } = await supabase.from('services').insert(payload);
      if (error) { toast.error('افزودن ناموفق بود'); return; }
      toast.success('خدمت اضافه شد');
    }
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) { toast.error('حذف ناموفق بود'); return; }
    setServices(services.filter((s) => s.id !== id));
    toast.success('خدمت حذف شد');
  }

  async function toggleActive(s: any) {
    await supabase.from('services').update({ is_active: !s.is_active }).eq('id', s.id);
    load();
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-sand-800">خدمات</h1>
          <p className="text-sand-400 mt-1">مدیریت خدمات کلینیک</p>
        </div>
        <Button onClick={openAdd} className="gradient-rose text-white">
          <Plus className="h-4 w-4 ml-1" />
          افزودن خدمت
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl bg-card overflow-hidden shadow-soft border border-border/40">
              <div className="relative aspect-[16/10]">
                <img src={s.image_url ?? 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={s.title} className="w-full h-full object-cover" />
                {!s.is_active && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">غیرفعال</div>}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-sand-800 mb-1">{s.title}</h3>
                <p className="text-xs text-sand-400 mb-3 line-clamp-2">{s.short_description}</p>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-primary font-bold nums-fa">{formatPrice(s.price)}</span>
                  <span className="text-sand-400 nums-fa">{toPersianDigits(s.duration_minutes)} دقیقه</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-muted text-sand-600 py-2 text-xs font-medium hover:bg-primary-soft hover:text-primary transition-colors">
                    <Edit className="h-3.5 w-3.5" /> ویرایش
                  </button>
                  <button onClick={() => toggleActive(s)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-muted text-sand-600 py-2 text-xs font-medium hover:bg-info-soft hover:text-info transition-colors">
                    {s.is_active ? 'غیرفعال' : 'فعال'}
                  </button>
                  <button onClick={() => remove(s.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="rounded-3xl bg-card p-6 w-full max-w-lg shadow-luxe max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-sand-800">{editing ? 'ویرایش خدمت' : 'افزودن خدمت'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">عنوان</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: پاکسازی پوست" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">توضیح کوتاه</label>
                <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="توضیح مختصر" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-sand-600">توضیح کامل</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="توضیح کامل خدمت" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sand-600">قیمت (تومان)</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="nums-fa" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sand-600">مدت (دقیقه)</label>
                  <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="nums-fa" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-sand-600">دسته</label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="پوست" />
                </div>
              </div>
              <Button onClick={save} className="w-full gradient-rose text-white">
                <Save className="h-4 w-4 ml-2" />
                {editing ? 'به‌روزرسانی' : 'افزودن'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
