import { Calculator } from 'lucide-react';

interface PriceImpactProps {
    impact: number; // percentage
}

export function PriceImpact({ impact }: PriceImpactProps) {
    const getImpactColor = () => {
        if (impact < 1) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (impact < 3) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    const getImpactIcon = () => {
        if (impact < 1) return '🟢';
        if (impact < 3) return '🟡';
        return '🔴';
    };

    const getImpactLabel = () => {
        if (impact < 1) return 'Low Impact';
        if (impact < 3) return 'Medium Impact';
        return 'High Impact';
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getImpactColor()}`}>
            <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-medium">Price Impact</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs">{getImpactLabel()}</span>
                <span className="font-bold">{getImpactIcon()} {impact.toFixed(2)}%</span>
            </div>
        </div>
    );
}
