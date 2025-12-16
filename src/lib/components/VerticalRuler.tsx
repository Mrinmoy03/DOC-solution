import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

export const VerticalRuler = () => {
    const { ruler, page, totalPages, pageMargins, setPageMargins } = useEditorStore();
    const { showRuler, topMargin: globalTop, bottomMargin: globalBottom } = ruler;
    const { height } = page;

    // Track which page index we are dragging on to calculate relative offset
    const [dragState, setDragState] = useState<{ type: 'topMargin' | 'bottomMargin', pageIndex: number } | null>(null);
    const rulerRef = useRef<HTMLDivElement>(null);
    const GAP_SIZE = 20;

    if (!showRuler) return null;

    const handleMouseDown = (type: 'topMargin' | 'bottomMargin', pageIndex: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState({ type, pageIndex });
    };

    // Use refs to access latest state in event handlers without triggering re-effects
    const stateRef = useRef({ pageMargins, height, globalTop, globalBottom, rulerRef });
    stateRef.current = { pageMargins, height, globalTop, globalBottom, rulerRef };

    useEffect(() => {
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState || !stateRef.current.rulerRef.current) return;
            const { rulerRef } = stateRef.current;
            if (!rulerRef.current) return;

            // Cancel any pending frame to avoid stacking
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            animationFrameId = requestAnimationFrame(() => {
                const { pageMargins, height, globalTop, globalBottom } = stateRef.current;
                const rect = rulerRef.current!.getBoundingClientRect();
                const globalRelY = e.clientY - rect.top;
                const pageOffsetY = dragState.pageIndex * (height + GAP_SIZE);
                const localY = globalRelY - pageOffsetY;
                const y = Math.max(0, Math.min(localY, height));

                const currentMargins = pageMargins[dragState.pageIndex] || {};
                const currentTop = currentMargins.top ?? globalTop;
                const currentBottom = currentMargins.bottom ?? globalBottom;

                if (dragState.type === 'topMargin') {
                    const newMargin = Math.max(0, Math.min(y, height - currentBottom - 100));
                    setPageMargins(dragState.pageIndex, { top: newMargin });
                } else if (dragState.type === 'bottomMargin') {
                    const newMargin = Math.max(0, Math.min(height - y, height - currentTop - 100));
                    setPageMargins(dragState.pageIndex, { bottom: newMargin });
                }
            });
        };

        const handleMouseUp = () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            setDragState(null);
        };

        if (dragState) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, setPageMargins]);

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
        <div className="flex flex-col bg-transparent select-none flex-shrink-0 relative" style={{ gap: `${GAP_SIZE}px` }} ref={rulerRef}>
            {Array.from({ length: totalPages }).map((_, index) => {
                const customMargins = pageMargins[index] || {};
                const topMargin = customMargins.top ?? globalTop;
                const bottomMargin = customMargins.bottom ?? globalBottom;

                return (
                    <div
                        key={index}
                        className="w-6 bg-[#f8f9fa] border-r border-gray-200 relative"
                        style={{ height: `${height}px` }}
                    >
                        {/* White background for printable area */}
                        <div className="absolute inset-x-0 bg-white" style={{ top: topMargin, bottom: bottomMargin }} />

                        {renderTicks()}

                        {/* Top Margin Control */}
                        <div
                            className="absolute left-0 w-full h-4 cursor-ns-resize z-50 group"
                            style={{ top: topMargin - 4 }}
                            onMouseDown={handleMouseDown('topMargin', index)}
                            title={`Top Margin (Page ${index + 1})`}
                        >
                            <div className="w-full h-[1px] bg-gray-400 absolute top-[4px] group-hover:bg-blue-500" />
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-500 absolute -right-[6px] top-[4px] rotate-90 group-hover:border-t-blue-500" />
                        </div>

                        {/* Bottom Margin Control */}
                        <div
                            className="absolute left-0 w-full h-4 cursor-ns-resize z-50 group"
                            style={{ bottom: bottomMargin - 4 }}
                            onMouseDown={handleMouseDown('bottomMargin', index)}
                            title={`Bottom Margin (Page ${index + 1})`}
                        >
                            <div className="w-full h-[1px] bg-gray-400 absolute bottom-[4px] group-hover:bg-blue-500" />
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-500 absolute -right-[6px] bottom-[4px] rotate-90 group-hover:border-b-blue-500" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
