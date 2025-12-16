import { useState, useEffect, useRef } from 'react';
import { X, Move, Type, ChevronDown } from 'lucide-react';

interface ChartToolbarProps {
    onUpdateChart: (attrs: Record<string, any>) => void;
    onClose: () => void;
    currentAttrs: {
        title?: string;
        chartType?: string;
        smooth?: boolean;
        donut?: boolean;
        showGrid?: boolean;
        showLegend?: boolean;
        showValues?: boolean;
        backgroundColor?: string;
        textColor?: string;
        gridColor?: string;
        xAxisLabel?: string;
        yAxisLabel?: string;
        colors?: string[];
    };
}

export const ChartToolbar = ({ onUpdateChart, onClose, currentAttrs }: ChartToolbarProps) => {
    const [activeTab, setActiveTab] = useState<'general' | 'style' | 'labels'>('general');
    const [showColorPicker, setShowColorPicker] = useState<'bg' | 'text' | 'grid' | 'series' | null>(null);
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const toolbarRef = useRef<HTMLDivElement>(null);

    const colors = ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827',
        '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
        '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
        '#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
        '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
        '#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a',
        '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
        '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
        '#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
        '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
        '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87',
        '#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75',
        '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'];

    // Dragging logic - explicitly stop propagation
    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation(); // CRITICAL: Prevents chart drag
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        if (!isDragging) return;
        const handleMouseMove = (e: MouseEvent) => {
            e.stopPropagation(); // CRITICAL
            setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
        };
        const handleMouseUp = (e: MouseEvent) => {
            e.stopPropagation(); // CRITICAL
            setIsDragging(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const renderColorPicker = (type: 'bg' | 'text' | 'grid' | 'series', label: string, value: string | undefined, onSelect: (color: string) => void) => (
        <div className="relative">
            <button
                onClick={() => setShowColorPicker(showColorPicker === type ? null : type)}
                className="w-full p-2 hover:bg-gray-50 rounded border border-gray-200 flex items-center justify-between transition-all group"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-gray-300 shadow-sm" style={{ backgroundColor: value || '#ffffff' }} />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">{label}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            {showColorPicker === type && (
                <div className="absolute top-full mt-2 left-0 bg-white shadow-2xl rounded-lg border border-gray-100 p-2 grid grid-cols-8 gap-1 w-64 z-[100] animate-in fade-in zoom-in-95 duration-100">
                    {colors.map(color => (
                        <button
                            key={color}
                            onClick={() => { onSelect(color); setShowColorPicker(null); }}
                            className="w-5 h-5 rounded border border-gray-200 hover:scale-110 hover:border-blue-500 transition-all"
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div
            ref={toolbarRef}
            className="chart-toolbar fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden w-80 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.y, left: position.x }}
            onMouseDown={(e) => e.stopPropagation()} // Stop all clicks from reaching editor
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
        >
            {/* Draggable Header */}
            <div
                className="bg-gray-50 p-3 flex items-center justify-between border-b cursor-move select-none active:bg-gray-100 transition-colors"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <div className="p-1 bg-white rounded-md border border-gray-200 shadow-sm">
                        <Move className="w-3 h-3 text-blue-500" />
                    </div>
                    Chart Settings
                </div>
                <button onClick={onClose} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-white border-b overflow-x-auto">
                {['general', 'style', 'labels'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${activeTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="p-4 bg-white/50 max-h-[400px] overflow-y-auto">
                {activeTab === 'general' && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Chart Title</label>
                            <input
                                type="text"
                                defaultValue={currentAttrs.title || ''}
                                onBlur={(e) => onUpdateChart({ title: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && onUpdateChart({ title: (e.target as HTMLInputElement).value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Enter title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Appearance</label>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm text-gray-600">Show Grid</span>
                                    <input type="checkbox" checked={!!currentAttrs.showGrid} onChange={(e) => onUpdateChart({ showGrid: e.target.checked })} className="accent-blue-500" />
                                </label>
                                <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm text-gray-600">Show Legend</span>
                                    <input type="checkbox" checked={!!currentAttrs.showLegend} onChange={(e) => onUpdateChart({ showLegend: e.target.checked })} className="accent-blue-500" />
                                </label>
                                <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                    <span className="text-sm text-gray-600">Show Values</span>
                                    <input type="checkbox" checked={!!currentAttrs.showValues} onChange={(e) => onUpdateChart({ showValues: e.target.checked })} className="accent-blue-500" />
                                </label>
                                {(currentAttrs.chartType === 'line' || currentAttrs.chartType === 'area') && (
                                    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <span className="text-sm text-gray-600">Smooth Lines</span>
                                        <input type="checkbox" checked={!!currentAttrs.smooth} onChange={(e) => onUpdateChart({ smooth: e.target.checked })} className="accent-blue-500" />
                                    </label>
                                )}
                                {currentAttrs.chartType === 'pie' && (
                                    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <span className="text-sm text-gray-600">Donut Mode</span>
                                        <input type="checkbox" checked={!!currentAttrs.donut} onChange={(e) => onUpdateChart({ donut: e.target.checked })} className="accent-blue-500" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'style' && (
                    <div className="space-y-3">
                        {renderColorPicker('bg', 'Background', currentAttrs.backgroundColor || '#ffffff', (c) => onUpdateChart({ backgroundColor: c }))}
                        {renderColorPicker('text', 'Text Color', currentAttrs.textColor || '#666', (c) => onUpdateChart({ textColor: c }))}
                        {renderColorPicker('grid', 'Grid Color', currentAttrs.gridColor || '#e0e0e0', (c) => onUpdateChart({ gridColor: c }))}
                    </div>
                )}

                {activeTab === 'labels' && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">X-Axis Label</label>
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue={currentAttrs.xAxisLabel || ''}
                                    onBlur={(e) => onUpdateChart({ xAxisLabel: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && onUpdateChart({ xAxisLabel: (e.target as HTMLInputElement).value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="e.g., Year, Month, Category"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Y-Axis Label</label>
                            <div className="flex items-center gap-2">
                                <Type className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    defaultValue={currentAttrs.yAxisLabel || ''}
                                    onBlur={(e) => onUpdateChart({ yAxisLabel: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && onUpdateChart({ yAxisLabel: (e.target as HTMLInputElement).value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="e.g., Sales, Revenue, Count"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
