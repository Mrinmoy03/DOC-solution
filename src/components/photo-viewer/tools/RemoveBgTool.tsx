import React from 'react';
import type { BackgroundState } from '../types';

interface RemoveBgToolProps {
    onRemoveBackground: () => void;
    isRemovingBg: boolean;
    background: BackgroundState;
    setBackground: (bg: BackgroundState) => void;
}

export const RemoveBgTool: React.FC<RemoveBgToolProps> = ({
    onRemoveBackground,
    isRemovingBg,
    background,
    setBackground,
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Background Removal</h3>
            <p className="text-slate-500 text-sm">
                Automatically remove the background from your image. This process runs entirely on your device.
            </p>

            <button
                onClick={onRemoveBackground}
                disabled={isRemovingBg}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${isRemovingBg
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    }`}
            >
                {isRemovingBg ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <span>🎭</span>
                        <span>Remove Background</span>
                    </>
                )}
            </button>

            {isRemovingBg && (
                <p className="text-xs text-center text-slate-500 animate-pulse">
                    This may take a few seconds...
                </p>
            )}

            <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Background Color</h3>
                <div className="flex gap-2 flex-wrap">
                    {/* Transparent Option */}
                    <button
                        onClick={() => setBackground({ type: 'transparent', value: '' })}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${background.type === 'transparent' ? 'border-indigo-500 shadow-lg scale-110' : 'border-slate-700'
                            } bg-slate-800`}
                        title="Transparent"
                    >
                        <span className="text-xs">🚫</span>
                    </button>

                    {['#ffffff', '#000000', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                        <button
                            key={c}
                            onClick={() => setBackground({ type: 'color', value: c })}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${background.value === c && background.type === 'color' ? 'border-indigo-500 shadow-lg scale-110' : 'border-slate-700'
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <input
                        type="color"
                        value={background.value}
                        onChange={(e) => setBackground({ type: 'color', value: e.target.value })}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                    />
                </div>
            </div>
        </div>
    );
};
