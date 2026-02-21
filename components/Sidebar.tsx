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
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Top layer */}
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" stroke="white" />
        {/* Middle layer */}
        <path d="M2 12L12 17L22 12M2 7L12 12L22 7" stroke="white" strokeOpacity="0.8" />
        {/* Bottom layer */}
        <path d="M2 17L12 22L22 17" stroke="white" strokeOpacity="0.6" />
    </svg>
);

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className="sidebar"
            style={{ width: collapsed ? '60px' : '220px', transition: 'width 0.2s ease' }}
        >
            {/* Logo */}
            <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <div className="sidebar-logo-icon">
                    <LogoIcon size={18} />
                </div>
                {!collapsed && <span className="sidebar-logo-text">VC Intel</span>}
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
                            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                className="sidebar-collapse-btn"
                onClick={() => setCollapsed(c => !c)}
                title={collapsed ? 'Expand' : 'Collapse'}
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                {!collapsed && <span>Collapse</span>}
            </button>
        </aside>
    );
}
