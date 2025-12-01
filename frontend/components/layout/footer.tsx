import { Droplets, Github, Twitter, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-white dark:text-black" />
                            </div>
                            <span className="text-xl font-bold text-black dark:text-white">
                                AquaSwap
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            A decentralized AMM with NFT-based LP positions on SUI blockchain.
                            Trade, provide liquidity, and earn fees with transparent ownership.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-black dark:text-white mb-4">Protocol</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Swap
                                </Link>
                            </li>
                            <li>
                                <Link href="/pools" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Pools
                                </Link>
                            </li>
                            <li>
                                <Link href="/positions" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    Positions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-semibold text-black dark:text-white mb-4">Community</h4>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Github className="w-5 h-5 text-black dark:text-white" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Twitter className="w-5 h-5 text-black dark:text-white" />
                            </a>
                            <a
                                href="https://discord.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5 text-black dark:text-white" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-500">
                        © 2024 AquaSwap. Built for SUI Hackathon.
                    </p>
                </div>
            </div>
        </footer>
    );
}
