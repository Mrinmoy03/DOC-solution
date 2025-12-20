import React from 'react';
import type { CollageStyle, CollageTemplate } from '../../types/collage';
import { X } from 'lucide-react';

interface CollageCanvasProps {
    template: CollageTemplate;
    style: CollageStyle;
    placedImages: { [key: number]: string };
    onDropImage: (index: number, url: string) => void;
    onRemoveImage: (index: number) => void;
    canvasRef: React.RefObject<HTMLDivElement>;
    gridSettings?: { rows: number; cols: number; rowWeights: number[]; colWeights: number[] };
    onGridSettingChange?: (type: 'row' | 'col', indexOrUpdates: number | { index: number, value: number }[], value?: number) => void;
}

export const CollageCanvas: React.FC<CollageCanvasProps> = ({
    template,
    style,
    placedImages,
    onDropImage,
    onRemoveImage,
    canvasRef,
    gridSettings,
    onGridSettingChange,
}) => {
    const [dragging, setDragging] = React.useState<{
        type: 'row' | 'col',
        index: number,
        start: number,
        initialWeight1: number,
        initialWeight2: number,
        factor: number
    } | null>(null);

    React.useEffect(() => {
        if (!dragging || !gridSettings || !onGridSettingChange || !canvasRef.current) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { type, index, start, initialWeight1, initialWeight2 } = dragging;
            const deltaPx = type === 'col' ? e.clientX - start : e.clientY - start;

            const container = canvasRef.current!;
            const rect = container.getBoundingClientRect();
            const paddedWidth = rect.width - (style.padding * 2);
            const paddedHeight = rect.height - (style.padding * 2);

            const totalSize = type === 'col' ? paddedWidth : paddedHeight;
            const totalWeight = type === 'col'
                ? gridSettings.colWeights.reduce((a, b) => a + b, 0)
                : gridSettings.rowWeights.reduce((a, b) => a + b, 0);

            // deltaFr = deltaPx * (totalWeight / totalSize)
            const deltaFr = deltaPx * (totalWeight / totalSize);

            const MIN_WEIGHT = 0.05;
            let newWeight1 = initialWeight1 + deltaFr;
            let newWeight2 = initialWeight2 - deltaFr;

            if (newWeight1 < MIN_WEIGHT) {
                newWeight1 = MIN_WEIGHT;
                newWeight2 = initialWeight1 + initialWeight2 - MIN_WEIGHT;
            } else if (newWeight2 < MIN_WEIGHT) {
                newWeight2 = MIN_WEIGHT;
                newWeight1 = initialWeight1 + initialWeight2 - MIN_WEIGHT;
            }

            onGridSettingChange(type, [
                { index: index, value: newWeight1 },
                { index: index + 1, value: newWeight2 }
            ]);
        };

        const handleMouseUp = () => {
            setDragging(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, gridSettings, onGridSettingChange, style.padding]);

    const handleMouseDown = (e: React.MouseEvent, type: 'row' | 'col', index: number) => {
        e.stopPropagation();
        e.preventDefault();
        if (!gridSettings || !canvasRef.current) return;

        const container = canvasRef.current;
        const rect = container.getBoundingClientRect();
        const paddedWidth = rect.width - (style.padding * 2);
        const paddedHeight = rect.height - (style.padding * 2);

        const totalSize = type === 'col' ? paddedWidth : paddedHeight;
        const totalWeight = type === 'col'
            ? gridSettings.colWeights.reduce((a, b) => a + b, 0)
            : gridSettings.rowWeights.reduce((a, b) => a + b, 0);

        const factor = totalWeight / totalSize;

        const weights = type === 'col' ? gridSettings.colWeights : gridSettings.rowWeights;
        setDragging({
            type,
            index,
            start: type === 'col' ? e.clientX : e.clientY,
            initialWeight1: weights[index],
            initialWeight2: weights[index + 1],
            factor
        });
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        if (data) {
            onDropImage(index, data);
        }
    };

    const handleCellDragStart = (e: React.DragEvent, index: number) => {
        const url = placedImages[index];
        if (url) {
            const data = JSON.stringify({ type: 'cell', index, url });
            e.dataTransfer.setData('text/plain', data);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-auto">
            <div
                ref={canvasRef}
                className="relative bg-white shadow-2xl transition-all duration-300"
                style={{
                    width: '600px',
                    height: style.aspectRatio ? `${600 / style.aspectRatio}px` : '600px',
                    padding: `${style.padding}px`,
                    backgroundColor: style.backgroundColor,
                }}
            >
                <div className="relative w-full h-full">
                    {/* Image Grid */}
                    <div
                        className="w-full h-full grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: template.gridTemplateColumns,
                            gridTemplateRows: template.gridTemplateRows,
                            gap: `${style.gap}px`,
                        }}
                    >
                        {Array.from({ length: template.cells }).map((_, index) => (
                            <div
                                key={index}
                                className={`relative bg-slate-50 overflow-hidden group hover:z-10 transition-all ${placedImages[index] ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                style={{
                                    borderRadius: `${style.borderRadius}px`,
                                    border: style.borderWidth > 0
                                        ? `${style.borderWidth}px solid ${style.borderColor}`
                                        : '2px dashed #e2e8f0'
                                }}
                                draggable={!!placedImages[index]}
                                onDragStart={(e) => handleCellDragStart(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragOver={handleDragOver}
                            >
                                {placedImages[index] ? (
                                    <>
                                        <img
                                            src={placedImages[index]}
                                            alt={`cell-${index}`}
                                            className="w-full h-full object-cover pointer-events-none"
                                        />
                                        <button
                                            onClick={() => onRemoveImage(index)}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-20 cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-slate-400 text-sm font-medium">Drop Image</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Resize Handles Overlay */}
                    {gridSettings && (
                        <div
                            className="absolute inset-0 grid pointer-events-none"
                            style={{
                                gridTemplateColumns: template.gridTemplateColumns,
                                gridTemplateRows: template.gridTemplateRows,
                                gap: `${style.gap}px`,
                            }}
                        >
                            {/* Vertical Handles (Cols) */}
                            {gridSettings.colWeights.slice(0, -1).map((_, i) => (
                                <div
                                    key={`h-col-${i}`}
                                    className="resize-handle group pointer-events-auto z-[100] flex justify-center items-center"
                                    style={{
                                        gridColumn: i + 1,
                                        gridRow: '1 / -1',
                                        width: '24px',
                                        cursor: 'col-resize',
                                        justifySelf: 'end',
                                        transform: `translateX(calc(50% + ${style.gap / 2}px))`,
                                        height: '100%'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'col', i)}
                                >
                                    {/* Visual Line */}
                                    <div className="w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm" />
                                </div>
                            ))}
                            {/* Horizontal Handles (Rows) */}
                            {gridSettings.rowWeights.slice(0, -1).map((_, i) => (
                                <div
                                    key={`h-row-${i}`}
                                    className="resize-handle group pointer-events-auto z-[100] flex justify-center items-center"
                                    style={{
                                        gridRow: i + 1,
                                        gridColumn: '1 / -1',
                                        height: '24px',
                                        cursor: 'row-resize',
                                        alignSelf: 'end',
                                        transform: `translateY(calc(50% + ${style.gap / 2}px))`,
                                        width: '100%'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'row', i)}
                                >
                                    {/* Visual Line */}
                                    <div className="h-1 w-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
