import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Organnou',
    description: 'Manage announcements, topics, buildings, and rooms',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <Sidebar />
                    <div className="ml-16 md:ml-56">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
