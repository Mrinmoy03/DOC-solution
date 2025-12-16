import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Droplet, Layers, Sparkles, Type, Square } from 'lucide-react';

import { Editor } from '@tiptap/react';

interface EffectControlsProps {
    editor?: Editor | null;
    attrs: Record<string, any>;
    onUpdate: (attrs: Record<string, any>) => void;
}

const ThrottledRangeInput = ({ value, onValueChange, ...props }: any) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onValueChange(newValue);
        }, 100);
    };

    return (
        <input
            {...props}
            value={localValue}
            onChange={handleChange}
        />
    );
};

export const EffectControls = ({ editor, attrs, onUpdate }: EffectControlsProps) => {
    const [activeTab, setActiveTab] = useState<'shape' | 'text'>('shape');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Helper to get attribute based on active tab
    const getAttr = (key: string) => {
        if (activeTab === 'text') {
            // Check if we have text selected and use extension attributes
            const selection = editor?.state.selection;
            const isTextSelection = selection && !selection.empty && selection.toJSON().type === 'text';

            if (editor && isTextSelection) {
                return editor.getAttributes('textEffects')[key];
            }
            // Fallback to container attributes if no selection or text box focused
            const textKey = `text${key.charAt(0).toUpperCase() + key.slice(1)}`;
            return attrs[textKey];
        }
        return attrs[key];
    };

    // Helper to update attribute based on active tab
    const updateAttr = (updates: Record<string, any>) => {
        if (activeTab === 'text') {
            const selection = editor?.state.selection;
            const isTextSelection = selection && !selection.empty && selection.toJSON().type === 'text';

            if (editor && isTextSelection) {
                // Apply to selection via extension
                // Get current attributes to ensure we merge instead of overwrite
                const currentAttrs = editor.getAttributes('textEffects');
                const newAttrs = { ...currentAttrs, ...updates };
                editor.chain().setTextEffects(newAttrs).run();
            } else {
                // Apply to container (legacy/fallback behavior)
                const textUpdates: Record<string, any> = {};
                Object.entries(updates).forEach(([key, value]) => {
                    const textKey = `text${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    textUpdates[textKey] = value;
                });
                onUpdate(textUpdates);
            }
        } else {
            onUpdate(updates);
        }
    };

    return (
        <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-2 text-sm">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-md mb-2">
                <button
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'shape'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => setActiveTab('shape')}
                >
                    <Square size={14} />
                    Shape
                </button>
                <button
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-colors ${activeTab === 'text'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    onClick={() => setActiveTab('text')}
                >
                    <Type size={14} />
                    Text
                </button>
            </div>

            {/* Shadow Section */}
            <div className="border-b border-gray-100 last:border-0">
                <div
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => toggleSection('shadow')}
                >
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                        <Droplet size={16} />
                        Shadow
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={!!getAttr('shadowEnabled')}
                            onChange={(e) => {
                                updateAttr({ shadowEnabled: e.target.checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {expandedSection === 'shadow' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                </div>

                {expandedSection === 'shadow' && getAttr('shadowEnabled') && (
                    <div className="p-3 bg-gray-50 rounded mb-2 space-y-3">
                        {/* Color */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Color</label>
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <div className="relative w-8 h-8 rounded-full border border-gray-300 overflow-hidden cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0">
                                    <input
                                        type="color"
                                        value={getAttr('shadowColor') || '#000000'}
                                        onChange={(e) => updateAttr({ shadowColor: e.target.value })}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                        title="Pick Shadow Color"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 flex-grow font-medium">
                                    {(getAttr('shadowColor') || '#000000').toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Blur */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Blur</label>
                                <span className="text-xs text-gray-500">{getAttr('shadowBlur') ?? 4}px</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="50"
                                value={getAttr('shadowBlur') ?? 4}
                                onValueChange={(val: string) => updateAttr({ shadowBlur: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Opacity */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Opacity</label>
                                <span className="text-xs text-gray-500">{Math.round((getAttr('shadowOpacity') ?? 0.4) * 100)}%</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="100"
                                value={(getAttr('shadowOpacity') ?? 0.4) * 100}
                                onValueChange={(val: string) => updateAttr({ shadowOpacity: parseInt(val) / 100 })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Offset X */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Offset X</label>
                                <span className="text-xs text-gray-500">{getAttr('shadowOffsetX') ?? 4}px</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="-50"
                                max="50"
                                value={getAttr('shadowOffsetX') ?? 4}
                                onValueChange={(val: string) => updateAttr({ shadowOffsetX: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Offset Y */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Offset Y</label>
                                <span className="text-xs text-gray-500">{getAttr('shadowOffsetY') ?? 4}px</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="-50"
                                max="50"
                                value={getAttr('shadowOffsetY') ?? 4}
                                onValueChange={(val: string) => updateAttr({ shadowOffsetY: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Inset Shadow (Shape Only) */}
                        {activeTab === 'shape' && (
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="shadowInset"
                                    checked={!!getAttr('shadowInset')}
                                    onChange={(e) => updateAttr({ shadowInset: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <label htmlFor="shadowInset" className="text-xs text-gray-700 select-none cursor-pointer">Inset Shadow (Inner)</label>
                            </div>
                        )}

                        {/* Spread (Shape Only - mostly for box shadow) */}
                        {activeTab === 'shape' && (
                            <div>
                                <div className="flex justify-between">
                                    <label className="text-xs text-gray-500">Spread</label>
                                    <span className="text-xs text-gray-500">{getAttr('shadowSpread') ?? 0}px</span>
                                </div>
                                <ThrottledRangeInput
                                    type="range"
                                    min="-20"
                                    max="50"
                                    value={getAttr('shadowSpread') ?? 0}
                                    onValueChange={(val: string) => updateAttr({ shadowSpread: parseInt(val) })}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reflection Section */}
            <div className="border-b border-gray-100 last:border-0">
                <div
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => toggleSection('reflection')}
                >
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                        <Sparkles size={16} />
                        Reflection
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={!!getAttr('reflectionEnabled')}
                            onChange={(e) => {
                                updateAttr({ reflectionEnabled: e.target.checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {expandedSection === 'reflection' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                </div>

                {expandedSection === 'reflection' && getAttr('reflectionEnabled') && (
                    <div className="p-3 bg-gray-50 rounded mb-2 space-y-3">

                        {/* Size (Height) */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Size</label>
                                <span className="text-xs text-gray-500">{Math.round((getAttr('reflectionSize') ?? 1.0) * 100)}%</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={getAttr('reflectionSize') ?? 1.0}
                                onValueChange={(val: string) => updateAttr({ reflectionSize: parseFloat(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Offset */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Distance</label>
                                <span className="text-xs text-gray-500">{getAttr('reflectionOffset') ?? 0}px</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="50"
                                value={getAttr('reflectionOffset') ?? 0}
                                onValueChange={(val: string) => updateAttr({ reflectionOffset: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Opacity */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Opacity</label>
                                <span className="text-xs text-gray-500">{Math.round((getAttr('reflectionOpacity') ?? 0.4) * 100)}%</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="1"
                                value={(getAttr('reflectionOpacity') ?? 0.4) * 100}
                                onValueChange={(val: string) => updateAttr({ reflectionOpacity: parseInt(val) / 100 })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 3D Section */}
            <div className="border-b border-gray-100 last:border-0">
                <div
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => toggleSection('3d')}
                >
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                        <Layers size={16} />
                        3D Format
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={!!getAttr('threeDEnabled')}
                            onChange={(e) => {
                                updateAttr({ threeDEnabled: e.target.checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {expandedSection === '3d' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                </div>

                {expandedSection === '3d' && getAttr('threeDEnabled') && (
                    <div className="p-3 bg-gray-50 rounded mb-2 space-y-3">
                        {/* Color */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Color</label>
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <div className="relative w-8 h-8 rounded-full border border-gray-300 overflow-hidden cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0">
                                    <input
                                        type="color"
                                        value={getAttr('threeDColor') || '#cccccc'}
                                        onChange={(e) => updateAttr({ threeDColor: e.target.value })}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                                        title="Pick 3D Color"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 flex-grow font-medium">
                                    {(getAttr('threeDColor') || '#cccccc').toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Extrusion Thickness (Layers) */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Thickness</label>
                                <span className="text-xs text-gray-500">{getAttr('threeDExtrusion') ?? 5}</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={getAttr('threeDExtrusion') ?? 5}
                                onValueChange={(val: string) => updateAttr({ threeDExtrusion: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Depth (Perspective) */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Depth</label>
                                <span className="text-xs text-gray-500">{getAttr('threeDDepth') ?? 600}px</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="100"
                                max="2000"
                                step="50"
                                value={getAttr('threeDDepth') ?? 600}
                                onValueChange={(val: string) => updateAttr({ threeDDepth: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Rotate X */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">X Rotation</label>
                                <span className="text-xs text-gray-500">{getAttr('threeDRotateX') ?? 15}°</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="-90"
                                max="90"
                                value={getAttr('threeDRotateX') ?? 15}
                                onValueChange={(val: string) => updateAttr({ threeDRotateX: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Rotate Y */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-xs text-gray-500">Y Rotation</label>
                                <span className="text-xs text-gray-500">{getAttr('threeDRotateY') ?? 15}°</span>
                            </div>
                            <ThrottledRangeInput
                                type="range"
                                min="-90"
                                max="90"
                                value={getAttr('threeDRotateY') ?? 15}
                                onValueChange={(val: string) => updateAttr({ threeDRotateY: parseInt(val) })}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>

            <button
                className="w-full mt-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded font-medium border border-transparent hover:border-red-100 transition-colors"
                onClick={() => {
                    const updates = {
                        shadowEnabled: false,
                        reflectionEnabled: false,
                        threeDEnabled: false,
                    };
                    if (activeTab === 'text') {
                        // Clear text effects
                        const selection = editor?.state.selection;
                        const isTextSelection = selection && !selection.empty && selection.toJSON().type === 'text';

                        if (editor && isTextSelection) {
                            editor.chain().unsetTextEffects().run();
                        } else {
                            updateAttr(updates);
                        }
                    } else {
                        // Clear shape effects
                        updateAttr(updates);
                    }
                }}
            >
                Clear {activeTab === 'shape' ? 'Shape' : 'Text'} Effects
            </button>
        </div>
    );
};
