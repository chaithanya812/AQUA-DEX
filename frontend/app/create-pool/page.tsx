'use client';

import { CreatePoolForm } from '@/components/pool/CreatePoolForm';
import { MintTokens } from '@/components/debug/MintTokens';

export default function CreatePoolPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                    Create a New Pool
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                    Deploy a new liquidity pool for any token pair. As the first LP, you'll set the initial price.
                </p>
            </div>

            {/* Debug Minting */}
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-75">
                <MintTokens />
            </div>

            {/* Form */}
            <div className="animate-in fade-in slide-in-from-bottom-4 delay-100">
                <CreatePoolForm />
            </div>
        </div>
    );
}
