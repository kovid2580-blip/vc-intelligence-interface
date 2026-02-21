'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, SlidersHorizontal, ChevronUp, ChevronDown, ChevronLeft,
    ChevronRight, Bookmark, X, Building2, Globe, ArrowUpRight
} from 'lucide-react';
import companies from '@/data/companies.json';
import { Company, SortField, SortDirection } from '@/lib/types';
import { getSavedSearches, saveSavedSearches, generateId } from '@/lib/utils';

const INDUSTRIES = Array.from(new Set((companies as Company[]).map(c => c.industry))).sort();
const STAGES = Array.from(new Set((companies as Company[]).map(c => c.stage))).sort();
const COUNTRIES = Array.from(new Set((companies as Company[]).map(c => c.country))).sort();
const PAGE_SIZE = 10;

const STAGE_COLORS: Record<string, string> = {
    'Late Stage': 'rgba(16,185,129,0.15)',
    'Series D': 'rgba(99,102,241,0.15)',
    'Series C': 'rgba(59,130,246,0.15)',
    'Series B': 'rgba(245,158,11,0.15)',
    'Series A': 'rgba(239,68,68,0.15)',
};
const STAGE_TEXT: Record<string, string> = {
    'Late Stage': '#10b981',
    'Series D': '#6366f1',
    'Series C': '#3b82f6',
    'Series B': '#f59e0b',
    'Series A': '#ef4444',
};

export default function CompaniesPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [sort, setSort] = useState<{ field: SortField; dir: SortDirection }>({ field: 'name', dir: 'asc' });
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [saveModal, setSaveModal] = useState(false);
    const [saveName, setSaveName] = useState('');

    const filtered = useMemo(() => {
        let result = companies as Company[];
        if (query) {
            const q = query.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.domain.toLowerCase().includes(q) ||
                c.tags.some((t: string) => t.toLowerCase().includes(q))
            );
        }
        if (selectedIndustries.length) result = result.filter(c => selectedIndustries.includes(c.industry));
        if (selectedStages.length) result = result.filter(c => selectedStages.includes(c.stage));
        if (selectedCountries.length) result = result.filter(c => selectedCountries.includes(c.country));

        result = [...result].sort((a, b) => {
            let av: string | number = a[sort.field] as string | number;
            let bv: string | number = b[sort.field] as string | number;
            if (typeof av === 'string') av = av.toLowerCase();
            if (typeof bv === 'string') bv = bv.toLowerCase();
            if (av < bv) return sort.dir === 'asc' ? -1 : 1;
            if (av > bv) return sort.dir === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [query, selectedIndustries, selectedStages, selectedCountries, sort]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSort = (field: SortField) => {
        setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' });
        setPage(1);
    };

    const toggleFilter = useCallback((arr: string[], val: string, set: (v: string[]) => void) => {
        set(arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]);
        setPage(1);
    }, []);

    const clearFilters = () => {
        setSelectedIndustries([]); setSelectedStages([]); setSelectedCountries([]);
        setQuery(''); setPage(1);
    };

    const hasFilters = query || selectedIndustries.length || selectedStages.length || selectedCountries.length;

    const saveSearch = () => {
        if (!saveName.trim()) return;
        const searches = getSavedSearches();
        searches.unshift({
            id: generateId(),
            name: saveName.trim(),
            query,
            filters: { industry: selectedIndustries, stage: selectedStages, country: selectedCountries },
            savedAt: new Date().toISOString(),
        });
        saveSavedSearches(searches);
        setSaveModal(false);
        setSaveName('');
    };

    const SortIcon = ({ field }: { field: SortField }) =>
        sort.field === field
            ? sort.dir === 'asc' ? <ChevronUp size={12} style={{ color: 'var(--accent)' }} /> : <ChevronDown size={12} style={{ color: 'var(--accent)' }} />
            : <ChevronDown size={12} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />;

    return (
        <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Companies</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {filtered.length} companies in pipeline
                    </p>
                </div>
                <div className="flex gap-2">
                    {hasFilters && (
                        <button className="btn btn-ghost text-sm" onClick={clearFilters}>
                            <X size={14} /> Clear filters
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={() => setSaveModal(true)}
                    >
                        <Bookmark size={14} /> Save Search
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setFiltersOpen(f => !f)}
                        style={filtersOpen ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}
                    >
                        <SlidersHorizontal size={14} /> Filters
                        {(selectedIndustries.length + selectedStages.length + selectedCountries.length) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-bold"
                                style={{ background: 'var(--accent)', color: 'white' }}>
                                {selectedIndustries.length + selectedStages.length + selectedCountries.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Filters panel */}
                {filtersOpen && (
                    <div className="card p-5 w-72 flex-shrink-0 animate-fade-in self-start">
                        <FilterGroup label="Industry" options={INDUSTRIES} selected={selectedIndustries}
                            onToggle={(v) => toggleFilter(selectedIndustries, v, setSelectedIndustries)} />
                        <FilterGroup label="Stage" options={STAGES} selected={selectedStages}
                            onToggle={(v) => toggleFilter(selectedStages, v, setSelectedStages)} />
                        <FilterGroup label="Country" options={COUNTRIES} selected={selectedCountries}
                            onToggle={(v) => toggleFilter(selectedCountries, v, setSelectedCountries)} />
                    </div>
                )}

                {/* Main */}
                <div className="flex-1 min-w-0">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <input
                            className="input pl-9"
                            placeholder="Search companies, domains, tags…"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => toggleSort('name')} className="w-[260px]">
                                            <span className="flex items-center gap-1">Company <SortIcon field="name" /></span>
                                        </th>
                                        <th>Industry</th>
                                        <th onClick={() => toggleSort('stage')}>
                                            <span className="flex items-center gap-1">Stage <SortIcon field="stage" /></span>
                                        </th>
                                        <th onClick={() => toggleSort('founded')}>
                                            <span className="flex items-center gap-1">Founded <SortIcon field="founded" /></span>
                                        </th>
                                        <th>Location</th>
                                        <th>Funding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                                <div style={{ color: 'var(--text-secondary)' }} className="text-sm">No companies match your filters</div>
                                            </td>
                                        </tr>
                                    ) : paginated.map(c => (
                                        <tr key={c.id} className="group cursor-pointer" onClick={() => router.push(`/companies/${c.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                        style={{ background: 'var(--bg-hover)', color: 'var(--accent)' }}>
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm flex items-center gap-1">
                                                            {c.name}
                                                            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
                                                        </div>
                                                        <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                            <Globe size={10} />{c.domain}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.industry}</span>
                                            </td>
                                            <td>
                                                <span className="badge text-xs"
                                                    style={{
                                                        background: STAGE_COLORS[c.stage] || 'var(--bg-hover)',
                                                        color: STAGE_TEXT[c.stage] || 'var(--text-secondary)',
                                                    }}>
                                                    {c.stage}
                                                </span>
                                            </td>
                                            <td className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>{c.founded}</td>
                                            <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.location}</td>
                                            <td>
                                                <span className="font-semibold text-sm" style={{ color: '#10b981' }}>{c.funding}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3"
                                style={{ borderTop: '1px solid var(--border)' }}>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button className="btn btn-ghost p-2" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft size={15} />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className="btn btn-ghost text-xs w-8 h-8 p-0"
                                            style={p === page ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : {}}
                                            onClick={() => setPage(p)}
                                        >{p}</button>
                                    ))}
                                    <button className="btn btn-ghost p-2" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Modal */}
            {saveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <div className="card p-6 w-96 animate-fade-in">
                        <h3 className="font-semibold mb-1">Save Search</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            Save your current query and filters for quick access later.
                        </p>
                        <input
                            className="input mb-4"
                            placeholder="e.g. AI Infra Series B US"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveSearch()}
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                            <button className="btn btn-ghost" onClick={() => setSaveModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveSearch} disabled={!saveName.trim()}>
                                <Bookmark size={14} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterGroup({ label, options, selected, onToggle }: {
    label: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
    return (
        <div className="mb-5 last:mb-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}>
                {label}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {options.map(opt => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onToggle(opt)}
                            style={{
                                padding: '5px 11px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 500,
                                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                                background: active ? 'var(--accent-dim)' : 'transparent',
                                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.3,
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
