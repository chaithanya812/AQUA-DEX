import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceImpactWarningProps {
    impact: number;
}

export function PriceImpactWarning({ impact }: PriceImpactWarningProps) {
    const isHigh = impact > 5;
    const isCritical = impact > 10;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border',
                isCritical
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20'
                    : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/20'
            )}
        >
            {isCritical ? (
                <AlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
                <p
                    className={cn(
                        'font-semibold',
                        isCritical
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-yellow-700 dark:text-yellow-400'
                    )}
                >
                    {isCritical ? 'Critical Price Impact!' : 'High Price Impact'}
                </p>
                <p
                    className={cn(
                        'text-sm mt-1',
                        isCritical
                            ? 'text-red-600 dark:text-red-300'
                            : 'text-yellow-600 dark:text-yellow-300'
                    )}
                >
                    {isCritical
                        ? `This trade has a ${impact.toFixed(2)}% price impact. You may receive significantly fewer tokens.`
                        : `This trade has a ${impact.toFixed(2)}% price impact. Consider trading a smaller amount.`}
                </p>
            </div>
        </div>
    );
}
