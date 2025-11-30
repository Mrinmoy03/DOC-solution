import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

export const VerticalRuler = () => {
    const { ruler, page, setRulerState } = useEditorStore();
    const { showRuler, topMargin, bottomMargin } = ruler;
    const { height } = page;

    const [isDragging, setIsDragging] = useState<'topMargin' | 'bottomMargin' | null>(null);
    const rulerRef = useRef<HTMLDivElement>(null);

    if (!showRuler) return null;

    const handleMouseDown = (type: 'topMargin' | 'bottomMargin') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !rulerRef.current) return;

            const rect = rulerRef.current.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            const y = Math.max(0, Math.min(relativeY, height));

            if (isDragging === 'topMargin') {
                const newMargin = Math.max(0, Math.min(y, height - bottomMargin - 100));
                setRulerState({ topMargin: newMargin });
            } else if (isDragging === 'bottomMargin') {
                const newMargin = Math.max(0, Math.min(height - y, height - topMargin - 100));
                setRulerState({ bottomMargin: newMargin });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, height, topMargin, bottomMargin, setRulerState]);

    const renderTicks = () => {
        const ticks = [];
        for (let i = 0; i <= height; i += 12) {
            const isInch = i % 96 === 0;
            const width = isInch ? 12 : 4;

            ticks.push(
                <div
                    key={i}
                    className="absolute right-0 bg-gray-400 h-px"
                    style={{ top: i, width: `${width}px` }}
                />
            );

            if (isInch && i > 0 && i < height) {
                ticks.push(
                    <div key={`num-${i}`} className="absolute right-4 text-[10px] text-gray-500 transform -translate-y-1/2" style={{ top: i }}>
                        {i / 96}
                    </div>
                );
            }
        }
        return ticks;
    };

    return (
        <div className="w-6 bg-[#f8f9fa] border-r border-gray-200 relative select-none h-full flex-shrink-0">
            <div className="relative h-full mx-auto" style={{ height: `${height}px` }} ref={rulerRef}>
                {/* White background for printable area */}
                <div className="absolute inset-x-0 bg-white" style={{ top: topMargin, bottom: bottomMargin }} />

                {renderTicks()}

                {/* Top Margin Control */}
                <div
                    className="absolute left-0 w-full h-4 cursor-ns-resize bg-gray-400 opacity-0 hover:opacity-50"
                    style={{ top: topMargin - 4 }}
                    onMouseDown={handleMouseDown('topMargin')}
                />

                {/* Bottom Margin Control */}
                <div
                    className="absolute left-0 w-full h-4 cursor-ns-resize bg-gray-400 opacity-0 hover:opacity-50"
                    style={{ bottom: bottomMargin - 4 }}
                    onMouseDown={handleMouseDown('bottomMargin')}
                />
            </div>
        </div>
    );
};
