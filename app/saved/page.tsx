'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Search, Trash2, ArrowRight, Clock } from 'lucide-react';
import { SavedSearch } from '@/lib/types';
import { getSavedSearches, saveSavedSearches, formatDate } from '@/lib/utils';

export default function SavedPage() {
    const router = useRouter();
    const [searches, setSearches] = useState<SavedSearch[]>([]);

    useEffect(() => {
        setSearches(getSavedSearches());
    }, []);

    const deleteSearch = (id: string) => {
        const updated = searches.filter(s => s.id !== id);
        saveSavedSearches(updated);
        setSearches(updated);
    };

    const runSearch = (search: SavedSearch) => {
        const params = new URLSearchParams();
        if (search.query) params.set('q', search.query);
        if (search.filters.industry?.length) params.set('industry', search.filters.industry.join(','));
        if (search.filters.stage?.length) params.set('stage', search.filters.stage.join(','));
        if (search.filters.country?.length) params.set('country', search.filters.country.join(','));
        router.push(`/companies?${params.toString()}`);
    };

    return (
        <div className="p-6 max-w-[900px] mx-auto animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight mb-1">Saved Searches</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Re-run thesis-specific queries with one click
                </p>
            </div>

            {searches.length === 0 ? (
                <div className="card p-16 text-center">
                    <Bookmark size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm mb-2 font-medium">No saved searches yet</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Go to Companies, apply filters, and click &quot;Save Search&quot;.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {searches.map(search => (
                        <div key={search.id} className="card p-4 flex items-center gap-4 group">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                <Search size={16} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm mb-1">{search.name}</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {search.query && (
                                        <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                                            &quot;{search.query}&quot;
                                        </span>
                                    )}
                                    {search.filters.industry?.map(f => (
                                        <span key={f} className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                                            {f}
                                        </span>
                                    ))}
                                    {search.filters.stage?.map(f => (
                                        <span key={f} className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                            {f}
                                        </span>
                                    ))}
                                    {search.filters.country?.map(f => (
                                        <span key={f} className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                                            {f}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <Clock size={10} /> Saved {formatDate(search.savedAt)}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                                <button
                                    className="btn btn-primary text-xs"
                                    onClick={() => runSearch(search)}
                                >
                                    Run <ArrowRight size={12} />
                                </button>
                                <button className="btn btn-ghost p-2" onClick={() => deleteSearch(search.id)}>
                                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
