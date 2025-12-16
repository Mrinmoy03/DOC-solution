import React from 'react';
import { type PixelCrop } from 'react-image-crop';

interface CropToolProps {
    onApplyCrop: () => void;
    completedCrop: PixelCrop | undefined;
    onResetCrop: () => void;
}

export const CropTool: React.FC<CropToolProps> = ({ onApplyCrop, completedCrop, onResetCrop }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Crop Image</h3>
            <p className="text-slate-500 text-sm">Drag on the image to create a crop area.</p>
            <div className="flex gap-2">
                <button
                    onClick={onApplyCrop}
                    disabled={!completedCrop}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${completedCrop
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    Save Crop
                </button>
                <button
                    onClick={onResetCrop}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                    Reset
                </button>
            </div>
            {/* Aspect Ratio Presets could go here */}
        </div>
    );
};
