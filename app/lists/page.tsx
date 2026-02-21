'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Download, X, Building2, Check } from 'lucide-react';
import { VCList, Company } from '@/lib/types';
import { getLists, saveLists, generateId, downloadCSV, downloadJSON } from '@/lib/utils';
import companies from '@/data/companies.json';

export default function ListsPage() {
    const [lists, setLists] = useState<VCList[]>([]);
    const [newListName, setNewListName] = useState('');
    const [activeList, setActiveList] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    useEffect(() => {
        setLists(getLists());
    }, []);

    const createList = () => {
        if (!newListName.trim()) return;
        const newList: VCList = {
            id: generateId(),
            name: newListName.trim(),
            companyIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const updated = [newList, ...lists];
        saveLists(updated);
        setLists(updated);
        setNewListName('');
        setActiveList(newList.id);
    };

    const deleteList = (id: string) => {
        const updated = lists.filter(l => l.id !== id);
        saveLists(updated);
        setLists(updated);
        if (activeList === id) setActiveList(null);
    };

    const removeCompanyFromList = (listId: string, companyId: string) => {
        const updated = lists.map(l =>
            l.id === listId
                ? { ...l, companyIds: l.companyIds.filter(c => c !== companyId), updatedAt: new Date().toISOString() }
                : l
        );
        saveLists(updated);
        setLists(updated);
    };

    const startRename = (list: VCList) => {
        setRenaming(list.id);
        setRenameValue(list.name);
    };

    const saveRename = () => {
        if (!renaming || !renameValue.trim()) return;
        const updated = lists.map(l =>
            l.id === renaming ? { ...l, name: renameValue.trim(), updatedAt: new Date().toISOString() } : l
        );
        saveLists(updated);
        setLists(updated);
        setRenaming(null);
    };

    const exportList = (list: VCList, format: 'csv' | 'json') => {
        const listCompanies = (companies as Company[]).filter(c => list.companyIds.includes(c.id));
        const exportData = listCompanies.map(c => ({
            name: c.name, domain: c.domain, industry: c.industry,
            stage: c.stage, location: c.location, funding: c.funding, founded: c.founded,
        }));
        if (format === 'csv') downloadCSV(exportData as Record<string, unknown>[], `${list.name}.csv`);
        else downloadJSON(exportData, `${list.name}.json`);
    };

    const activeListData = lists.find(l => l.id === activeList);
    const activeCompanies = activeListData
        ? (companies as Company[]).filter(c => activeListData.companyIds.includes(c.id))
        : [];

    return (
        <div className="p-6 max-w-[1100px] mx-auto animate-fade-in">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Lists</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Organize companies into shortlists for tracking and export
                    </p>
                </div>
            </div>

            {/* Create new list */}
            <div className="card p-4 mb-5 flex gap-2">
                <input
                    className="input flex-1"
                    placeholder="New list name (e.g. AI Infra Watchlist)"
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createList()}
                />
                <button className="btn btn-primary" onClick={createList} disabled={!newListName.trim()}>
                    <Plus size={14} /> Create List
                </button>
            </div>

            {lists.length === 0 ? (
                <div className="card p-16 text-center">
                    <FolderOpen size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No lists yet. Create one above or save companies from their profile page.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {/* List sidebar */}
                    <div className="space-y-2">
                        {lists.map(list => (
                            <div
                                key={list.id}
                                className="card p-3 cursor-pointer transition-all"
                                style={activeList === list.id ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)' } : {}}
                                onClick={() => setActiveList(list.id)}
                            >
                                {renaming === list.id ? (
                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                        <input
                                            className="input text-sm flex-1 py-1"
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(null); }}
                                            autoFocus
                                        />
                                        <button className="btn btn-primary px-2" onClick={saveRename}><Check size={13} /></button>
                                        <button className="btn btn-ghost px-2" onClick={() => setRenaming(null)}><X size={13} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">{list.name}</div>
                                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                {list.companyIds.length} {list.companyIds.length === 1 ? 'company' : 'companies'}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-ghost p-1 text-xs" onClick={() => startRename(list)}>✎</button>
                                            <button className="btn btn-ghost p-1" onClick={() => deleteList(list.id)}>
                                                <Trash2 size={12} style={{ color: 'var(--red)' }} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* List detail */}
                    <div className="col-span-2">
                        {activeListData ? (
                            <div className="card overflow-hidden">
                                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <h2 className="font-semibold">{activeListData.name}</h2>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {activeCompanies.length} companies
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost text-xs" onClick={() => exportList(activeListData, 'csv')}>
                                            <Download size={13} /> CSV
                                        </button>
                                        <button className="btn btn-ghost text-xs" onClick={() => exportList(activeListData, 'json')}>
                                            <Download size={13} /> JSON
                                        </button>
                                        <button className="btn btn-ghost text-xs" style={{ color: 'var(--red)' }}
                                            onClick={() => deleteList(activeListData.id)}>
                                            <Trash2 size={13} /> Delete List
                                        </button>
                                    </div>
                                </div>

                                {activeCompanies.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Building2 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            No companies yet. Add them from a company profile page.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Company</th>
                                                <th>Industry</th>
                                                <th>Stage</th>
                                                <th>Funding</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeCompanies.map(c => (
                                                <tr key={c.id}>
                                                    <td>
                                                        <div className="font-medium text-sm">{c.name}</div>
                                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.domain}</div>
                                                    </td>
                                                    <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.industry}</td>
                                                    <td><span className="badge text-xs">{c.stage}</span></td>
                                                    <td className="text-sm font-semibold" style={{ color: '#10b981' }}>{c.funding}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-ghost p-1"
                                                            onClick={() => removeCompanyFromList(activeListData.id, c.id)}
                                                        >
                                                            <X size={13} style={{ color: 'var(--red)' }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <FolderOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Select a list to view its companies</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
