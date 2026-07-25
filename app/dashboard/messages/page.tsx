'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatJalali, formatTime, toPersianDigits } from '@/lib/date';
import { cn } from '@/lib/utils';

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('messages').select('*').eq('patient_id', user.id).order('created_at', { ascending: true })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSending(true);
    const { data } = await supabase.from('messages').insert({ patient_id: user.id, direction: 'inbound', body: text.trim() }).select().single();
    if (data) setMessages([...messages, data]);
    setText('');
    setSending(false);
  }

  return (
    <div className="space-y-4 animate-fade-up h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="font-heading text-2xl font-bold text-sand-800">پیام‌ها</h1>
        <p className="text-sand-400 mt-1">ارتباط با کلینیک</p>
      </div>

      <div className="flex-1 rounded-2xl bg-card shadow-soft border border-border/40 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-sand-400">
              <MessageSquare className="h-12 w-12 mb-3 text-sand-200" />
              <p>پیامی ندارید</p>
              <p className="text-sm mt-1">اولین پیام خود را ارسال کنید</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn('flex', m.direction === 'inbound' ? 'justify-start' : 'justify-end')}>
                <div className={cn('max-w-[75%] rounded-2xl px-4 py-3', m.direction === 'inbound' ? 'bg-muted text-sand-700' : 'gradient-rose text-white')}>
                  <p className="text-sm leading-relaxed">{m.body}</p>
                  <p className={cn('text-xs mt-1 nums-fa', m.direction === 'inbound' ? 'text-sand-300' : 'text-white/60')}>
                    {formatJalali(m.created_at)} {formatTime(m.created_at.split('T')[1]?.slice(0, 5) ?? '')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="p-4 border-t border-border/40 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 rounded-xl bg-muted/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="submit" disabled={sending || !text.trim()} className="flex h-12 w-12 items-center justify-center rounded-xl gradient-rose text-white shadow-soft hover:shadow-luxe transition-shadow disabled:opacity-50">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
