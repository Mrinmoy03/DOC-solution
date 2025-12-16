import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface DraggableColorPickerProps {
    onColorSelect: (color: string) => void;
    onStyleSelect?: (style: string) => void;
    onClose: () => void;
    title?: string;
    initialColor?: string;
    initialStyle?: string;
}

export const DraggableColorPicker = ({ onColorSelect, onStyleSelect, onClose, title = 'Select Color', initialColor, initialStyle }: DraggableColorPickerProps) => {
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hexInput, setHexInput] = useState(initialColor || '#000000');
    const toolbarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-header')) {
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
        '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
        '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    ];

    const styles = [
        { name: 'solid', label: 'Solid', css: 'solid' },
        { name: 'double', label: 'Double', css: 'double' },
        { name: 'dotted', label: 'Dotted', css: 'dotted' },
        { name: 'dashed', label: 'Dashed', css: 'dashed' },
        { name: 'wavy', label: 'Wavy', css: 'wavy' },
    ];

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHexInput(e.target.value);
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
            onColorSelect(e.target.value);
        }
    };

    return (
        <div
            ref={toolbarRef}
            className={`fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col w-64 overflow-hidden ${isDragging ? 'cursor-grabbing' : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="draggable-header bg-gray-100 border-b border-gray-300 px-3 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
                <span className="text-xs font-semibold text-gray-700">{title}</span>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                >
                    <X size={12} />
                </button>
            </div>

            <div className="p-3 flex flex-col gap-3">
                {/* Style Selector */}
                {onStyleSelect && (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1">Style</div>
                        <div className="flex gap-1 flex-wrap">
                            {styles.map(style => (
                                <button
                                    key={style.name}
                                    onClick={() => onStyleSelect(style.name)}
                                    className={`px-2 py-1 border rounded text-xs transition-colors relative h-8 min-w-[32px] ${initialStyle === style.name ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                    title={style.label}
                                >
                                    <div className="flex items-center justify-center">
                                        <span style={{ textDecoration: 'underline', textDecorationStyle: style.css as any, textDecorationColor: 'currentColor' }}>ABC</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Preset Grid */}
                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Color</div>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                        {colors.map(color => (
                            <div
                                key={color}
                                className={`w-8 h-8 cursor-pointer border border-gray-200 rounded hover:scale-110 hover:border-blue-400 transition-all duration-100 ${initialColor === color ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                    onColorSelect(color);
                                    setHexInput(color);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Advanced Color Input */}
                <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 flex-shrink-0">
                        <input
                            type="color"
                            value={hexInput.length === 7 ? hexInput : '#000000'}
                            onChange={(e) => {
                                const color = e.target.value;
                                setHexInput(color);
                                onColorSelect(color);
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                        <div
                            className="w-full h-full rounded border border-gray-300"
                            style={{ backgroundColor: hexInput.length === 7 ? hexInput : '#000000' }}
                        />
                    </div>
                    <input
                        type="text"
                        value={hexInput}
                        onChange={handleHexChange}
                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400 uppercase font-mono"
                        placeholder="#000000"
                    />
                </div>
            </div>
        </div>
    );
};
