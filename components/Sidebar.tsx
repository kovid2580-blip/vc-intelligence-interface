'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Building2, FolderOpen, BookmarkCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV = [
    { href: '/companies', icon: Building2, label: 'Companies' },
    { href: '/lists', icon: FolderOpen, label: 'Lists' },
    { href: '/saved', icon: BookmarkCheck, label: 'Saved Searches' },
];

const LogoIcon = ({ size = 20 }: { size?: number }) => (
    <div
        style={{
            width: size + 4,
            height: size + 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-white)',
            border: '2px solid var(--border-main)',
            boxShadow: '2px 2px 0px 0px var(--border-main)'
        }}
    >
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
        >
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="var(--bg-vibrant-accent)" stroke="var(--border-main)" />
            <path d="M2 17L12 22L22 17" stroke="var(--border-main)" />
            <path d="M2 12L12 17L22 12" stroke="var(--border-main)" />
        </svg>
    </div>
);

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className="sidebar"
            style={{ width: collapsed ? '80px' : '240px', transition: 'width 0.1s ease' }}
        >
            {/* Logo */}
            <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <LogoIcon size={collapsed ? 24 : 20} />
                {!collapsed && <span className="sidebar-logo-text">VC INTEL</span>}
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {NAV.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`sidebar-link ${active ? 'active' : ''}`}
                            title={collapsed ? label : undefined}
                            style={{
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                marginBottom: '4px'
                            }}
                        >
                            <Icon size={18} strokeWidth={3} className="flex-shrink-0" />
                            {!collapsed && <span>{label.toUpperCase()}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? 'Expand' : 'Collapse'}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
                {collapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
                {!collapsed && <span style={{ fontSize: '12px', letterSpacing: '1px' }}>COLLAPSE</span>}
            </button>
        </aside>
    );
}
