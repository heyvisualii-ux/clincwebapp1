'use client';

import { useEffect, useState, useRef } from 'react';
import { Paperclip, FileText, Download, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali } from '@/lib/date';
import { toast } from 'sonner';

export default function FilesPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('media_assets').select('*').eq('patient_id', user.id).eq('type', 'file').order('created_at', { ascending: false })
      .then(({ data }) => { setFiles(data ?? []); setLoading(false); });
  }, [user]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `${user.id}/files/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('patient-media').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('patient-media').getPublicUrl(path);
      const { data, error } = await supabase.from('media_assets').insert({
        patient_id: user.id, type: 'file', url: urlData.publicUrl, storage_path: path,
        title: file.name, mime_type: file.type, size_bytes: file.size,
      }).select().single();
      if (error) throw error;
      setFiles([data, ...files]);
      toast.success('فایل آپلود شد');
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
    setFiles(files.filter((f) => f.id !== id));
    toast.success('فایل حذف شد');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-sand-800">فایل‌های من</h1>
          <p className="text-sand-400 mt-1">مدرک و فایل‌های پزشکی</p>
        </div>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl gradient-rose px-5 py-2.5 text-white text-sm font-medium shadow-soft hover:shadow-luxe transition-shadow disabled:opacity-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          آپلود فایل
        </button>
        <input ref={fileRef} type="file" onChange={upload} className="hidden" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />)}</div>
      ) : files.length === 0 ? (
        <div className="rounded-2xl bg-card p-12 text-center shadow-soft border border-border/40">
          <Paperclip className="h-12 w-12 mx-auto mb-3 text-sand-200" />
          <p className="text-sand-400">فایلی آپلود نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.id} className="rounded-2xl bg-card p-4 shadow-soft border border-border/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-info-soft text-info shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sand-700 truncate">{f.title}</p>
                  <p className="text-xs text-sand-400">{formatJalali(f.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={f.url} download className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sand-500 hover:bg-primary-soft hover:text-primary transition-colors">
                  <Download className="h-4 w-4" />
                </a>
                <button onClick={() => remove(f.id, f.storage_path)} className="text-destructive text-sm hover:underline">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
