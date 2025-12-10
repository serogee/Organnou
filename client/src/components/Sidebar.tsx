'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    MessageSquare,
    Tag,
    Building2,
    Calendar,
    Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: Home, label: 'Dashboard' },
        { href: '/announcements', icon: MessageSquare, label: 'Announcements' },
        { href: '/calendar', icon: Calendar, label: 'Calendar' },
        { href: '/topics', icon: Tag, label: 'Topics' },
        { href: '/buildings', icon: Building2, label: 'Buildings' },
    ];

    return (
        <>
            {/* Desktop Sidebar - Expanded */}
            <div className="hidden md:flex fixed left-0 top-0 h-screen w-56 bg-slate-900 flex-col py-6 px-3 space-y-2 z-50">
                <div className="px-3 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white text-lg font-bold leading-tight">
                                Organnou
                            </h2>
                        </div>
                    </div>
                </div>

                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Sidebar - Compact */}
            <div className="md:hidden fixed left-0 top-0 h-screen w-16 bg-slate-900 flex flex-col items-center py-6 space-y-4 z-50">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative group',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
