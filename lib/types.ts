export interface Signal {
    date: string;
    type: 'funding' | 'product' | 'hiring' | 'partnership' | 'growth' | 'acquisition' | 'leadership' | 'regulatory' | 'contract' | 'expansion';
    text: string;
}

export interface Company {
    id: string;
    name: string;
    domain: string;
    description: string;
    industry: string;
    stage: string;
    location: string;
    country: string;
    founded: number;
    headcount: number;
    funding: string;
    tags: string[];
    signals: Signal[];
}

export interface EnrichmentSource {
    url: string;
    timestamp: string;
}

export interface EnrichmentResult {
    summary: string;
    bullets: string[];
    keywords: string[];
    signals: string[];
    sources: EnrichmentSource[];
    enrichedAt: string;
}

export interface Note {
    companyId: string;
    content: string;
    updatedAt: string;
}

export interface VCList {
    id: string;
    name: string;
    companyIds: string[];
    createdAt: string;
    updatedAt: string;
}

export interface SavedSearch {
    id: string;
    name: string;
    query: string;
    filters: {
        industry?: string[];
        stage?: string[];
        country?: string[];
    };
    savedAt: string;
}

export type SortField = 'name' | 'stage' | 'founded' | 'headcount' | 'funding';
export type SortDirection = 'asc' | 'desc';
