import React, { useRef, useState } from 'react';
import { AdjustTool } from './tools/AdjustTool';
import { FiltersTool } from './tools/FiltersTool';
import { PresetsTool } from './tools/PresetsTool';
import { CropTool } from './tools/CropTool';
import { FitTool } from './tools/FitTool';
import { RemoveBgTool } from './tools/RemoveBgTool';
import { BorderTool } from './tools/BorderTool';
import type { BackgroundState, ResizeDimensions } from './types';
import { type PixelCrop } from 'react-image-crop';
import { PRESET_CATEGORIES } from './constants';

interface SidebarProps {
    // AdjustTool props
    brightness: number; setBrightness: (v: number) => void;
    contrast: number; setContrast: (v: number) => void;
    saturate: number; setSaturate: (v: number) => void;
    hueRotate: number; setHueRotate: (v: number) => void;
    scale: number; setScale: (v: number) => void;
    rotate: number; setRotate: (v: number) => void;
    resizeUnit: 'px' | 'in' | 'cm'; onResizeUnitChange: (u: 'px' | 'in' | 'cm') => void;
    dpi: number; onDpiChange: (d: number) => void;
    resizeDimensions: ResizeDimensions; onDisplayValueChange: (d: 'width' | 'height', v: number) => void;
    maintainAspectRatio: boolean; setMaintainAspectRatio: (v: boolean) => void;
    onApplyResize: () => void;
    getDisplayValue: (px: number) => number;

    // FiltersTool props
    grayscale: number; setGrayscale: (v: number) => void;
    sepia: number; setSepia: (v: number) => void;
    blur: number; setBlur: (v: number) => void;

    // PresetsTool props
    onPresetClick: (preset: typeof PRESET_CATEGORIES[0]['presets'][0]) => void;

    // CropTool props
    onApplyCrop: () => void;
    completedCrop: PixelCrop | undefined;
    onResetCrop: () => void;

    // FitTool props
    canvasMode: 'original' | 'square'; setCanvasMode: (m: 'original' | 'square') => void;
    background: BackgroundState; setBackground: (bg: BackgroundState) => void;

    // RemoveBgTool props
    onRemoveBackground: () => void;
    isRemovingBg: boolean;

    // BorderTool props
    borderWidth: number; setBorderWidth: (v: number) => void;
    borderColor: string; setBorderColor: (v: string) => void;

    // General
    onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'crop' | 'border' | 'presets' | 'fit' | 'remove-bg'>('adjust');

    // Tab scroll logic
    const tabsRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!tabsRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - tabsRef.current.offsetLeft);
        setScrollLeft(tabsRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !tabsRef.current) return;
        e.preventDefault();
        const x = e.pageX - tabsRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        tabsRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (!tabsRef.current) return;
        const scrollAmount = 200;
        const newScrollLeft = direction === 'left'
            ? tabsRef.current.scrollLeft - scrollAmount
            : tabsRef.current.scrollLeft + scrollAmount;

        tabsRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    };

    return (
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
            {/* Tabs */}
            <div className="relative border-b border-slate-800">
                <button
                    onClick={() => handleScroll('left')}
                    className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    ‹
                </button>
                <div
                    ref={tabsRef}
                    className="flex p-2 gap-2 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth"
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {[
                        { id: 'adjust', icon: '🎚️', label: 'Adjust' },
                        { id: 'filters', icon: '🎨', label: 'Filters' },
                        { id: 'presets', icon: '✨', label: 'Presets' },
                        { id: 'crop', icon: '✂️', label: 'Crop' },
                        { id: 'fit', icon: '📐', label: 'Fit' },
                        { id: 'remove-bg', icon: '🎭', label: 'Remove Bg' },
                        { id: 'border', icon: '🖼️', label: 'Border' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`min-w-[70px] py-3 rounded-lg text-xs font-medium flex flex-col items-center gap-1 transition-all shrink-0 ${activeTab === tab.id
                                ? 'bg-slate-800 text-indigo-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            <span className="text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => handleScroll('right')}
                    className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 flex items-center justify-center text-slate-400 hover:text-white"
                >
                    ›
                </button>
            </div>

            {/* Tool Controls */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {activeTab === 'adjust' && (
                    <AdjustTool
                        brightness={props.brightness} setBrightness={props.setBrightness}
                        contrast={props.contrast} setContrast={props.setContrast}
                        saturate={props.saturate} setSaturate={props.setSaturate}
                        hueRotate={props.hueRotate} setHueRotate={props.setHueRotate}
                        scale={props.scale} setScale={props.setScale}
                        rotate={props.rotate} setRotate={props.setRotate}
                        resizeUnit={props.resizeUnit} onResizeUnitChange={props.onResizeUnitChange}
                        dpi={props.dpi} onDpiChange={props.onDpiChange}
                        resizeDimensions={props.resizeDimensions} onDisplayValueChange={props.onDisplayValueChange}
                        maintainAspectRatio={props.maintainAspectRatio} setMaintainAspectRatio={props.setMaintainAspectRatio}
                        onApplyResize={props.onApplyResize}
                        getDisplayValue={props.getDisplayValue}
                    />
                )}
                {activeTab === 'filters' && (
                    <FiltersTool
                        grayscale={props.grayscale} setGrayscale={props.setGrayscale}
                        sepia={props.sepia} setSepia={props.setSepia}
                        blur={props.blur} setBlur={props.setBlur}
                    />
                )}
                {activeTab === 'presets' && <PresetsTool onPresetClick={props.onPresetClick} />}
                {activeTab === 'crop' && (
                    <CropTool
                        onApplyCrop={props.onApplyCrop}
                        completedCrop={props.completedCrop}
                        onResetCrop={props.onResetCrop}
                    />
                )}
                {activeTab === 'fit' && (
                    <FitTool
                        canvasMode={props.canvasMode} setCanvasMode={props.setCanvasMode}
                        background={props.background} setBackground={props.setBackground}
                    />
                )}
                {activeTab === 'remove-bg' && (
                    <RemoveBgTool
                        onRemoveBackground={props.onRemoveBackground}
                        isRemovingBg={props.isRemovingBg}
                        background={props.background} setBackground={props.setBackground}
                    />
                )}
                {activeTab === 'border' && (
                    <BorderTool
                        borderWidth={props.borderWidth} setBorderWidth={props.setBorderWidth}
                        borderColor={props.borderColor} setBorderColor={props.setBorderColor}
                    />
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                <button
                    onClick={props.onReset}
                    className="w-full py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                    <span>↺</span> Reset All Changes
                </button>
            </div>
        </div>
    );
};
