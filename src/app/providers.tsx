'use client';

import { SWRConfig } from 'swr';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher: (resource, init) => fetch(resource, init).then(res => res.json()),
                revalidateOnFocus: false, // Don't re-fetch just because user switched tabs
                refreshInterval: 0, // Handled manually or via Supabase Realtime
            }}
        >
            {children}
        </SWRConfig>
    );
}
