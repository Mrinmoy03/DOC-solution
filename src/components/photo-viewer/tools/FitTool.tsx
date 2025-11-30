import React from 'react';
import type { BackgroundState } from '../types';

interface FitToolProps {
    canvasMode: 'original' | 'square';
    setCanvasMode: (mode: 'original' | 'square') => void;
    background: BackgroundState;
    setBackground: (bg: BackgroundState) => void;
}

export const FitTool: React.FC<FitToolProps> = ({
    canvasMode,
    setCanvasMode,
    background,
    setBackground,
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Canvas Size</h3>
            <div className="flex bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => setCanvasMode('original')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${canvasMode === 'original' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Original
                </button>
                <button
                    onClick={() => setCanvasMode('square')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${canvasMode === 'square' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Square (1:1)
                </button>
            </div>

            {canvasMode === 'square' && (
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Background</h3>

                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setBackground({ ...background, type: 'color' })}
                            className={`flex-1 py-2 border rounded-lg text-xs font-medium transition-all ${background.type === 'color'
                                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            Color
                        </button>
                        <button
                            onClick={() => setBackground({ ...background, type: 'blur' })}
                            className={`flex-1 py-2 border rounded-lg text-xs font-medium transition-all ${background.type === 'blur'
                                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                                : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            Blur
                        </button>
                    </div>

                    {background.type === 'color' && (
                        <div className="flex gap-2 flex-wrap">
                            {['#ffffff', '#000000', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b'].map(c => (
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
                    )}
                </div>
            )}
        </div>
    );
};
