import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'VC Intelligence | Deal Flow Platform',
    description: 'Thesis-native venture intelligence platform for discovering and tracking startups.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <div className="app-shell">
                    <Sidebar />
                    <main className="main-content">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
