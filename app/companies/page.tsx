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
    'Late Stage': '#a3e635',
    'Series D': '#facc15',
    'Series C': '#60a5fa',
    'Series B': '#fb923c',
    'Series A': '#f87171',
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
            ? sort.dir === 'asc' ? <ChevronUp size={14} strokeWidth={3} /> : <ChevronDown size={14} strokeWidth={3} />
            : <ChevronDown size={14} strokeWidth={3} className="opacity-20" />;

    return (
        <div className="p-8 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">Companies</h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-600">
                        {filtered.length} COMPANIES IN PIPELINE
                    </p>
                </div>
                <div className="flex gap-4">
                    {hasFilters && (
                        <button className="neo-btn neo-btn-secondary text-sm" onClick={clearFilters}>
                            <X size={16} strokeWidth={3} /> CLEAR FILTERS
                        </button>
                    )}
                    <button
                        className="neo-btn neo-btn-secondary"
                        onClick={() => setSaveModal(true)}
                    >
                        <Bookmark size={16} strokeWidth={3} /> SAVE SEARCH
                    </button>
                    <button
                        className="neo-btn neo-btn-accent"
                        onClick={() => setFiltersOpen(f => !f)}
                    >
                        <SlidersHorizontal size={16} strokeWidth={3} /> {filtersOpen ? 'CLOSE FILTERS' : 'FILTERS'}
                        {(selectedIndustries.length + selectedStages.length + selectedCountries.length) > 0 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-black text-white text-xs font-black">
                                {selectedIndustries.length + selectedStages.length + selectedCountries.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Filters panel */}
                {filtersOpen && (
                    <div className="neo-card w-80 self-start animate-fade-in">
                        <FilterGroup label="Industry" options={INDUSTRIES} selected={selectedIndustries}
                            onToggle={(v) => toggleFilter(selectedIndustries, v, setSelectedIndustries)} />
                        <div className="my-6 border-b-2 border-black"></div>
                        <FilterGroup label="Stage" options={STAGES} selected={selectedStages}
                            onToggle={(v) => toggleFilter(selectedStages, v, setSelectedStages)} />
                        <div className="my-6 border-b-2 border-black"></div>
                        <FilterGroup label="Country" options={COUNTRIES} selected={selectedCountries}
                            onToggle={(v) => toggleFilter(selectedCountries, v, setSelectedCountries)} />
                    </div>
                )}

                {/* Main */}
                <div className="flex-1 min-w-0">
                    {/* Search */}
                    <div className="relative mb-6">
                        <Search size={20} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            className="neo-input pl-12 text-lg font-bold"
                            placeholder="SEARCH COMPANIES, DOMAINS, TAGS…"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setPage(1); }}
                        />
                    </div>

                    {/* Table Container */}
                    <div className="neo-card p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => toggleSort('name')} className="cursor-pointer">
                                            <span className="flex items-center gap-2">COMPANY <SortIcon field="name" /></span>
                                        </th>
                                        <th>INDUSTRY</th>
                                        <th onClick={() => toggleSort('stage')} className="cursor-pointer text-center">
                                            <span className="flex items-center justify-center gap-2">STAGE <SortIcon field="stage" /></span>
                                        </th>
                                        <th onClick={() => toggleSort('founded')} className="cursor-pointer">
                                            <span className="flex items-center gap-2">FOUNDED <SortIcon field="founded" /></span>
                                        </th>
                                        <th>LOCATION</th>
                                        <th>FUNDING</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center">
                                                <Building2 size={48} strokeWidth={3} className="mx-auto mb-4" />
                                                <div className="text-xl font-black uppercase">No companies match your search</div>
                                            </td>
                                        </tr>
                                    ) : paginated.map(c => (
                                        <tr key={c.id} className="group cursor-pointer hover:bg-yellow-50" onClick={() => router.push(`/companies/${c.id}`)}>
                                            <td className="font-black">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center flex-shrink-0 text-sm font-black shadow-[2px 2px 0px 0px #000]">
                                                        {c.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-base flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                                                            {c.name.toUpperCase()}
                                                            <ArrowUpRight size={14} strokeWidth={3} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                                            <Globe size={12} strokeWidth={3} />{c.domain}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="font-bold text-gray-600">{c.industry.toUpperCase()}</td>
                                            <td className="text-center">
                                                <span className="neo-badge"
                                                    style={{
                                                        background: STAGE_COLORS[c.stage] || 'var(--bg-white)',
                                                    }}>
                                                    {c.stage}
                                                </span>
                                            </td>
                                            <td className="font-bold tabular-nums">{c.founded}</td>
                                            <td className="font-bold">{c.location.toUpperCase()}</td>
                                            <td>
                                                <span className="text-base font-black text-green-600">{c.funding}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-6 border-t-2 border-black bg-gray-50">
                                <span className="text-xs font-black uppercase tracking-widest">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} OF {filtered.length} COMPANIES
                                </span>
                                <div className="flex items-center gap-2">
                                    <button className="neo-btn neo-btn-secondary p-2" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft size={18} strokeWidth={3} />
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                className={`neo-btn w-10 h-10 p-0 text-sm font-black ${p === page ? 'neo-btn-accent' : 'neo-btn-secondary'}`}
                                                onClick={() => setPage(p)}
                                            >{p}</button>
                                        ))}
                                    </div>
                                    <button className="neo-btn neo-btn-secondary p-2" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                        <ChevronRight size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Save Modal */}
            {saveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="neo-card max-w-md w-full animate-fade-in">
                        <h3 className="text-2xl font-black uppercase mb-2">Save Search</h3>
                        <p className="text-sm font-bold text-gray-600 mb-6">
                            SAVE YOUR CURRENT QUERY AND FILTERS FOR QUICK ACCESS LATER.
                        </p>
                        <input
                            className="neo-input mb-6 font-bold"
                            placeholder="E.G. AI INFRA SERIES B US"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveSearch()}
                            autoFocus
                        />
                        <div className="flex gap-4 justify-end">
                            <button className="neo-btn neo-btn-secondary" onClick={() => setSaveModal(false)}>CANCEL</button>
                            <button className="neo-btn" onClick={saveSearch} disabled={!saveName.trim()}>
                                <Bookmark size={16} strokeWidth={3} /> SAVE
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
        <div className="last:mb-0">
            <div className="text-xs font-black uppercase tracking-widest mb-4">
                {label}
            </div>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onToggle(opt)}
                            className={`px-3 py-1.5 border-2 border-black text-xs font-bold transition-all ${active
                                    ? 'bg-indigo-600 text-white shadow-[2px 2px 0px 0px #000] -translate-x-0.5 -translate-y-0.5'
                                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px 2px 0px 0px #000]'
                                }`}
                        >
                            {opt.toUpperCase()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
