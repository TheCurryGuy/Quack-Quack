// apps/participant-client/app/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ListChecks, User } from 'lucide-react';

const navItems = [
    { name: 'Explore', href: '/dashboard', icon: Compass },
    { name: 'My Registrations', href: '/dashboard/registrations', icon: ListChecks },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 shrink-0 border-r bg-gray-50 dark:bg-gray-900 h-screen sticky top-0">
            <div className="p-4">
                <h2 className="text-xl font-bold">Dashboard</h2>
            </div>
            <nav className="flex flex-col p-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                            ${pathname === item.href
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-white'
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}