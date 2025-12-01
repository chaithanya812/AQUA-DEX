import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatTokenAmount(amount: string | bigint | number, decimals: number, displayDecimals = 4): string {
  if (!amount) return '0';
  const num = Number(amount) / Math.pow(10, decimals);
  return formatNumber(num, displayDecimals);
}

export function parseTokenAmount(amount: string, decimals: number): string {
  if (!amount) return '0';
  try {
    const num = parseFloat(amount);
    return BigInt(Math.floor(num * Math.pow(10, decimals))).toString();
  } catch (e) {
    return '0';
  }
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercent(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function getPriceImpactColor(impact: number): string {
  if (impact < 1) return 'text-green-500';
  if (impact < 5) return 'text-yellow-500';
  return 'text-red-500';
}

export function getPriceImpactBgColor(impact: number): string {
  if (impact < 1) return 'bg-green-500/10';
  if (impact < 5) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}
