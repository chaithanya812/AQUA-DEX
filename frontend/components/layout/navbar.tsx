'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Droplets, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WalletButton } from './wallet-button';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NAVIGATION = [
    { name: 'Swap', href: '/' },
    { name: 'Pools', href: '/pools' },
    { name: 'Positions', href: '/positions' },
];

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="text-xl font-bold text-black dark:text-white">
                            AquaSwap
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAVIGATION.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'text-sm font-medium transition-colors hover:text-black dark:hover:text-white',
                                    pathname === item.href
                                        ? 'text-black dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Wallet & Mobile Menu */}
                    <div className="flex items-center gap-4">
                        <WalletButton />

                        <button
                            className="md:hidden p-2 text-gray-500 hover:text-black dark:hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        {NAVIGATION.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                                    pathname === item.href
                                        ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-black dark:hover:text-white'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
