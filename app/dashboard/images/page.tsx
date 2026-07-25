'use client';

import { useEffect, useState, useRef } from 'react';
import { Images, Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali } from '@/lib/date';
import { toast } from 'sonner';

export default function ImagesPage() {
  const { user } = useAuth();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('media_assets').select('*').eq('patient_id', user.id).eq('type', 'image').order('created_at', { ascending: false })
      .then(({ data }) => { setImages(data ?? []); setLoading(false); });
  }, [user]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `${user.id}/images/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('patient-media').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('patient-media').getPublicUrl(path);
      const { data, error } = await supabase.from('media_assets').insert({
        patient_id: user.id, type: 'image', url: urlData.publicUrl, storage_path: path,
        title: file.name, mime_type: file.type, size_bytes: file.size,
      }).select().single();
      if (error) throw error;
      setImages([data, ...images]);
      toast.success('تصویر آپلود شد');
    } catch {
      toast.error('آپلود ناموفق بود');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function remove(id: string, path: string) {
    await supabase.storage.from('patient-media').remove([path]);
    await supabase.from('media_assets').delete().eq('id', id);
    setImages(images.filter((i) => i.id !== id));
    toast.success('تصویر حذف شد');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-sand-800">تصاویر پزشکی</h1>
          <p className="text-sand-400 mt-1">تصاویر قبل و بعد از درمان</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl gradient-rose px-5 py-2.5 text-white text-sm font-medium shadow-soft hover:shadow-luxe transition-shadow disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          آپلود تصویر
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <Images className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">تصویری آپلود نشده است</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-2xl overflow-hidden shadow-soft border border-border/40 aspect-square">
              <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button onClick={() => setPreview(img.url)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-sand-700 hover:bg-white transition-colors">
                    <Images className="h-5 w-5" />
                  </button>
                  <button onClick={() => remove(img.id, img.storage_path)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-destructive hover:bg-white transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-xs text-white truncate">{formatJalali(img.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <img src={preview} alt="preview" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
