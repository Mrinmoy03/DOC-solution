import React from 'react';
import { ControlSlider } from '../ControlSlider';

interface FiltersToolProps {
    grayscale: number;
    setGrayscale: (value: number) => void;
    sepia: number;
    setSepia: (value: number) => void;
    blur: number;
    setBlur: (value: number) => void;
}

export const FiltersTool: React.FC<FiltersToolProps> = ({
    grayscale,
    setGrayscale,
    sepia,
    setSepia,
    blur,
    setBlur,
}) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Effects</h3>
            <ControlSlider label="Grayscale" value={grayscale} min={0} max={100} unit="%" onChange={setGrayscale} />
            <ControlSlider label="Sepia" value={sepia} min={0} max={100} unit="%" onChange={setSepia} />
            <ControlSlider label="Blur" value={blur} min={0} max={20} unit="px" onChange={setBlur} />
        </div>
    );
};
