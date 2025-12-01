'use client';

import { SwapCard } from '@/components/swap/SwapCard';
import { TrendingUp, Shield, Zap, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white">
          Swap Tokens with <span className="text-gray-500 dark:text-gray-400">Confidence</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Trade tokens instantly with minimal slippage. Powered by advanced AMM algorithms on SUI blockchain.
        </p>
      </div>

      {/* Swap Card */}
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <SwapCard />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        {[
          {
            icon: Zap,
            title: 'Instant Swaps',
            description: 'Execute trades in milliseconds with SUI\'s high-performance blockchain',
          },
          {
            icon: Shield,
            title: 'Slippage Protection',
            description: 'Advanced protection mechanisms ensure you get the best price',
          },
          {
            icon: TrendingUp,
            title: 'Best Rates',
            description: 'Optimal routing finds the best rates across all pools',
          },
          {
            icon: Award,
            title: 'NFT Positions',
            description: 'LP positions as NFTs for transparent ownership and easy management',
          },
        ].map((feature, index) => (
          <div
            key={feature.title}
            className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-white dark:text-black" />
            </div>
            <h3 className="font-semibold text-lg text-black dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
