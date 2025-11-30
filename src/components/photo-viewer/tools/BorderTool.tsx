import React from 'react';
import { ControlSlider } from '../ControlSlider';

interface BorderToolProps {
    borderWidth: number;
    setBorderWidth: (value: number) => void;
    borderColor: string;
    setBorderColor: (value: string) => void;
}

export const BorderTool: React.FC<BorderToolProps> = ({
    borderWidth,
    setBorderWidth,
    borderColor,
    setBorderColor,
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Border Style</h3>
            <ControlSlider label="Width" value={borderWidth} min={0} max={50} unit="px" onChange={setBorderWidth} />
            <div>
                <label className="block text-slate-400 text-xs font-medium mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                    {['#000000', '#ffffff', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'].map(c => (
                        <button
                            key={c}
                            onClick={() => setBorderColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${borderColor === c ? 'border-white shadow-lg scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                    />
                </div>
            </div>
        </div>
    );
};
