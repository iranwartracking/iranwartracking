'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WarEvent } from '../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, es, faIR, ar, zhCN } from 'date-fns/locale';

const dateLocales: Record<string, any> = { en: enUS, fr, es, fa: faIR, ar, zh: zhCN };

export function LiveTicker() {
    const t = useTranslations();
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || dateLocales.en;

    const [events, setEvents] = useState<WarEvent[]>([]);

    useEffect(() => {
        if (!supabase) return;

        // 1. Fetch latest 5 events
        const fetchLatest = async () => {
            const { data, error } = await supabase!
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && data) {
                setEvents(data as WarEvent[]);
            }
        };

        fetchLatest();

        // 2. Subscribe to new events
        const channel = supabase
            .channel('public:events')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'events' },
                (payload) => {
                    setEvents((current) => {
                        const newEvents = [payload.new as WarEvent, ...current];
                        return newEvents.slice(0, 5); // Keep only 5
                    });
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, []);

    if (events.length === 0) return null;

    return (
        <div className="bg-red-950/40 border-b border-red-900/40 text-xs py-2 overflow-hidden flex items-center shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-2 px-4 border-r border-red-900/50 bg-red-950/60 z-10 font-bold text-red-500 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
                {t('ticker.label')}
            </div>

            {/* CSS Marquee */}
            <div className="flex-1 overflow-hidden relative group">
                <div className="flex gap-8 whitespace-nowrap animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused] px-4">
                    {events.map((event) => {
                        // Get translated summary if available, fallback to english headline
                        const title = event.lang_summary[locale as keyof typeof event.lang_summary] || event.headline;
                        const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: dateLocale });

                        return (
                            <span key={event.id} className="text-zinc-300 flex items-center gap-2">
                                <span className="text-zinc-500">[{timeAgo}]</span>
                                <span className="font-medium">{title}</span>
                                {event.verification_status === 'VERIFIED' && (
                                    <span className="text-[10px] bg-green-900/50 text-green-400 px-1 py-0.5 rounded ml-1">✓</span>
                                )}
                            </span>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); } 
        }
      `}</style>
        </div>
    );
}
