import React from 'react';

interface ControlSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
    <div>
        <div className="flex justify-between mb-2">
            <label className="text-slate-400 text-xs font-medium">{label}</label>
            <span className="text-indigo-400 text-xs font-mono">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
    </div>
);
