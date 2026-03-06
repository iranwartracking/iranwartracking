'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart } from 'lucide-react';

export function DonationBar() {
    const t = useTranslations();

    const [total, setTotal] = useState(0);
    const goal = 20;

    useEffect(() => {
        if (!supabase) return;

        // 1. Fetch initial value
        const fetchTotal = async () => {
            const { data, error } = await supabase!
                .from('site_config')
                .select('value')
                .eq('key', 'daily_donations_total')
                .single();

            if (!error && data) {
                setTotal(parseFloat(data.value));
            }
        };
        fetchTotal();

        // 2. Subscribe to real-time updates
        const channel = supabase!
            .channel('site_config_changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'site_config', filter: "key=eq.daily_donations_total" },
                (payload) => {
                    setTotal(parseFloat(payload.new.value));
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, []);

    const percentage = Math.min(100, Math.round((total / goal) * 100));

    return (
        <div className="w-full bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 py-1.5 px-4 flex justify-between items-center sm:text-sm">
            <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">{t('donation.label')} {t('donation.goal')} | </span>
                <span>{t('donation.current')} <span className="text-zinc-200 font-medium">${total.toFixed(2)}</span></span>
            </div>

            <div className="flex items-center gap-3">
                {/* Progress Bar */}
                <div className="hidden sm:flex items-center gap-2 w-32">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-[10px] w-8 text-right">{percentage}%</span>
                </div>

                <a
                    href="https://ko-fi.com/your-kofi-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1 rounded transition-colors"
                >
                    {t('donation.keepLive')}
                </a>
            </div>
        </div>
    );
}
