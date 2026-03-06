export type EventCategory = 'KINETIC' | 'DIPLOMATIC' | 'INTENT' | 'LEADERSHIP';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'UNVERIFIED';
export type SentimentType = 'ESCALATORY' | 'DIPLOMATIC' | 'ULTIMATUM' | 'NEUTRAL';

export interface LocationData {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface WarEvent {
    id: string;
    created_at: string;
    category: EventCategory;
    severity: number; // 1-5
    headline: string;
    summary: string;
    location: LocationData;
    location_name: string;
    sources: string[];
    verification_status: VerificationStatus;
    source_count: number;
    leader_quotes: { leader: string; quote: string; source: string; timestamp: string }[];
    sentiment: SentimentType | null;
    raw_sources: { name: string; url: string; timestamp: string }[];
    is_breaking: boolean;
    lang_summary: {
        en?: string;
        fr?: string;
        es?: string;
        fa?: string;
        ar?: string;
        zh?: string;
    };
}

export interface SiteConfig {
    key: string;
    value: string;
    updated_at: string;
}

export interface UserProfile {
    id: string;
    email: string;
    is_premium: boolean;
    subscription_status: string;
    expiry_date: string | null;
    created_at: string;
}
