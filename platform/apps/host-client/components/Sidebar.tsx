// apps/host-client/app/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Wrench, LogOut } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Tools', href: '/dashboard/tools', icon: Wrench },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside className="w-64 shrink-0 border-r bg-gray-50 dark:bg-gray-900 h-screen sticky top-0 flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-center">Host Panel</h2>
            </div>
            <nav className="flex flex-col p-2 grow">
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
            <div className="p-2 border-t">
                 <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}