import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

export const EditorRuler = () => {
    const { ruler, page, setRulerState } = useEditorStore();
    const { showRuler, leftMargin, rightMargin, firstLineIndent, leftIndent } = ruler;
    const { width } = page;

    const [isDragging, setIsDragging] = useState<'leftMargin' | 'rightMargin' | 'firstLine' | 'leftIndent' | null>(null);
    const rulerRef = useRef<HTMLDivElement>(null);

    if (!showRuler) return null;

    const handleMouseDown = (type: 'leftMargin' | 'rightMargin' | 'firstLine' | 'leftIndent') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !rulerRef.current) return;

            const rect = rulerRef.current.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            // Clamp values to page width
            const x = Math.max(0, Math.min(relativeX, width));

            if (isDragging === 'leftMargin') {
                const newMargin = Math.max(0, Math.min(x, width - rightMargin - 100)); // Min 100px content width
                setRulerState({ leftMargin: newMargin });
            } else if (isDragging === 'rightMargin') {
                const newMargin = Math.max(0, Math.min(width - x, width - leftMargin - 100));
                setRulerState({ rightMargin: newMargin });
            } else if (isDragging === 'firstLine') {
                // Relative to left margin
                const newIndent = x - leftMargin;
                setRulerState({ firstLineIndent: newIndent });
            } else if (isDragging === 'leftIndent') {
                // Relative to left margin
                const newIndent = x - leftMargin;
                setRulerState({ leftIndent: newIndent });
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
    }, [isDragging, width, leftMargin, rightMargin, setRulerState]);

    // Generate ticks
    const renderTicks = () => {
        const ticks = [];

        for (let i = 0; i <= width; i += 12) { // 1/8th of an inch approx 12px at 96dpi
            const isInch = i % 96 === 0;
            const isHalfInch = i % 48 === 0;
            const height = isInch ? 12 : isHalfInch ? 8 : 4;

            ticks.push(
                <div
                    key={i}
                    className="absolute bottom-0 bg-gray-400 w-px"
                    style={{ left: i, height: `${height}px` }}
                />
            );

            if (isInch && i > 0 && i < width) {
                ticks.push(
                    <div key={`num-${i}`} className="absolute bottom-0 text-xs text-gray-600 font-medium transform -translate-x-1/2" style={{ left: i }}>
                        {i / 96}
                    </div>
                );
            }
        }
        return ticks;
    };

    return (
        <div className="h-6 bg-[#f8f9fa] border-b border-gray-200 flex relative select-none">
            {/* Horizontal Ruler Container - Centered to match canvas */}
            <div className="mx-auto relative" style={{ width: `${width}px` }} ref={rulerRef}>
                {/* White background for the printable area */}
                <div className="absolute inset-y-0 bg-white" style={{ left: leftMargin, right: rightMargin }} />

                {/* Ticks */}
                {renderTicks()}

                {/* Left Margin / Indent Controls */}
                <div
                    className="absolute top-0 cursor-ew-resize group z-20"
                    style={{ left: leftMargin + leftIndent }}
                    onMouseDown={handleMouseDown('leftIndent')}
                >
                    {/* Left Indent Marker (Triangle pointing up) */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-blue-500 relative top-3" />
                </div>

                {/* Left Margin Marker (Rectangle) */}
                <div
                    className="absolute top-0 cursor-ew-resize group z-20"
                    style={{ left: leftMargin }}
                    onMouseDown={handleMouseDown('leftMargin')}
                >
                    <div className="w-3 h-2 bg-blue-500 relative top-6" />
                </div>

                {/* First Line Indent (Triangle pointing down) */}
                <div
                    className="absolute top-0 cursor-ew-resize z-10"
                    style={{ left: leftMargin + firstLineIndent }}
                    onMouseDown={handleMouseDown('firstLine')}
                >
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-500" />
                </div>


                {/* Right Margin Control */}
                <div
                    className="absolute top-0 cursor-ew-resize z-10"
                    style={{ right: rightMargin }}
                    onMouseDown={handleMouseDown('rightMargin')}
                >
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-500" />
                </div>
            </div>
        </div>
    );
};
