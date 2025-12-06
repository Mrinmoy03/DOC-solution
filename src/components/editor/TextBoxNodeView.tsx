import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

export const TextBoxNodeView = ({ node, updateAttributes, selected }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
    const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0 });
    const textboxRef = useRef<HTMLDivElement>(null);

    const {
        width,
        height,
        x,
        y,
        rotation,
        fillColor,
        outlineColor,
        noFill,
        noOutline,
        zIndex,
        shadowColor,
        shadowEnabled,
        reflectionEnabled,
        threeDEnabled,
        isWatermark,
        watermarkSize,
        watermarkRotation,
    } = node.attrs;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest('.textbox-content')) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - x,
            y: e.clientY - y,
        });
        e.preventDefault();
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({
            width,
            height,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRotating(true);
        if (textboxRef.current) {
            const rect = textboxRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            setRotationStart({
                angle: rotation || 0,
                centerX,
                centerY,
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                updateAttributes({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            } else if (isResizing) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;
                updateAttributes({
                    width: Math.max(100, resizeStart.width + deltaX),
                    height: Math.max(50, resizeStart.height + deltaY),
                });
            } else if (isRotating) {
                const deltaX = e.clientX - rotationStart.centerX;
                const deltaY = e.clientY - rotationStart.centerY;
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
                updateAttributes({
                    rotation: Math.round(angle),
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setIsRotating(false);
        };

        if (isDragging || isResizing || isRotating) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, isRotating, dragStart, resizeStart, rotationStart, updateAttributes]);

    const getClassNames = () => {
        const classes = ['textbox-node'];
        if (selected) classes.push('selected');
        if (isWatermark) classes.push('watermark');
        if (shadowEnabled) classes.push('shadow');
        if (reflectionEnabled) classes.push('reflection');
        if (threeDEnabled) classes.push('three-d');
        return classes.join(' ');
    };

    const getStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
            backgroundColor: noFill ? 'transparent' : fillColor,
            borderColor: noOutline ? 'transparent' : outlineColor,
            borderWidth: noOutline ? 0 : '1px',
            borderStyle: 'solid',
            zIndex: zIndex || 1,
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
        };

        // Add watermark styles to container
        if (isWatermark) {
            baseStyles.opacity = 0.3;
            baseStyles.pointerEvents = 'none';
        }

        return baseStyles;
    };

    const getTextContentStyles = (): React.CSSProperties => {
        const textStyles: React.CSSProperties = {
            transition: 'all 0.3s ease',
        };

        // Apply watermark size and rotation to text
        if (isWatermark) {
            textStyles.fontSize = `${(watermarkSize || 100) / 100}em`;
            textStyles.fontWeight = 'bold';
            textStyles.transform = `rotate(${watermarkRotation || 0}deg)`;
            textStyles.display = 'inline-block';
        }

        // Apply shadow effect to text
        if (shadowEnabled) {
            textStyles.textShadow = `2px 2px 4px ${shadowColor}`;
        }

        // Apply reflection effect to text
        if (reflectionEnabled) {
            textStyles.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))';
        }

        // Apply 3D effect to text (overrides shadow if both enabled)
        if (threeDEnabled) {
            textStyles.textShadow = `
                1px 1px 0 ${shadowColor || '#ccc'},
                2px 2px 0 ${shadowColor || '#bbb'},
                3px 3px 0 ${shadowColor || '#aaa'},
                4px 4px 0 ${shadowColor || '#999'},
                5px 5px 0 ${shadowColor || '#888'}
            `;
        }

        return textStyles;
    };

    return (
        <NodeViewWrapper
            as="div"
            className={getClassNames()}
            style={getStyles()}
            ref={textboxRef}
            onMouseDown={handleMouseDown}
        >
            <div className="textbox-content" style={getTextContentStyles()} contentEditable suppressContentEditableWarning>
                <NodeViewContent />
            </div>
            {selected && (
                <>
                    {/* Resize handle */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -5,
                            bottom: -5,
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'nwse-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart}
                    />
                    {/* Rotation handle */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -25,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            background: '#34A853',
                            cursor: 'grab',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleRotateStart}
                    />
                    {/* Rotation line */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -25,
                            left: '50%',
                            width: '2px',
                            height: '25px',
                            background: '#34A853',
                            transformOrigin: 'bottom',
                        }}
                    />
                </>
            )}
        </NodeViewWrapper>
    );
};
