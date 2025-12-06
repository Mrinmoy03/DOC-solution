import { useState, useRef, useEffect } from 'react';
import { PaintBucket, Square, Layers, Sparkles, Droplet } from 'lucide-react';

interface TextBoxToolbarProps {
    onUpdateTextBox: (attrs: Record<string, any>) => void;
    textBoxAttrs: Record<string, any>;
}

export const TextBoxToolbar = ({ onUpdateTextBox, textBoxAttrs }: TextBoxToolbarProps) => {
    const [position, setPosition] = useState({ x: 100, y: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showFillPicker, setShowFillPicker] = useState(false);
    const [showOutlinePicker, setShowOutlinePicker] = useState(false);
    const [showShadowPicker, setShowShadowPicker] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-toolbar-handle')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    const colors = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    ];

    return (
        <div
            ref={toolbarRef}
            className={`draggable-toolbar ${isDragging ? 'dragging' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="draggable-toolbar-handle">⋮⋮ Text Box Format</div>

            <div className="flex flex-col gap-2">
                {/* Fill Color */}
                <div className="relative">
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm w-full"
                        onClick={() => setShowFillPicker(!showFillPicker)}
                    >
                        <PaintBucket size={16} />
                        Fill Color
                    </button>
                    {showFillPicker && (
                        <div className="absolute left-full ml-3 top-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-sm">
                            <div className="text-xs font-semibold text-gray-700 mb-3">Fill Color</div>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 cursor-pointer border-2 border-gray-200 rounded-lg hover:scale-110 hover:border-blue-400 transition-all duration-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            onUpdateTextBox({ fillColor: color, noFill: false });
                                            setShowFillPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-xs font-medium px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-200 shadow-sm"
                                onClick={() => {
                                    onUpdateTextBox({ noFill: true });
                                    setShowFillPicker(false);
                                }}
                            >
                                No Fill
                            </button>
                        </div>
                    )}
                </div>

                {/* Outline Color */}
                <div className="relative">
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm w-full"
                        onClick={() => setShowOutlinePicker(!showOutlinePicker)}
                    >
                        <Square size={16} />
                        Outline Color
                    </button>
                    {showOutlinePicker && (
                        <div className="absolute left-full ml-3 top-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-sm">
                            <div className="text-xs font-semibold text-gray-700 mb-3">Outline Color</div>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 cursor-pointer border-2 border-gray-200 rounded-lg hover:scale-110 hover:border-blue-400 transition-all duration-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            onUpdateTextBox({ outlineColor: color, noOutline: false });
                                            setShowOutlinePicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-xs font-medium px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all duration-200 shadow-sm"
                                onClick={() => {
                                    onUpdateTextBox({ noOutline: true });
                                    setShowOutlinePicker(false);
                                }}
                            >
                                No Outline
                            </button>
                        </div>
                    )}
                </div>

                {/* Send to Front/Back */}
                <button
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm"
                    onClick={() => onUpdateTextBox({ zIndex: (textBoxAttrs.zIndex || 1) + 1 })}
                >
                    <Layers size={16} />
                    Send to Front
                </button>
                <button
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm"
                    onClick={() => onUpdateTextBox({ zIndex: Math.max(0, (textBoxAttrs.zIndex || 1) - 1) })}
                >
                    <Layers size={16} />
                    Send to Back
                </button>

                {/* Shadow Effect */}
                <div className="relative">
                    <button
                        className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm w-full ${textBoxAttrs.shadowEnabled ? 'bg-blue-100' : ''}`}
                        onClick={() => setShowShadowPicker(!showShadowPicker)}
                    >
                        <Droplet size={16} />
                        Shadow
                    </button>
                    {showShadowPicker && (
                        <div className="absolute left-full ml-3 top-0 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-sm">
                            <div className="text-xs font-semibold text-gray-700 mb-3">Shadow Color</div>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-8 h-8 cursor-pointer border-2 border-gray-200 rounded-lg hover:scale-110 hover:border-blue-400 transition-all duration-200 shadow-sm"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            onUpdateTextBox({ shadowColor: color, shadowEnabled: true });
                                            setShowShadowPicker(false);
                                        }}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-xs font-medium px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 rounded-lg transition-all duration-200 shadow-sm"
                                onClick={() => {
                                    onUpdateTextBox({ shadowEnabled: false });
                                    setShowShadowPicker(false);
                                }}
                            >
                                Remove Shadow
                            </button>
                        </div>
                    )}
                </div>

                {/* Reflection Effect */}
                <button
                    className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm ${textBoxAttrs.reflectionEnabled ? 'bg-blue-100' : ''}`}
                    onClick={() => onUpdateTextBox({ reflectionEnabled: !textBoxAttrs.reflectionEnabled })}
                >
                    <Sparkles size={16} />
                    Reflection
                </button>

                {/* 3D Effect */}
                <button
                    className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm ${textBoxAttrs.threeDEnabled ? 'bg-blue-100' : ''}`}
                    onClick={() => onUpdateTextBox({ threeDEnabled: !textBoxAttrs.threeDEnabled })}
                >
                    <Sparkles size={16} />
                    3D Effect
                </button>

                {/* Watermark */}
                <button
                    className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded text-sm ${textBoxAttrs.isWatermark ? 'bg-blue-100' : ''}`}
                    onClick={() => onUpdateTextBox({ isWatermark: !textBoxAttrs.isWatermark })}
                >
                    <Droplet size={16} />
                    Watermark
                </button>
            </div>
        </div>
    );
};
