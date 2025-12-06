import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

export const ShapeNodeView = ({ node, updateAttributes, selected }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const shapeRef = useRef<HTMLDivElement>(null);

    const { type, width, height, x, y, rotation, fillColor, outlineColor, noFill, noOutline, imageUrl, text, textPosition } = node.attrs;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - x,
            y: e.clientY - y,
        });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updateAttributes({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragStart, updateAttributes]);

    const renderShape = () => {
        const fill = noFill ? 'none' : fillColor;
        const stroke = noOutline ? 'none' : outlineColor;

        switch (type) {
            case 'line':
                return (
                    <svg width={width} height={height || 2} style={{ display: 'block' }}>
                        <line
                            x1="0"
                            y1="1"
                            x2={width}
                            y2="1"
                            stroke={stroke}
                            strokeWidth="2"
                        />
                        {text && (
                            <text
                                x={width / 2}
                                y={textPosition === 'below' ? height - 5 : -5}
                                textAnchor="middle"
                                fill="#000"
                                fontSize="14"
                            >
                                {text}
                            </text>
                        )}
                    </svg>
                );
            case 'rectangle':
                return (
                    <svg width={width} height={height} style={{ display: 'block' }}>
                        <defs>
                            {imageUrl && (
                                <pattern id={`img-${node.attrs.id}`} patternUnits="userSpaceOnUse" width={width} height={height}>
                                    <image href={imageUrl} x="0" y="0" width={width} height={height} />
                                </pattern>
                            )}
                        </defs>
                        <rect
                            x="1"
                            y="1"
                            width={width - 2}
                            height={height - 2}
                            fill={imageUrl ? `url(#img-${node.attrs.id})` : fill}
                            stroke={stroke}
                            strokeWidth="2"
                        />
                        {text && !imageUrl && (
                            <text
                                x={width / 2}
                                y={height / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#000"
                                fontSize="14"
                            >
                                {text}
                            </text>
                        )}
                    </svg>
                );
            case 'circle':
                const radius = Math.min(width, height) / 2;
                return (
                    <svg width={width} height={height} style={{ display: 'block' }}>
                        <defs>
                            {imageUrl && (
                                <pattern id={`img-${node.attrs.id}`} patternUnits="userSpaceOnUse" width={width} height={height}>
                                    <image href={imageUrl} x="0" y="0" width={width} height={height} />
                                </pattern>
                            )}
                        </defs>
                        <circle
                            cx={width / 2}
                            cy={height / 2}
                            r={radius - 2}
                            fill={imageUrl ? `url(#img-${node.attrs.id})` : fill}
                            stroke={stroke}
                            strokeWidth="2"
                        />
                        {text && !imageUrl && (
                            <text
                                x={width / 2}
                                y={height / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#000"
                                fontSize="14"
                            >
                                {text}
                            </text>
                        )}
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <NodeViewWrapper
            as="div"
            className={`shape-node ${selected ? 'selected' : ''}`}
            style={{
                position: 'relative',
                display: 'inline-block',
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
                zIndex: node.attrs.zIndex || 1,
            }}
            ref={shapeRef}
            onMouseDown={handleMouseDown}
        >
            {renderShape()}
            {selected && (
                <>
                    {/* Resize handles */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -5,
                            bottom: -5,
                            width: 10,
                            height: 10,
                            background: '#4285F4',
                            cursor: 'nwse-resize',
                            borderRadius: '50%',
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizing(true);
                        }}
                    />
                    {/* Rotation handle */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 10,
                            height: 10,
                            background: '#34A853',
                            cursor: 'grab',
                            borderRadius: '50%',
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            // Rotation logic would go here
                        }}
                    />
                </>
            )}
        </NodeViewWrapper>
    );
};
