'use client';

import { WarEvent } from '../lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, es, faIR, ar, zhCN } from 'date-fns/locale';
import { ChevronDown, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const dateLocales: Record<string, any> = { en: enUS, fr, es, fa: faIR, ar, zh: zhCN };

export function EventCard({ event }: { event: WarEvent }) {
    const t = useTranslations();
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || dateLocales.en;
    const [showSources, setShowSources] = useState(false);

    const title = (event.lang_summary as any)?.[locale] || event.headline;
    const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: dateLocale });

    const isVerified = event.verification_status === 'VERIFIED';

    // Category colors matching Map pins
    let catColor = 'text-zinc-400 bg-zinc-800/50';
    if (event.category === 'KINETIC') catColor = 'text-red-400 bg-red-900/30 border-red-900/50';
    if (event.category === 'DIPLOMATIC') catColor = 'text-blue-400 bg-blue-900/30 border-blue-900/50';
    if (event.category === 'INTENT') catColor = 'text-orange-400 bg-orange-900/30 border-orange-900/50';
    if (event.category === 'LEADERSHIP') catColor = 'text-purple-400 bg-purple-900/30 border-purple-900/50';

    return (
        <div className="bg-war-panel border border-war-border rounded-lg p-4 transition-colors hover:border-zinc-700">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catColor}`}>
                        {t(`map.${event.category.toLowerCase()}`)}
                    </span>
                    {isVerified ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3" /> {t('map.verified')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" /> {t('map.pending')}
                        </span>
                    )}
                </div>
                <span className="text-xs text-war-muted whitespace-nowrap">{timeAgo}</span>
            </div>

            <h3 className="text-sm font-semibold text-zinc-100 mb-2 leading-snug">{title}</h3>
            <p className="text-sm text-zinc-400 mb-3">{event.summary}</p>

            {/* Location tag if tracking a specific area */}
            {event.location_name && (
                <div className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                    📍 {event.location_name}
                </div>
            )}

            {/* Leader Quotes specific styling */}
            {event.leader_quotes && event.leader_quotes.length > 0 && (
                <div className="mt-3 mb-3 pl-3 border-l-2 border-zinc-700 py-1">
                    {event.leader_quotes.map((q, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                            <span className="text-xs font-bold text-zinc-300 block">{q.leader}:</span>
                            <span className="text-sm italic text-zinc-400">"{q.quote}"</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Sources Toggle */}
            {event.raw_sources && event.raw_sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-war-border">
                    <button
                        onClick={() => setShowSources(!showSources)}
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full bg-zinc-900/50 p-1.5 rounded"
                    >
                        <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? 'rotate-180' : ''}`} />
                        {t('map.sources')} ({event.source_count || event.raw_sources.length})
                    </button>

                    {showSources && (
                        <div className="mt-2 space-y-1.5">
                            {event.raw_sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between text-xs text-blue-400 hover:bg-blue-900/20 p-1.5 rounded transition-colors group"
                                >
                                    <span className="truncate mr-2 font-mono text-[10px] uppercase text-zinc-400 group-hover:text-blue-300">
                                        {source.name}
                                    </span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
