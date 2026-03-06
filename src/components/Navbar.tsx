'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Activity, MessageSquare, AlertTriangle, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
    const t = useTranslations();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const links = [
        { href: '/', label: t('nav.live'), icon: Activity },
        { href: '/tracker/bombing-updates', label: t('nav.strikes'), icon: ShieldAlert },
        { href: '/tracker/leader-statements', label: t('nav.leaders'), icon: MessageSquare },
        { href: '/tracker/ceasefire-talks', label: t('nav.diplomacy'), icon: Activity },
        { href: '/about', label: t('nav.about'), icon: Info },
    ];

    return (
        <nav className="bg-war-panel border-b border-war-border sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Desktop Nav */}
                    <div className="flex">
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                            <span className="font-bold text-xl tracking-tight text-white uppercase hidden sm:block">
                                Iran<span className="text-zinc-500">War</span>.net
                            </span>
                        </Link>

                        <div className="hidden md:ml-8 md:flex md:space-x-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`inline-flex items-center px-4 py-2 mt-2 mb-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-zinc-800 text-white'
                                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-war-border bg-war-panel">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
