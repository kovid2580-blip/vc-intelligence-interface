'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Globe, MapPin, Users, Calendar, DollarSign,
    Zap, Tag, FileText, Plus, BookmarkPlus, Check,
    Clock, TrendingUp, AlertCircle, ExternalLink, Loader2
} from 'lucide-react';
import companies from '@/data/companies.json';
import { Company, VCList, EnrichmentResult } from '@/lib/types';
import {
    getNote, saveNote, getLists, saveLists, getEnrichmentCache,
    saveEnrichmentCache, generateId, formatDate
} from '@/lib/utils';

const SIGNAL_COLORS: Record<string, { bg: string; text: string }> = {
    funding: { bg: '#a3e635', text: '#000000' },
    product: { bg: '#facc15', text: '#000000' },
    hiring: { bg: '#fb923c', text: '#000000' },
    partnership: { bg: '#60a5fa', text: '#000000' },
    growth: { bg: '#c084fc', text: '#000000' },
    acquisition: { bg: '#f87171', text: '#000000' },
    leadership: { bg: '#fb923c', text: '#000000' },
    regulatory: { bg: '#f87171', text: '#000000' },
    contract: { bg: '#a3e635', text: '#000000' },
    expansion: { bg: '#c084fc', text: '#000000' },
};

export default function CompanyProfile() {
    const params = useParams();
    const router = useRouter();
    const company = (companies as Company[]).find(c => c.id === params.id);

    const [note, setNote] = useState('');
    const [noteSaved, setNoteSaved] = useState(false);
    const [lists, setLists] = useState<VCList[]>([]);
    const [newListName, setNewListName] = useState('');
    const [listDropdown, setListDropdown] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [savedToList, setSavedToList] = useState<string | null>(null);

    const [enriching, setEnriching] = useState(false);
    const [enrichResult, setEnrichResult] = useState<EnrichmentResult | null>(null);
    const [enrichError, setEnrichError] = useState<string | null>(null);

    useEffect(() => {
        if (!company) return;
        const n = getNote(company.id);
        if (n) setNote(n.content);
        setLists(getLists());
        const cached = getEnrichmentCache(company.id);
        if (cached) setEnrichResult(cached);
    }, [company]);

    if (!company) {
        return (
            <div className="p-12 text-center animate-fade-in">
                <div className="neo-card inline-block p-12">
                    <AlertCircle size={64} strokeWidth={3} className="mx-auto mb-6" />
                    <h2 className="text-3xl font-black uppercase mb-4">Company not found</h2>
                    <button className="neo-btn" onClick={() => router.push('/companies')}>
                        <ArrowLeft size={18} strokeWidth={3} /> GO BACK
                    </button>
                </div>
            </div>
        );
    }

    const handleNoteSave = () => {
        saveNote(company.id, note);
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
    };

    const handleSaveToList = (listId: string) => {
        const updated = lists.map(l =>
            l.id === listId && !l.companyIds.includes(company.id)
                ? { ...l, companyIds: [...l.companyIds, company.id], updatedAt: new Date().toISOString() }
                : l
        );
        saveLists(updated);
        setLists(updated);
        setSavedToList(listId);
        setListDropdown(false);
        setTimeout(() => setSavedToList(null), 2000);
    };

    const handleCreateList = () => {
        if (!newListName.trim()) return;
        const newList: VCList = {
            id: generateId(),
            name: newListName.trim(),
            companyIds: [company.id],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const updated = [newList, ...lists];
        saveLists(updated);
        setLists(updated);
        setNewListName('');
        setSavedToList(newList.id);
        setListDropdown(false);
        setTimeout(() => setSavedToList(null), 2000);
    };

    const handleEnrich = async () => {
        setEnriching(true);
        setEnrichError(null);
        try {
            const res = await fetch('/api/enrich', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: `https://${company.domain}`, domain: company.domain }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Enrichment failed');
            }
            const data: EnrichmentResult = await res.json();
            saveEnrichmentCache(company.id, data);
            setEnrichResult(data);
        } catch (e: unknown) {
            setEnrichError(e instanceof Error ? e.message : 'Something went wrong');
        } finally {
            setEnriching(false);
        }
    };

    const inList = lists.some(l => l.companyIds.includes(company.id));

    return (
        <div className="p-8 max-w-[1200px] mx-auto animate-fade-in space-y-10">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="neo-btn neo-btn-secondary"
                >
                    <ArrowLeft size={18} strokeWidth={3} /> BACK
                </button>
            </div>

            {/* Title / Hero */}
            <div className="neo-card p-8">
                <div className="flex flex-wrap items-start justify-between gap-10">
                    <div
                        className="w-20 h-20 border-4 border-black bg-white flex items-center justify-center text-3xl font-black flex-shrink-0 shadow-[4px 4px 0px 0px #000]"
                    >
                        {company.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-4 mb-4">
                            <h1 className="text-4xl font-black uppercase tracking-tighter">{company.name}</h1>
                            <span className="neo-badge bg-[#a3e635]">
                                {company.stage}
                            </span>
                            {inList && (
                                <span className="neo-badge bg-[#60a5fa] text-white">
                                    <Check size={12} strokeWidth={3} /> SAVED
                                </span>
                            )}
                        </div>
                        <p className="text-lg font-bold mb-6 text-gray-700 leading-tight">{company.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {company.tags.map((t: string) => (
                                <span key={t} className="px-3 py-1 bg-gray-100 border-2 border-black text-xs font-black uppercase">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-4 flex-shrink-0 relative">
                        <button className="neo-btn" onClick={() => setListDropdown(d => !d)}>
                            <BookmarkPlus size={18} strokeWidth={3} /> SAVE TO LIST
                        </button>

                        {listDropdown && (
                            <div className="absolute right-0 top-full mt-4 w-72 neo-card p-4 z-20 animate-fade-in">
                                <div className="text-xs font-black uppercase mb-3">YOUR LISTS</div>
                                {lists.length === 0 && (
                                    <p className="text-xs font-bold py-2 text-gray-500">No lists yet. Create one below.</p>
                                )}
                                <div className="space-y-1 mb-4">
                                    {lists.map(l => (
                                        <button
                                            key={l.id}
                                            className="w-full text-left px-3 py-2 border-2 border-transparent hover:border-black hover:bg-gray-50 font-bold text-sm flex justify-between items-center transition-all"
                                            onClick={() => handleSaveToList(l.id)}
                                        >
                                            <span>{l.name.toUpperCase()}</span>
                                            {l.companyIds.includes(company.id) && <Check size={14} strokeWidth={4} className="text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t-2 border-black pt-4">
                                    <div className="flex gap-2">
                                        <input
                                            className="neo-input py-2 text-xs font-bold"
                                            placeholder="NEW LIST NAME…"
                                            value={newListName}
                                            onChange={e => setNewListName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                                        />
                                        <button className="neo-btn p-2" onClick={handleCreateList}>
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="neo-btn neo-btn-secondary">
                            <ExternalLink size={18} strokeWidth={3} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* ── Left 2/3 ── */}
                <div className="col-span-2 space-y-8">

                    {/* Metadata grid */}
                    <div className="neo-card">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-3">
                            <TrendingUp size={20} strokeWidth={3} /> COMPANY OVERVIEW
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { icon: Calendar, label: 'Founded', value: company.founded },
                                { icon: Users, label: 'Headcount', value: `~${company.headcount.toLocaleString()}` },
                                { icon: DollarSign, label: 'Total Funding', value: company.funding },
                                { icon: MapPin, label: 'Location', value: company.location },
                                { icon: Globe, label: 'Domain', value: company.domain },
                                { icon: Tag, label: 'Industry', value: company.industry },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-4 p-4 border-2 border-black bg-gray-50 shadow-[3px 3px 0px 0px #000]">
                                    <Icon size={20} strokeWidth={3} className="text-indigo-600 flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</div>
                                        <div className="text-base font-black">{value.toString().toUpperCase()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signals Timeline */}
                    <div className="neo-card">
                        <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3">
                            <Clock size={20} strokeWidth={3} /> ACTIVITY SIGNALS
                        </h2>
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
                            <div className="space-y-8">
                                {company.signals.map((s: { type: string; date: string; text: string }, i: number) => {
                                    const col = SIGNAL_COLORS[s.type] || { bg: '#ffffff', text: '#000000' };
                                    return (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[38px] top-1 w-6 h-6 border-4 border-black bg-white flex items-center justify-center">
                                                <div className="w-2 h-2 bg-black" />
                                            </div>
                                            <div className="neo-card p-4 ml-2">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="neo-badge" style={{ background: col.bg, color: col.text }}>
                                                        {s.type}
                                                    </span>
                                                    <span className="text-xs font-black uppercase text-gray-500">{formatDate(s.date).toUpperCase()}</span>
                                                </div>
                                                <p className="text-base font-bold leading-snug">{s.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Live Enrichment */}
                    <div className="neo-card">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black uppercase flex items-center gap-3">
                                <Zap size={20} strokeWidth={3} /> LIVE INTELLIGENCE
                                {enrichResult && (
                                    <span className="text-xs font-bold text-gray-500">
                                        · CACHED {formatDate(enrichResult.enrichedAt).toUpperCase()}
                                    </span>
                                )}
                            </h2>
                            <button className="neo-btn neo-btn-accent" onClick={handleEnrich} disabled={enriching}>
                                {enriching
                                    ? <><Loader2 size={18} className="animate-spin" /> ENRICHING…</>
                                    : <><Zap size={18} strokeWidth={3} /> {enrichResult ? 'RE-ENRICH' : 'ENRICH'}</>}
                            </button>
                        </div>

                        {enrichError && (
                            <div className="neo-card bg-red-50 border-red-600 mb-8 flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-base font-black uppercase text-red-600">{enrichError}</span>
                            </div>
                        )}

                        {enriching && !enrichResult && (
                            <div className="space-y-6 animate-pulse">
                                {[80, 60, 90, 50].map((w, i) => (
                                    <div key={i} className="h-4 bg-gray-200 border-2 border-black" style={{ width: `${w}%` }} />
                                ))}
                            </div>
                        )}

                        {enrichResult && (
                            <div className="space-y-8 animate-fade-in">
                                <Section label="Summary">
                                    <p className="text-lg font-bold leading-relaxed">{enrichResult.summary}</p>
                                </Section>

                                <Section label="What They Do">
                                    <ul className="space-y-3">
                                        {enrichResult.bullets.map((b: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-base font-bold">
                                                <span className="w-5 h-5 bg-black text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">›</span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </Section>

                                <Section label="Keywords">
                                    <div className="flex flex-wrap gap-2">
                                        {enrichResult.keywords.map((k: string) => (
                                            <span key={k} className="neo-badge bg-[#facc15]">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </Section>

                                <Section label="Derived Signals">
                                    <div className="space-y-3">
                                        {enrichResult.signals.map((s: string, i: number) => (
                                            <div key={i} className="p-4 border-2 border-black bg-green-50 font-bold text-base shadow-[3px 3px 0px 0px #000]">
                                                {s.toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                <Section label="Sources">
                                    <div className="space-y-2">
                                        {enrichResult.sources.map((src: { url: string; timestamp: string }, i: number) => (
                                            <div key={i} className="flex items-center gap-3 text-xs font-black uppercase text-gray-500">
                                                <Globe size={14} strokeWidth={3} />
                                                <a href={src.url} target="_blank" rel="noopener noreferrer"
                                                    className="hover:underline truncate text-indigo-600">
                                                    {src.url}
                                                </a>
                                                <span>· {formatDate(src.timestamp).toUpperCase()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            </div>
                        )}

                        {!enrichResult && !enriching && !enrichError && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-400 bg-gray-50">
                                <Zap size={48} strokeWidth={1} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-black uppercase text-gray-400">Click ENRICH to fetch live intelligence</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right 1/3 ── */}
                <div className="space-y-6">
                    {/* Notes */}
                    <div className="neo-card">
                        <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-3">
                            <FileText size={18} strokeWidth={3} /> NOTES
                        </h2>
                        <textarea
                            className="neo-input text-sm font-bold resize-none mb-4 min-h-[300px]"
                            placeholder="ADD INVESTMENT THESIS, OBSERVATIONS, OR DUE DILIGENCE NOTES…"
                            value={note}
                            onChange={e => { setNote(e.target.value); setNoteSaved(false); }}
                            style={{ lineHeight: '1.6' }}
                        />
                        <button className={`neo-btn w-full ${noteSaved ? 'bg-white' : 'neo-btn-accent'}`} onClick={handleNoteSave}>
                            {noteSaved ? <><Check size={18} strokeWidth={3} /> SAVED!</> : 'SAVE NOTE'}
                        </button>
                    </div>

                    {/* Quick stats */}
                    <div className="neo-card bg-yellow-50">
                        <div className="text-xs font-black uppercase tracking-widest mb-4">
                            QUICK INFO
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Country', value: company.country },
                                { label: 'Stage', value: company.stage },
                                { label: 'Signals', value: `${company.signals.length} EVENTS` },
                                { label: 'Tags', value: `${company.tags.length} TAGS` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-sm font-black uppercase">
                                    <span className="text-gray-500">{label}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="text-xs font-black uppercase tracking-widest mb-4">
                {label}
            </div>
            {children}
        </div>
    );
}
