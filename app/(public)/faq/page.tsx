import { supabase } from '@/lib/supabase';
import type { Faq } from '@/types/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export default async function FaqPage() {
  const { data } = await supabase.from('faqs').select('*').eq('is_active', true).order('sort_order');
  const faqs = (data ?? []) as Faq[];

  return (
    <div className="animate-fade-up">
      <section className="gradient-luxe relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="container relative py-20 lg:py-28 text-center">
          <span className="text-sm font-medium text-primary">سوالات متداول</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-sand-800 mt-3">
            پاسخ به پرسش‌های شما
          </h1>
          <p className="text-sand-500 mt-4 max-w-xl mx-auto">
            پاسخ پرتکرارترین سوالات بیماران را در اینجا بیابید
          </p>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        {faqs.length === 0 ? (
          <div className="text-center text-sand-400 py-12">در حال حاضر سوالی ثبت نشده است.</div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-2xl bg-card shadow-soft border border-border/40 overflow-hidden">
                <Accordion type="single" collapsible>
                  <AccordionItem value={faq.id} className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 text-right">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-sand-700">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-0 text-sand-500 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
