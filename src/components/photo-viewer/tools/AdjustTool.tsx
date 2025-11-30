import React from 'react';
import { ControlSlider } from '../ControlSlider';
import type { ResizeDimensions } from '../types';

interface AdjustToolProps {
    brightness: number;
    setBrightness: (value: number) => void;
    contrast: number;
    setContrast: (value: number) => void;
    saturate: number;
    setSaturate: (value: number) => void;
    hueRotate: number;
    setHueRotate: (value: number) => void;
    scale: number;
    setScale: (value: number) => void;
    rotate: number;
    setRotate: (value: number) => void;
    resizeUnit: 'px' | 'in' | 'cm';
    onResizeUnitChange: (unit: 'px' | 'in' | 'cm') => void;
    dpi: number;
    onDpiChange: (dpi: number) => void;
    resizeDimensions: ResizeDimensions;
    onDisplayValueChange: (dimension: 'width' | 'height', value: number) => void;
    maintainAspectRatio: boolean;
    setMaintainAspectRatio: (value: boolean) => void;
    onApplyResize: () => void;
    getDisplayValue: (px: number) => number;
}

export const AdjustTool: React.FC<AdjustToolProps> = ({
    brightness, setBrightness,
    contrast, setContrast,
    saturate, setSaturate,
    hueRotate, setHueRotate,
    scale, setScale,
    rotate, setRotate,
    resizeUnit, onResizeUnitChange,
    dpi, onDpiChange,
    resizeDimensions, onDisplayValueChange,
    maintainAspectRatio, setMaintainAspectRatio,
    onApplyResize,
    getDisplayValue,
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <div className="space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Light & Color</h3>
                <ControlSlider label="Brightness" value={brightness} min={0} max={200} onChange={setBrightness} />
                <ControlSlider label="Contrast" value={contrast} min={0} max={200} onChange={setContrast} />
                <ControlSlider label="Saturation" value={saturate} min={0} max={200} onChange={setSaturate} />
                <ControlSlider label="Hue Rotate" value={hueRotate} min={0} max={360} unit="°" onChange={setHueRotate} />
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Transform</h3>
                <ControlSlider label="Zoom" value={scale} min={0.1} max={3} step={0.1} onChange={setScale} />
                <ControlSlider label="Rotation" value={rotate} min={-180} max={180} unit="°" onChange={setRotate} />
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resize Output</h3>

                {/* Unit Selection */}
                <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
                    {(['px', 'in', 'cm'] as const).map(unit => (
                        <button
                            key={unit}
                            onClick={() => onResizeUnitChange(unit)}
                            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${resizeUnit === unit
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {unit.toUpperCase()}
                        </button>
                    ))}
                </div>

                {resizeUnit !== 'px' && (
                    <div className="mb-4">
                        <label className="text-slate-400 text-xs font-medium mb-1 block">DPI (Dots Per Inch)</label>
                        <input
                            type="number"
                            value={dpi}
                            onChange={(e) => onDpiChange(Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-slate-400 text-xs font-medium mb-1 block">Width ({resizeUnit})</label>
                        <input
                            type="number"
                            value={getDisplayValue(resizeDimensions.width) || ''}
                            onChange={(e) => onDisplayValueChange('width', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex items-center pb-2">
                        <button
                            onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                            className={`p-2 rounded-lg transition-colors ${maintainAspectRatio ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600 hover:text-slate-400'}`}
                            title="Maintain Aspect Ratio"
                        >
                            {maintainAspectRatio ? '🔒' : '🔓'}
                        </button>
                    </div>
                    <div className="flex-1">
                        <label className="text-slate-400 text-xs font-medium mb-1 block">Height ({resizeUnit})</label>
                        <input
                            type="number"
                            value={getDisplayValue(resizeDimensions.height) || ''}
                            onChange={(e) => onDisplayValueChange('height', Number(e.target.value))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
                <button
                    onClick={onApplyResize}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/25"
                >
                    Apply Resize
                </button>
            </div>
        </div>
    );
};
