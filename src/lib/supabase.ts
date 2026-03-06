import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): url is string => {
    try {
        return !!url && (url.startsWith('http://') || url.startsWith('https://'));
    } catch {
        return false;
    }
};

// Client-side supabase instance - only initialize if valid
export const supabase = isValidUrl(supabaseUrl) && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;
