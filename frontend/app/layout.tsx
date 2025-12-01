import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AquaSwap - Decentralized AMM on SUI',
  description: 'Trade, provide liquidity, and earn fees with NFT-based LP positions on SUI blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-white dark:bg-black text-black dark:text-white min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-1 pt-20 pb-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
