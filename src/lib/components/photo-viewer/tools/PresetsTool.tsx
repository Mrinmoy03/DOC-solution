import React from 'react';
import { PRESET_CATEGORIES } from '../constants';

interface PresetsToolProps {
    onPresetClick: (preset: typeof PRESET_CATEGORIES[0]['presets'][0]) => void;
}

export const PresetsTool: React.FC<PresetsToolProps> = ({ onPresetClick }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Filter Presets</h3>
            <div className="space-y-6">
                {PRESET_CATEGORIES.map((category) => (
                    <div key={category.title} className="space-y-3">
                        <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider pl-1">{category.title}</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {category.presets.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => onPresetClick(preset)}
                                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors text-left"
                                >
                                    {preset.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
