import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import type { CollageTemplate, CollageStyle } from '../../types/collage';
import type { GridCell, CellImage } from '../../types/crop';
import { CollageCell } from './CollageCell.tsx';
import { ImageCropper } from './ImageCropper.tsx';

interface KonvaCollageCanvasProps {
    template: CollageTemplate;
    style: CollageStyle;
    placedImages: { [key: number]: string };
    onRemoveImage: (index: number) => void;
    onDropImage: (index: number, dataString: string) => void;
    canvasRef: React.RefObject<any>;
    gridSettings: { rows: number; cols: number; rowWeights: number[]; colWeights: number[] };
    onGridSettingChange?: (type: 'row' | 'col', indexOrUpdates: number | { index: number, value: number }[], value?: number) => void;
    cellImages: { [key: number]: CellImage };
    onCropChange: (index: number, cropData: any) => void;
    activeCell: number | null;
    onSetActiveCell: (index: number | null) => void;
    cellSpans: { [key: number]: { rowSpan: number; colSpan: number } };
    onCellSpanChange: (spans: { [key: number]: { rowSpan: number; colSpan: number } }) => void;
    cellPositions: { [key: number]: { row: number; col: number; rowSpan: number; colSpan: number } };
    onCellPositionChange: (positions: { [key: number]: { row: number; col: number; rowSpan: number; colSpan: number } }) => void;
}

export const KonvaCollageCanvas: React.FC<KonvaCollageCanvasProps> = ({
    style,
    placedImages,
    onRemoveImage,
    onDropImage,
    canvasRef,
    gridSettings,
    onGridSettingChange,
    cellImages,
    onCropChange,
    activeCell,
    onSetActiveCell,
    cellSpans,
    onCellSpanChange,
    cellPositions,
    onCellPositionChange,
}) => {
    const stageRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stageDimensions, setStageDimensions] = useState({ width: 600, height: 600 });
    const [dragging, setDragging] = useState<{
        type: 'row' | 'col',
        index: number,
        start: number,
        initialWeight1: number,
        initialWeight2: number
    } | null>(null);

    // State for cell resize dragging
    const [resizing, setResizing] = useState<{
        cellIndex: number;
        edge: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        startX: number;
        startY: number;
        startSpan: { rowSpan: number; colSpan: number };
        startPosition: { row: number, col: number, rowSpan: number, colSpan: number };
    } | null>(null);


    // Handle resize dragging
    useEffect(() => {
        if (!dragging || !gridSettings || !onGridSettingChange) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { type, index, start, initialWeight1, initialWeight2 } = dragging;
            const deltaPx = type === 'col' ? e.clientX - start : e.clientY - start;

            const totalSize = type === 'col' ? stageDimensions.width - (style.padding * 2) : stageDimensions.height - (style.padding * 2);
            const totalWeight = type === 'col'
                ? gridSettings.colWeights.reduce((a, b) => a + b, 0)
                : gridSettings.rowWeights.reduce((a, b) => a + b, 0);

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
    }, [dragging, gridSettings, onGridSettingChange, style.padding, stageDimensions]);

    // Handle cell resize dragging - now updates positions for true directional expansion
    useEffect(() => {
        if (!resizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { cellIndex, edge, startX, startY, startPosition } = resizing;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            // Calculate how many grid cells to span based on drag distance
            const cellWidth = stageDimensions.width / gridSettings.cols;
            const cellHeight = stageDimensions.height / gridSettings.rows;

            // Use START position as base for calculations to avoid infinite loop
            const currentPos = startPosition;
            if (!currentPos) return;

            // Check if a proposed span collides with any OTHER cell that has an image
            const checkCollision = (r: number, c: number, rs: number, cs: number) => {
                for (const [idxStr, pos] of Object.entries(cellPositions)) {
                    const idx = parseInt(idxStr);
                    if (idx === cellIndex) continue; // Skip self

                    // Only check collision with cells that HAVE images
                    // "Smart expansion": Only blocked by occupied cells
                    if (!cellImages[idx]) continue;

                    // Check overlap
                    // Rect A: [c, r] to [c+cs, r+rs]
                    // Rect B: [pos.col, pos.row] to [pos.col+pos.colSpan, pos.row+pos.rowSpan]
                    const overlapX = Math.max(0, Math.min(c + cs, pos.col + pos.colSpan) - Math.max(c, pos.col));
                    const overlapY = Math.max(0, Math.min(r + rs, pos.row + pos.rowSpan) - Math.max(r, pos.row));

                    if (overlapX > 0 && overlapY > 0) return true;
                }
                return false;
            };

            let newRow = currentPos.row;
            let newCol = currentPos.col;
            let newRowSpan = currentPos.rowSpan;
            let newColSpan = currentPos.colSpan;

            // Handle different edges - cascade updates to verify combined moves (like diagonal)
            if (edge.includes('right')) {
                const colsToAdd = Math.round(deltaX / cellWidth);
                const proposedColSpan = Math.max(1, currentPos.colSpan + colsToAdd);
                // Clamp to grid
                const maxColSpan = Math.min(proposedColSpan, gridSettings.cols - newCol);

                // Check if this expansion collides (using current vertical state)
                if (!checkCollision(newRow, newCol, newRowSpan, maxColSpan)) {
                    newColSpan = maxColSpan;
                }
            }
            if (edge.includes('left')) {
                const colsToAdd = Math.round(-deltaX / cellWidth);
                // Expanding left: decrease col, increase colSpan
                const proposedStartCol = Math.max(0, currentPos.col - colsToAdd);

                if (proposedStartCol !== newCol) {
                    const proposedColSpan = currentPos.colSpan + (currentPos.col - proposedStartCol);
                    // Check collision
                    if (!checkCollision(newRow, proposedStartCol, newRowSpan, proposedColSpan)) {
                        newCol = proposedStartCol;
                        newColSpan = proposedColSpan;
                    }
                }
            }
            if (edge.includes('bottom')) {
                const rowsToAdd = Math.round(deltaY / cellHeight);
                const proposedRowSpan = Math.max(1, currentPos.rowSpan + rowsToAdd);
                const maxRowSpan = Math.min(proposedRowSpan, gridSettings.rows - newRow);

                // Check collision (USING UPDATED newCol/newColSpan from previous blocks)
                if (!checkCollision(newRow, newCol, maxRowSpan, newColSpan)) {
                    newRowSpan = maxRowSpan;
                }
            }
            if (edge.includes('top')) {
                const rowsToAdd = Math.round(-deltaY / cellHeight);
                // Expanding up: decrease row, increase rowSpan
                const proposedStartRow = Math.max(0, currentPos.row - rowsToAdd);

                if (proposedStartRow !== newRow) {
                    const proposedRowSpan = currentPos.rowSpan + (currentPos.row - proposedStartRow);
                    // Check collision
                    if (!checkCollision(proposedStartRow, newCol, proposedRowSpan, newColSpan)) {
                        newRow = proposedStartRow;
                        newRowSpan = proposedRowSpan;
                    }
                }
            }

            // Update cell position if changed
            // NOTE: We check against current live cellPositions to avoid redundant updates, 
            // but the CALCULATION is based on startPosition.
            const livePos = cellPositions[cellIndex];
            if (livePos && (newRow !== livePos.row || newCol !== livePos.col ||
                newRowSpan !== livePos.rowSpan || newColSpan !== livePos.colSpan)) {

                const newPositions = { ...cellPositions };
                newPositions[cellIndex] = {
                    row: newRow,
                    col: newCol,
                    rowSpan: Math.max(1, newRowSpan),
                    colSpan: Math.max(1, newColSpan),
                };
                onCellPositionChange(newPositions);

                // Also update cellSpans for backward compatibility
                const newSpans = { ...cellSpans };
                newSpans[cellIndex] = {
                    rowSpan: Math.max(1, newRowSpan),
                    colSpan: Math.max(1, newColSpan)
                };
                onCellSpanChange(newSpans);
            }
        };

        const handleMouseUp = () => {
            setResizing(null);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing, gridSettings, cellPositions, cellSpans, onCellPositionChange, onCellSpanChange, stageDimensions]);


    const handleMouseDown = (e: React.MouseEvent, type: 'row' | 'col', index: number) => {
        e.stopPropagation();
        e.preventDefault();
        if (!gridSettings) return;

        const weights = type === 'col' ? gridSettings.colWeights : gridSettings.rowWeights;
        setDragging({
            type,
            index,
            start: type === 'col' ? e.clientX : e.clientY,
            initialWeight1: weights[index],
            initialWeight2: weights[index + 1]
        });
    };

    // Drag and drop handlers
    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        onDropImage(index, data);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleCellDragStart = (e: React.DragEvent, index: number) => {
        const data = JSON.stringify({ type: 'cell', index });
        e.dataTransfer.setData('text/plain', data);
    };

    // Calculate stage dimensions based on aspect ratio
    useEffect(() => {
        const width = 600;
        const height = style.aspectRatio ? width / style.aspectRatio : 600;
        setStageDimensions({ width, height });
    }, [style.aspectRatio]);

    // Expose stage ref to parent for export
    useEffect(() => {
        if (canvasRef && stageRef.current) {
            (canvasRef as any).current = stageRef.current;
        }
    }, [canvasRef]);

    // Calculate grid cells using explicit positions
    const calculateGridCells = (): GridCell[] => {
        const cells: GridCell[] = [];
        const { rows, cols, rowWeights, colWeights } = gridSettings;
        const padding = style.padding;
        const gap = style.gap;

        const totalColWeight = colWeights.reduce((a, b) => a + b, 0);
        const totalRowWeight = rowWeights.reduce((a, b) => a + b, 0);

        const availableWidth = stageDimensions.width - (padding * 2) - (gap * (cols - 1));
        const availableHeight = stageDimensions.height - (padding * 2) - (gap * (rows - 1));

        // Iterate through cellPositions instead of sequential grid
        Object.entries(cellPositions).forEach(([indexStr, position]) => {
            const cellIndex = parseInt(indexStr);
            const { row, col, rowSpan, colSpan } = position;

            // Occlusion Check: If this cell has NO image, check if it is covered by a cell WITH an image
            if (!cellImages[cellIndex]) {
                let isObscured = false;
                for (const [otherIndexStr, otherPos] of Object.entries(cellPositions)) {
                    const otherIndex = parseInt(otherIndexStr);
                    if (otherIndex === cellIndex) continue;

                    // Only care if the *other* cell has an image (so it's opaque)
                    if (cellImages[otherIndex]) {
                        // Check intersection
                        const overlapX = Math.max(0, Math.min(col + colSpan, otherPos.col + otherPos.colSpan) - Math.max(col, otherPos.col));
                        const overlapY = Math.max(0, Math.min(row + rowSpan, otherPos.row + otherPos.rowSpan) - Math.max(row, otherPos.row));

                        // If obscured (even partially, but let's assume significant overlap or containment?)
                        // For "clean" grid, usually full containment or identity. 
                        // Let's assume ANY overlap by an Image Cell should hide the Empty Cell to prevent z-fighting/blocking.
                        if (overlapX > 0 && overlapY > 0) {
                            isObscured = true;
                            break;
                        }
                    }
                }
                if (isObscured) return; // Skip adding this cell (it's hidden)
            }

            // Calculate width based on colSpan
            let cellWidth = 0;
            for (let c = col; c < Math.min(col + colSpan, cols); c++) {
                cellWidth += (availableWidth * colWeights[c]) / totalColWeight;
                if (c > col) cellWidth += gap;
            }

            // Calculate height based on rowSpan
            let cellHeight = 0;
            for (let r = row; r < Math.min(row + rowSpan, rows); r++) {
                cellHeight += (availableHeight * rowWeights[r]) / totalRowWeight;
                if (r > row) cellHeight += gap;
            }

            // Calculate x position
            let x = padding;
            for (let c = 0; c < col; c++) {
                x += (availableWidth * colWeights[c]) / totalColWeight + gap;
            }

            // Calculate y position
            let y = padding;
            for (let r = 0; r < row; r++) {
                y += (availableHeight * rowWeights[r]) / totalRowWeight + gap;
            }

            cells.push({
                index: cellIndex,
                x,
                y,
                width: cellWidth,
                height: cellHeight,
                image: cellImages[cellIndex],
            });
        });

        // Sort cells by index to maintain consistent rendering order
        return cells.sort((a, b) => a.index - b.index);
    };

    const cells = calculateGridCells();

    return (
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 overflow-auto" ref={containerRef}>
            <div
                className="relative bg-white shadow-2xl"
                style={{
                    width: `${stageDimensions.width}px`,
                    height: `${stageDimensions.height}px`,
                }}
            >
                <Stage
                    ref={stageRef}
                    width={stageDimensions.width}
                    height={stageDimensions.height}
                >
                    <Layer>
                        {/* Background */}
                        <Rect
                            x={0}
                            y={0}
                            width={stageDimensions.width}
                            height={stageDimensions.height}
                            fill={style.backgroundColor}
                        />

                        {/* Grid cells */}
                        {cells.map((cell) => (
                            <CollageCell
                                key={cell.index}
                                cell={cell}
                                style={style}
                                isActive={activeCell === cell.index}
                                onSetActive={() => onSetActiveCell(cell.index)}
                            />
                        ))}
                    </Layer>
                </Stage>

                {/* Resize Handles Overlay - COMMENTED OUT */}
                {/* 
                {gridSettings && onGridSettingChange && (
                    <div className="absolute inset-0 pointer-events-none">
                        {gridSettings.colWeights.slice(0, -1).map((_, colIndex) => {
                            const { rows, cols, colWeights } = gridSettings;
                            const totalColWeight = colWeights.reduce((a, b) => a + b, 0);
                            const availableWidth = stageDimensions.width - (style.padding * 2) - (style.gap * (cols - 1));

                            let x = style.padding;
                            for (let c = 0; c <= colIndex; c++) {
                                x += (availableWidth * colWeights[c]) / totalColWeight;
                                if (c < colIndex) x += style.gap;
                            }

                            return (
                                <div
                                    key={`col-handle-${colIndex}`}
                                    className="resize-handle absolute cursor-col-resize pointer-events-auto hover:bg-indigo-500/50 transition-colors bg-indigo-500/20"
                                    style={{
                                        left: `${x}px`,
                                        top: `${style.padding}px`,
                                        width: `${style.gap}px`,
                                        height: `${stageDimensions.height - style.padding * 2}px`,
                                        zIndex: 30,
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'col', colIndex)}
                                    title="Drag to resize column"
                                />
                            );
                        })}

                        {gridSettings.rowWeights.slice(0, -1).map((_, rowIndex) => {
                            const { rows, cols, rowWeights } = gridSettings;
                            const totalRowWeight = rowWeights.reduce((a, b) => a + b, 0);
                            const availableHeight = stageDimensions.height - (style.padding * 2) - (style.gap * (rows - 1));

                            let y = style.padding;
                            for (let r = 0; r <= rowIndex; r++) {
                                y += (availableHeight * rowWeights[r]) / totalRowWeight;
                                if (r < rowIndex) y += style.gap;
                            }

                            return (
                                <div
                                    key={`row-handle-${rowIndex}`}
                                    className="resize-handle absolute cursor-row-resize pointer-events-auto hover:bg-indigo-500/50 transition-colors bg-indigo-500/20"
                                    style={{
                                        left: `${style.padding}px`,
                                        top: `${y}px`,
                                        width: `${stageDimensions.width - style.padding * 2}px`,
                                        height: `${style.gap}px`,
                                        zIndex: 30,
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, 'row', rowIndex)}
                                    title="Drag to resize row"
                                />
                            );
                        })}
                    </div>
                )}
                */}

                {/* Crop UI overlays */}
                {cells.map((cell) => (
                    cell.image && activeCell === cell.index && (
                        <div
                            key={`crop-${cell.index}`}
                            className="absolute"
                            style={{
                                left: `${cell.x}px`,
                                top: `${cell.y}px`,
                                width: `${cell.width}px`,
                                height: `${cell.height}px`,
                                pointerEvents: 'auto',
                                zIndex: 50,
                            }}
                        >
                            <ImageCropper
                                imageUrl={cell.image.url}
                                cellWidth={cell.width}
                                cellHeight={cell.height}
                                onCropChange={(cropData) => onCropChange(cell.index, cropData)}
                                onComplete={() => onSetActiveCell(null)}
                            />
                        </div>
                    )
                ))}

                {/* Drag and Drop Zones */}
                {cells.map((cell) => (
                    activeCell !== cell.index && (
                        <div
                            key={`drop-zone-${cell.index}`}
                            className="absolute transition-all"
                            draggable={!!cell.image}
                            onDragStart={(e) => cell.image && handleCellDragStart(e, cell.index)}
                            onDrop={(e) => handleDrop(e, cell.index)}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) => {
                                e.currentTarget.style.outline = '3px dashed #6366f1';
                                e.currentTarget.style.outlineOffset = '-3px';
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.style.outline = 'none';
                            }}
                            style={{
                                left: `${cell.x}px`,
                                top: `${cell.y}px`,
                                width: `${cell.width}px`,
                                height: `${cell.height}px`,
                                pointerEvents: 'auto',
                                cursor: cell.image ? 'grab' : 'default',
                                zIndex: 15,
                            }}
                        />
                    )
                ))}

                {/* Edit/Remove buttons overlay */}
                {cells.map((cell) => {
                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };

                    return cell.image && activeCell !== cell.index && (
                        <div
                            key={`buttons-${cell.index}`}
                            className="absolute group"
                            style={{
                                left: `${cell.x}px`,
                                top: `${cell.y}px`,
                                width: `${cell.width}px`,
                                height: `${cell.height}px`,
                                pointerEvents: 'none',
                                zIndex: 20,
                            }}
                        >
                            {/* Top-right: Edit/Remove buttons */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                <button
                                    onClick={() => onSetActiveCell(cell.index)}
                                    className="bg-white/90 text-slate-700 p-1.5 rounded-full hover:bg-indigo-100 hover:text-indigo-600 shadow-sm"
                                    title="Edit/Crop"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => onRemoveImage(cell.index)}
                                    className="bg-white/90 text-slate-700 p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 shadow-sm"
                                    title="Remove"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>

                            {/* Bottom-right: Span controls */}
                            <div className="absolute bottom-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                {/* Width controls */}
                                <div className="flex gap-1 bg-white/90 rounded-full p-1 shadow-sm">
                                    <button
                                        onClick={() => {
                                            const newSpans = { ...cellSpans };
                                            newSpans[cell.index] = { ...span, colSpan: Math.max(1, span.colSpan - 1) };
                                            onCellSpanChange(newSpans);
                                        }}
                                        className="text-slate-700 px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                                        title="Decrease width"
                                        disabled={span.colSpan <= 1}
                                    >
                                        W-
                                    </button>
                                    <span className="text-xs text-slate-600 px-1">{span.colSpan}</span>
                                    <button
                                        onClick={() => {
                                            const newSpans = { ...cellSpans };
                                            newSpans[cell.index] = { ...span, colSpan: Math.min(gridSettings.cols, span.colSpan + 1) };
                                            onCellSpanChange(newSpans);
                                        }}
                                        className="text-slate-700 px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                                        title="Increase width"
                                        disabled={span.colSpan >= gridSettings.cols}
                                    >
                                        W+
                                    </button>
                                </div>
                                {/* Height controls */}
                                <div className="flex gap-1 bg-white/90 rounded-full p-1 shadow-sm">
                                    <button
                                        onClick={() => {
                                            const newSpans = { ...cellSpans };
                                            newSpans[cell.index] = { ...span, rowSpan: Math.max(1, span.rowSpan - 1) };
                                            onCellSpanChange(newSpans);
                                        }}
                                        className="text-slate-700 px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                                        title="Decrease height"
                                        disabled={span.rowSpan <= 1}
                                    >
                                        H-
                                    </button>
                                    <span className="text-xs text-slate-600 px-1">{span.rowSpan}</span>
                                    <button
                                        onClick={() => {
                                            const newSpans = { ...cellSpans };
                                            newSpans[cell.index] = { ...span, rowSpan: Math.min(gridSettings.rows, span.rowSpan + 1) };
                                            onCellSpanChange(newSpans);
                                        }}
                                        className="text-slate-700 px-1.5 py-0.5 text-xs hover:bg-slate-100 rounded disabled:opacity-50"
                                        title="Increase height"
                                        disabled={span.rowSpan >= gridSettings.rows}
                                    >
                                        H+
                                    </button>
                                </div>
                            </div>

                            {/* Draggable Resize Handles */}
                            {/* Right edge */}
                            <div
                                className="absolute top-0 right-0 w-1 h-full cursor-ew-resize pointer-events-auto hover:bg-indigo-500/50 active:bg-indigo-600 transition-colors"
                                style={{ transform: 'translateX(50%)' }}
                                title="Drag to resize width →"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'right',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />

                            {/* Left edge */}
                            <div
                                className="absolute top-0 left-0 w-1 h-full cursor-ew-resize pointer-events-auto hover:bg-indigo-500/50 active:bg-indigo-600 transition-colors"
                                style={{ transform: 'translateX(-50%)' }}
                                title="Drag to resize width ←"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'left',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />

                            {/* Bottom edge */}
                            <div
                                className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize pointer-events-auto hover:bg-indigo-500/50 active:bg-indigo-600 transition-colors"
                                style={{ transform: 'translateY(50%)' }}
                                title="Drag to resize height ↓"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'bottom',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />

                            {/* Top edge */}
                            <div
                                className="absolute top-0 left-0 w-full h-1 cursor-ns-resize pointer-events-auto hover:bg-indigo-500/50 active:bg-indigo-600 transition-colors"
                                style={{ transform: 'translateY(-50%)' }}
                                title="Drag to resize height ↑"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'top',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />

                            {/* Corner handles - more visible */}
                            <div
                                className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize pointer-events-auto bg-indigo-500/70 hover:bg-indigo-600 rounded-full transition-all shadow-sm"
                                style={{ transform: 'translate(50%, -50%)' }}
                                title="Drag to resize corner ↗"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'top-right',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />
                            <div
                                className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize pointer-events-auto bg-indigo-500/70 hover:bg-indigo-600 rounded-full transition-all shadow-sm"
                                style={{ transform: 'translate(-50%, -50%)' }}
                                title="Drag to resize corner ↖"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'top-left',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />
                            <div
                                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize pointer-events-auto bg-indigo-500/70 hover:bg-indigo-600 rounded-full transition-all shadow-sm"
                                style={{ transform: 'translate(50%, 50%)' }}
                                title="Drag to resize corner ↘"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'bottom-right',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />
                            <div
                                className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize pointer-events-auto bg-indigo-500/70 hover:bg-indigo-600 rounded-full transition-all shadow-sm"
                                style={{ transform: 'translate(-50%, 50%)' }}
                                title="Drag to resize corner ↙"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const span = cellSpans[cell.index] || { rowSpan: 1, colSpan: 1 };
                                    setResizing({
                                        cellIndex: cell.index,
                                        edge: 'bottom-left',
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        startSpan: span,
                                        startPosition: cellPositions[cell.index],
                                    });
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
