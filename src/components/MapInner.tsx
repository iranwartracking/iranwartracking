'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WarEvent } from '../lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { enUS, fr, es, faIR, ar, zhCN } from 'date-fns/locale';

const dateLocales: Record<string, any> = { en: enUS, fr, es, fa: faIR, ar, zh: zhCN };

// Custom icon builder
const createIcon = (category: string) => {
    let color = '#a1a1aa'; // default zinc
    if (category === 'KINETIC') color = '#ef4444'; // red
    if (category === 'DIPLOMATIC') color = '#3b82f6'; // blue
    if (category === 'INTENT') color = '#f97316'; // orange
    if (category === 'LEADERSHIP') color = '#a855f7'; // purple

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

    return L.divIcon({
        html: svg,
        className: 'custom-leaflet-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -20],
    });
};

export default function MapInner() {
    const t = useTranslations();
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || dateLocales.en;

    const [events, setEvents] = useState<WarEvent[]>([]);

    useEffect(() => {
        if (!supabase) return;

        const fetchEvents = async () => {
            // Just fetch the last 200 events to prevent massive lag
            const { data, error } = await supabase!
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);

            if (!error && data) {
                setEvents(data as WarEvent[]);
            }
        };
        fetchEvents();

        const channel = supabase!
            .channel('public:map_events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
                setEvents((current) => [payload.new as WarEvent, ...current].slice(0, 200));
            })
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, []);

    return (
        <MapContainer
            center={[32.4279, 53.6880]} // Center on Iran
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#09090b', zIndex: 0 }}
            zoomControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* We use Supercluster wrapper for performance */}
            <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={40}
                showCoverageOnHover={false}
            >
                {events.map((event) => {
                    if (!event.location || event.location.type !== 'Point') return null;

                    const title = (event.lang_summary as any)?.[locale] || event.headline;
                    const timeAgo = formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: dateLocale });

                    // PostGIS POINT is [longitude, latitude]. Leaflet needs [latitude, longitude].
                    const position: [number, number] = [event.location.coordinates[1], event.location.coordinates[0]];

                    return (
                        <Marker
                            key={event.id}
                            position={position}
                            icon={createIcon(event.category)}
                        >
                            <Popup>
                                <div className="flex flex-col gap-2 font-sans p-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-war-muted uppercase">{t(`map.${event.category.toLowerCase()}`)}</span>
                                        <span className="text-xs text-war-muted whitespace-nowrap">{timeAgo}</span>
                                    </div>

                                    <h3 className="font-bold text-sm text-white mb-1">{title}</h3>
                                    <p className="text-sm text-zinc-300 leading-snug">{event.summary}</p>

                                    <div className="mt-2 pt-2 border-t border-war-border flex justify-between items-center">
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${event.verification_status === 'VERIFIED' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                                            }`}>
                                            {event.verification_status === 'VERIFIED' ? t('map.verified') : t('map.pending')}
                                        </span>
                                        <a href="#" className="text-xs text-blue-400 hover:text-blue-300 underline">
                                            {t('map.viewRaw')} ({event.source_count})
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
