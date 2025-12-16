import { useState } from 'react';
import { X } from 'lucide-react';

interface InsertSymbolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (symbol: string) => void;
}

type Category = 'Math' | 'Currency' | 'Greek' | 'Arrows' | 'General';

const SYMBOLS: Record<Category, string[]> = {
    Math: ['+', '-', '×', '÷', '=', '≠', '≈', '±', '<', '>', '≤', '≥', '√', '∛', '∞', 'π', '∑', '∫', 'µ', '∂', '∆', '∏', '∅', '∈', '∉', '⊂', '⊃', '∪', '∩'],
    Currency: ['$', '€', '£', '¥', '¢', '₹', '₽', '₪', '₩', '฿', '₫', '₦', '₴', '₲', '₵', '₸', '₺', '₼', '₾'],
    Greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Δ', 'Ω', 'Σ', 'Φ', 'Ψ'],
    Arrows: ['←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '⇐', '⇑', '⇒', '⇓', '⇔', '⇕', '➔', '➝', '➞'],
    General: ['©', '®', '™', '°', '•', '…', '§', '¶', '†', '‡', '‰', '№', '℠', 'ª', 'º', '✓', '✗', '★', '☆']
};

export const InsertSymbolModal = ({ isOpen, onClose, onInsert }: InsertSymbolModalProps) => {
    const [activeCategory, setActiveCategory] = useState<Category>('Math');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col h-[400px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Insert Symbol</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex border-b overflow-x-auto px-2">
                    {Object.keys(SYMBOLS).map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category as Category)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === category
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Content (Scrollable Grid) */}
                <div className="flex-1 overflow-y-auto p-4 content-start">
                    <div className="grid grid-cols-8 gap-2">
                        {SYMBOLS[activeCategory].map((symbol, index) => (
                            <button
                                key={index}
                                onClick={() => onInsert(symbol)}
                                className="aspect-square flex items-center justify-center text-xl hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 rounded transition-colors"
                                title={symbol}
                            >
                                {symbol}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
