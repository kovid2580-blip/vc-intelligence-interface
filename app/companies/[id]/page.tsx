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
    funding: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    product: { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
    hiring: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    partnership: { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6' },
    growth: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6' },
    acquisition: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
    leadership: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
    regulatory: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444' },
    contract: { bg: 'rgba(16,185,129,0.12)', text: '#10b981' },
    expansion: { bg: 'rgba(139,92,246,0.12)', text: '#8b5cf6' },
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
            <div className="p-8 text-center">
                <AlertCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <h2 className="text-lg font-semibold mb-2">Company not found</h2>
                <button className="btn btn-secondary mt-4" onClick={() => router.push('/companies')}>
                    <ArrowLeft size={14} /> Go back
                </button>
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
        <div className="p-8 max-w-[1200px] mx-auto animate-fade-in space-y-8">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="btn btn-ghost -ml-4"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            {/* Title / Hero */}
            <div className="card">
                <div className="flex items-start justify-between gap-6">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-dim), rgba(139,92,246,0.15))',
                            color: 'var(--accent)',
                            border: '1px solid rgba(99,102,241,0.2)',
                        }}
                    >
                        {company.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-3 mb-2">
                            <h1 className="text-xl font-bold">{company.name}</h1>
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                {company.stage}
                            </span>
                            {inList && (
                                <span className="badge" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                                    <Check size={10} /> In a list
                                </span>
                            )}
                        </div>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{company.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {company.tags.map((t: string) => (
                                <span key={t} className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 10px' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 flex-shrink-0 relative">
                        <button className="btn btn-secondary" onClick={() => setListDropdown(d => !d)}>
                            <BookmarkPlus size={14} /> Save to List
                        </button>

                        {listDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-64 card p-3 z-20 animate-fade-in">
                                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>YOUR LISTS</div>
                                {lists.length === 0 && (
                                    <p className="text-xs py-2" style={{ color: 'var(--text-muted)' }}>No lists yet. Create one below.</p>
                                )}
                                {lists.map(l => (
                                    <button
                                        key={l.id}
                                        className="w-full text-left px-2 py-2 rounded text-sm flex justify-between items-center transition-colors"
                                        style={{ background: 'transparent' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        onClick={() => handleSaveToList(l.id)}
                                    >
                                        <span>{l.name}</span>
                                        {l.companyIds.includes(company.id) && <Check size={12} style={{ color: 'var(--green)' }} />}
                                    </button>
                                ))}
                                <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex gap-1">
                                        <input
                                            className="input text-xs py-1.5"
                                            placeholder="New list name…"
                                            value={newListName}
                                            onChange={e => setNewListName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleCreateList()}
                                        />
                                        <button className="btn btn-primary px-2 py-1" onClick={handleCreateList}>
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-5">
                {/* ── Left 2/3 ── */}
                <div className="col-span-2 space-y-5">

                    {/* Metadata grid */}
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp size={15} style={{ color: 'var(--accent)' }} /> Company Overview
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Calendar, label: 'Founded', value: company.founded },
                                { icon: Users, label: 'Headcount', value: `~${company.headcount.toLocaleString()}` },
                                { icon: DollarSign, label: 'Total Funding', value: company.funding },
                                { icon: MapPin, label: 'Location', value: company.location },
                                { icon: Globe, label: 'Domain', value: company.domain },
                                { icon: Tag, label: 'Industry', value: company.industry },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                                    <Icon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
                                        <div className="text-sm font-medium">{value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signals Timeline */}
                    <div className="card p-5">
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Clock size={15} style={{ color: 'var(--accent)' }} /> Activity Signals
                        </h2>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                            <div className="space-y-4">
                                {company.signals.map((s: { type: string; date: string; text: string }, i: number) => {
                                    const col = SIGNAL_COLORS[s.type] || { bg: 'var(--bg-hover)', text: 'var(--text-secondary)' };
                                    return (
                                        <div key={i} className="flex gap-4 relative pl-8">
                                            <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 mt-1"
                                                style={{ borderColor: col.text, background: col.bg }} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="badge text-[10px]" style={{ background: col.bg, color: col.text }}>
                                                        {s.type}
                                                    </span>
                                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(s.date)}</span>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Live Enrichment */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                <Zap size={15} style={{ color: 'var(--accent)' }} /> Live Enrichment
                                {enrichResult && (
                                    <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                                        · Cached {formatDate(enrichResult.enrichedAt)}
                                    </span>
                                )}
                            </h2>
                            <button className="btn btn-primary" onClick={handleEnrich} disabled={enriching}>
                                {enriching
                                    ? <><Loader2 size={13} className="animate-spin" /> Enriching…</>
                                    : <><Zap size={13} /> {enrichResult ? 'Re-enrich' : 'Enrich'}</>}
                            </button>
                        </div>

                        {enrichError && (
                            <div className="rounded-lg p-3 mb-4 flex items-start gap-2"
                                style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <AlertCircle size={14} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
                                <span className="text-sm" style={{ color: 'var(--red)' }}>{enrichError}</span>
                            </div>
                        )}

                        {enriching && !enrichResult && (
                            <div className="space-y-3 animate-pulse">
                                {[80, 60, 90, 50].map((w, i) => (
                                    <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
                                ))}
                            </div>
                        )}

                        {enrichResult && (
                            <div className="space-y-5 animate-fade-in">
                                <Section label="Summary">
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{enrichResult.summary}</p>
                                </Section>

                                <Section label="What They Do">
                                    <ul className="space-y-1.5">
                                        {enrichResult.bullets.map((b: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--accent)', flexShrink: 0, lineHeight: '20px' }}>›</span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </Section>

                                <Section label="Keywords">
                                    <div className="flex flex-wrap gap-1.5">
                                        {enrichResult.keywords.map((k: string) => (
                                            <span key={k} className="badge"
                                                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </Section>

                                <Section label="Derived Signals">
                                    <div className="space-y-2">
                                        {enrichResult.signals.map((s: string, i: number) => (
                                            <div key={i} className="p-2.5 rounded-lg text-sm"
                                                style={{ background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.15)', color: 'var(--text-secondary)' }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </Section>

                                <Section label="Sources">
                                    {enrichResult.sources.map((src: { url: string; timestamp: string }, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <Globe size={10} />
                                            <a href={src.url} target="_blank" rel="noopener noreferrer"
                                                className="hover:underline truncate" style={{ color: 'var(--accent)' }}>
                                                {src.url}
                                            </a>
                                            <span>· {formatDate(src.timestamp)}</span>
                                        </div>
                                    ))}
                                </Section>
                            </div>
                        )}

                        {!enrichResult && !enriching && !enrichError && (
                            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                <Zap size={28} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Click <strong>Enrich</strong> to fetch live intelligence from {company.domain}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right 1/3 ── */}
                <div className="space-y-4">
                    {/* Notes */}
                    <div className="card p-4">
                        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <FileText size={14} style={{ color: 'var(--accent)' }} /> Notes
                        </h2>
                        <textarea
                            className="input text-xs resize-none mb-2"
                            rows={10}
                            placeholder="Add your investment thesis, observations, or due diligence notes…"
                            value={note}
                            onChange={e => { setNote(e.target.value); setNoteSaved(false); }}
                            style={{ lineHeight: '1.6' }}
                        />
                        <button className={`btn w-full ${noteSaved ? 'btn-secondary' : 'btn-primary'}`} onClick={handleNoteSave}>
                            {noteSaved ? <><Check size={13} /> Saved!</> : 'Save Note'}
                        </button>
                    </div>

                    {/* Quick stats */}
                    <div className="card p-4">
                        <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                            Quick Info
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'Country', value: company.country },
                                { label: 'Stage', value: company.stage },
                                { label: 'Signals', value: `${company.signals.length} events` },
                                { label: 'Tags', value: `${company.tags.length} tags` },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                    <span className="font-medium">{value}</span>
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
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                {label}
            </div>
            {children}
        </div>
    );
}
