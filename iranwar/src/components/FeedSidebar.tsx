'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WarEvent } from '../lib/types';
import { EventCard } from './EventCard';
import { useTranslations } from 'next-intl';

export function FeedSidebar() {
    const t = useTranslations();
    const [activeTab, setActiveTab] = useState<'ALL' | 'KINETIC' | 'DIPLOMATIC' | 'LEADERSHIP'>('ALL');
    const [events, setEvents] = useState<WarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents(activeTab);

        // Initial load setup realtime subscription globally
        const channel = supabase
            .channel('public:events_feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
                const newEvent = payload.new as WarEvent;
                // Only append if it matches current filter
                setEvents((current) => {
                    if (activeTab === 'ALL' || newEvent.category === activeTab) {
                        return [newEvent, ...current].slice(0, 50);
                    }
                    return current;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTab]);

    const fetchEvents = async (category: string) => {
        setLoading(true);
        let query = supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (category !== 'ALL') {
            query = query.eq('category', category);
        }

        const { data } = await query;
        if (data) setEvents(data as WarEvent[]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-war-bg">
            {/* Sticky Tabs */}
            <div className="sticky top-0 z-10 bg-war-panel border-b border-war-border p-3 shadow-md">
                <div className="flex overflow-x-auto hide-scrollbar gap-2pb-1">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        {t('tabs.live')}
                    </button>
                    <button
                        onClick={() => setActiveTab('KINETIC')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeTab === 'KINETIC' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-red-400'
                            }`}
                    >
                        {t('filter.kinetic')}
                    </button>
                    <button
                        onClick={() => setActiveTab('LEADERSHIP')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeTab === 'LEADERSHIP' ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-purple-400'
                            }`}
                    >
                        {t('tabs.leaders')}
                    </button>
                    <button
                        onClick={() => setActiveTab('DIPLOMATIC')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${activeTab === 'DIPLOMATIC' ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-blue-400'
                            }`}
                    >
                        {t('tabs.diplomacy')}
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
                    </div>
                ) : events.length > 0 ? (
                    events.map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                    <div className="text-center p-8 text-war-muted text-sm">
                        No recent events found for this filter.
                    </div>
                )}
            </div>
        </div>
    );
}
