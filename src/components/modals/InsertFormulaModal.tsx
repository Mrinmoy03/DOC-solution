import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

interface InsertFormulaModalProps {
    onClose: () => void;
    onInsert: (formula: string) => void;
}

export const InsertFormulaModal = ({ onClose, onInsert }: InsertFormulaModalProps) => {
    const [selectedFunction, setSelectedFunction] = useState('SUM');
    const [selectedRange, setSelectedRange] = useState('ABOVE');
    const [customRange, setCustomRange] = useState('');
    const [useCustomRange, setUseCustomRange] = useState(false);

    // Common functions supported by TableMath
    const functions = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'PRODUCT'];

    // Common directional ranges
    const ranges = ['ABOVE', 'LEFT', 'BELOW', 'RIGHT'];

    const getFormula = () => {
        let range = useCustomRange && customRange.trim() ? customRange.trim().toUpperCase() : selectedRange;
        // Validate: if range contains spaces but isn't a valid range format, use selectedRange instead
        if (range.includes(' ') && !range.match(/^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/)) {
            console.warn('Invalid custom range with spaces:', range, '- using selectedRange instead');
            range = selectedRange;
        }
        return `=${selectedFunction}(${range})`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formula = getFormula();
        console.log('📤 Submitting formula:', formula);
        onInsert(formula);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <Calculator size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Insert Formula</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Function Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Function</label>
                        <div className="grid grid-cols-3 gap-2">
                            {functions.map(func => (
                                <button
                                    key={func}
                                    type="button"
                                    onClick={() => setSelectedFunction(func)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${selectedFunction === func
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {func}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Range Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-700">Number Range</label>

                        {/* Directional Presets */}
                        <div className="grid grid-cols-2 gap-2">
                            {ranges.map(range => (
                                <button
                                    key={range}
                                    type="button"
                                    onClick={() => {
                                        setSelectedRange(range);
                                        setUseCustomRange(false);
                                    }}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${!useCustomRange && selectedRange === range
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="customRange"
                                    checked={useCustomRange}
                                    onChange={(e) => setUseCustomRange(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="customRange" className="text-sm text-slate-600 cursor-pointer">
                                    Custom Range (e.g., A1:B2)
                                </label>
                            </div>

                            {useCustomRange && (
                                <input
                                    type="text"
                                    value={customRange}
                                    onChange={(e) => setCustomRange(e.target.value)}
                                    placeholder="A1 or A1:C5"
                                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">Formula:</span>
                        <code className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                            {getFormula()}
                        </code>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95"
                        >
                            Insert Formula
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
