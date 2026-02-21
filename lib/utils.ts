import { VCList, SavedSearch, Note, EnrichmentResult } from './types';

// ── LocalStorage helpers ──────────────────────────────────────────────────────

export function getLists(): VCList[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('vc-lists') || '[]'); }
    catch { return []; }
}

export function saveLists(lists: VCList[]): void {
    localStorage.setItem('vc-lists', JSON.stringify(lists));
}

export function getSavedSearches(): SavedSearch[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('vc-saved-searches') || '[]'); }
    catch { return []; }
}

export function saveSavedSearches(searches: SavedSearch[]): void {
    localStorage.setItem('vc-saved-searches', JSON.stringify(searches));
}

export function getNote(companyId: string): Note | null {
    if (typeof window === 'undefined') return null;
    try {
        const notes = JSON.parse(localStorage.getItem('vc-notes') || '{}');
        return notes[companyId] || null;
    } catch { return null; }
}

export function saveNote(companyId: string, content: string): void {
    try {
        const notes = JSON.parse(localStorage.getItem('vc-notes') || '{}');
        notes[companyId] = { companyId, content, updatedAt: new Date().toISOString() };
        localStorage.setItem('vc-notes', JSON.stringify(notes));
    } catch { /* ignore */ }
}

export function getEnrichmentCache(companyId: string): EnrichmentResult | null {
    if (typeof window === 'undefined') return null;
    try {
        const cache = JSON.parse(localStorage.getItem('vc-enrichment-cache') || '{}');
        return cache[companyId] || null;
    } catch { return null; }
}

export function saveEnrichmentCache(companyId: string, result: EnrichmentResult): void {
    try {
        const cache = JSON.parse(localStorage.getItem('vc-enrichment-cache') || '{}');
        cache[companyId] = result;
        localStorage.setItem('vc-enrichment-cache', JSON.stringify(cache));
    } catch { /* ignore */ }
}

// ── Export helpers ────────────────────────────────────────────────────────────

export function downloadJSON(data: object, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string): void {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
        headers.join(','),
        ...rows.map(row =>
            headers.map(h => {
                const val = row[h];
                const str = Array.isArray(val) ? val.join('; ') : String(val ?? '');
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',')
        ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function cn(...classes: (string | undefined | false | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}
