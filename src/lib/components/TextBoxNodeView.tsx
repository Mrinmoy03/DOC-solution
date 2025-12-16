import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useRef, useEffect } from 'react';

export const TextBoxNodeView = ({ node, updateAttributes, selected, editor, getPos }: any) => {
    const interactionState = useRef({
        isDragging: false,
        isResizing: false,
        isRotating: false,
        resizeDirection: '',
        dragStart: { x: 0, y: 0 },
        resizeStart: { width: 0, height: 0, x: 0, y: 0, posX: 0, posY: 0 },
        rotationStart: { angle: 0, centerX: 0, centerY: 0 },
    });
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
        shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity, shadowSpread, shadowInset,
        reflectionOffset, reflectionOpacity, reflectionSize, reflectionColor,
        threeDDepth, threeDRotateX, threeDRotateY, threeDColor, threeDExtrusion,
        // Text Effects
        textShadowEnabled, textShadowColor, textShadowBlur, textShadowOpacity, textShadowOffsetX, textShadowOffsetY,
        textReflectionEnabled, textReflectionOffset, textReflectionOpacity, textReflectionSize, textReflectionColor,
        textThreeDEnabled, textThreeDDepth, textThreeDExtrusion, textThreeDColor, textThreeDRotateX, textThreeDRotateY
    } = node.attrs;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!interactionState.current.isDragging && !interactionState.current.isResizing && !interactionState.current.isRotating) return;

            if (interactionState.current.isDragging) {
                const dx = e.clientX - interactionState.current.dragStart.x;
                const dy = e.clientY - interactionState.current.dragStart.y;
                updateAttributes({ x: dx, y: dy });
            } else if (interactionState.current.isResizing) {
                const { width: startWidth, height: startHeight, x: startX, y: startY, posX, posY } = interactionState.current.resizeStart;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                const direction = interactionState.current.resizeDirection;

                let newWidth = startWidth;
                let newHeight = startHeight;
                let newX = posX;
                let newY = posY;

                if (direction.includes('e')) newWidth = Math.max(50, startWidth + dx);
                if (direction.includes('w')) {
                    newWidth = Math.max(50, startWidth - dx);
                    newX = posX + (startWidth - newWidth);
                }
                if (direction.includes('s')) newHeight = Math.max(30, startHeight + dy);
                if (direction.includes('n')) {
                    newHeight = Math.max(30, startHeight - dy);
                    newY = posY + (startHeight - newHeight);
                }

                updateAttributes({ width: newWidth, height: newHeight, x: newX, y: newY });
            } else if (interactionState.current.isRotating) {
                const { centerX, centerY, angle } = interactionState.current.rotationStart;
                const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                let rotationDiff = currentAngle - angle;
                let newRotation = (rotation + rotationDiff) % 360;

                if (e.shiftKey) {
                    newRotation = Math.round(newRotation / 15) * 15;
                }

                updateAttributes({ rotation: newRotation });
            }
        };

        const handleMouseUp = () => {
            interactionState.current.isDragging = false;
            interactionState.current.isResizing = false;
            interactionState.current.isRotating = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [updateAttributes, x, y, width, height, rotation]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('.textbox-content')) return;
        e.preventDefault();
        e.stopPropagation();

        // Select the node
        if (typeof getPos === 'function') {
            editor.commands.setNodeSelection(getPos());
        }

        interactionState.current.isDragging = true;
        interactionState.current.dragStart = {
            x: e.clientX - x,
            y: e.clientY - y,
        };
    };

    const handleResizeStart = (direction: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        interactionState.current.isResizing = true;
        interactionState.current.resizeDirection = direction;
        interactionState.current.resizeStart = {
            width,
            height,
            x: e.clientX,
            y: e.clientY,
            posX: x,
            posY: y,
        };
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!textboxRef.current) return;

        const rect = textboxRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        interactionState.current.isRotating = true;
        interactionState.current.rotationStart = {
            angle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI),
            centerX,
            centerY,
        };
    };

    const getClassNames = () => {
        return `textbox-node ${selected ? 'selected' : ''}`;
    };

    const getWrapperStyles = (): React.CSSProperties => {
        return {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            transform: `rotate(${rotation}deg)`,
            zIndex: zIndex,
            // Visual styles moved to inner background div
            boxSizing: 'border-box',
        };
    };

    const getBackgroundStyles = (): React.CSSProperties => {
        const styles: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: noFill ? 'transparent' : fillColor,
            border: noOutline ? 'none' : `2px solid ${outlineColor}`,
            boxSizing: 'border-box',
            pointerEvents: 'none', // Allow clicks to pass through to content/wrapper
        };

        if (shadowEnabled) {
            styles.boxShadow = `${shadowOffsetX || 4}px ${shadowOffsetY || 4}px ${shadowBlur || 4}px ${shadowSpread || 0}px ${hexToRgba(shadowColor || '#000000', shadowOpacity || 0.4)} ${shadowInset ? 'inset' : ''}`;
        }

        if (reflectionEnabled) {
            const color = hexToRgba(reflectionColor || '#000000', reflectionOpacity || 0.4);
            styles.WebkitBoxReflect = `below ${reflectionOffset || 0}px linear-gradient(to bottom, ${color}, transparent ${Math.round((reflectionSize || 0.5) * 100)}%)`;
        }

        if (threeDEnabled) {
            const extrusion = threeDExtrusion || 5;
            const step = extrusion > 10 ? 2 : 1;
            const shadows = [];
            for (let i = 1; i <= extrusion; i += step) {
                shadows.push(`${i}px ${i}px 0 ${threeDColor || '#cccccc'}`);
            }
            styles.boxShadow = shadows.join(', ');
            styles.transform = `${styles.transform || ''} perspective(${threeDDepth || 600}px) rotateX(${threeDRotateX || 0}deg) rotateY(${threeDRotateY || 0}deg)`;
        }

        return styles;
    };

    const getTextContentStyles = (): React.CSSProperties => {
        const textStyles: React.CSSProperties = {
            position: 'relative', // Ensure it stacks above background
            transition: 'all 0.3s ease',
            height: '100%',
            zIndex: 1, // Text above background
        };

        // Text Shadow
        if (textShadowEnabled) {
            textStyles.textShadow = `${textShadowOffsetX || 2}px ${textShadowOffsetY || 2}px ${textShadowBlur || 2}px ${hexToRgba(textShadowColor || '#000000', textShadowOpacity || 0.4)}`;
        }

        // Text Reflection
        if (textReflectionEnabled) {
            const color = hexToRgba(textReflectionColor || '#000000', textReflectionOpacity || 0.4);
            textStyles.WebkitBoxReflect = `below ${textReflectionOffset || 0}px linear-gradient(to bottom, ${color}, transparent ${Math.round((textReflectionSize || 0.5) * 100)}%)`;
        }

        // Text 3D (overrides shadow)
        if (textThreeDEnabled) {
            const extrusion = textThreeDExtrusion || 5;
            const step = extrusion > 10 ? 2 : 1;
            const shadows = [];
            for (let i = 1; i <= extrusion; i += step) {
                shadows.push(`${i}px ${i}px 0 ${textThreeDColor || '#cccccc'}`);
            }
            textStyles.textShadow = shadows.join(', ');
            textStyles.transform = `${textStyles.transform || ''} perspective(${textThreeDDepth || 600}px) rotateX(${textThreeDRotateX || 0}deg) rotateY(${textThreeDRotateY || 0}deg)`;
            textStyles.display = 'inline-block';
        }

        // Apply watermark size and rotation to text
        if (isWatermark) {
            textStyles.fontSize = `${(watermarkSize || 100) / 100}em`;
            textStyles.fontWeight = 'bold';
            textStyles.transform = `${textStyles.transform || ''} rotate(${watermarkRotation || 0}deg)`;
            textStyles.display = 'inline-block';
        }

        return textStyles;
    };

    return (
        <NodeViewWrapper
            as="div"
            className={getClassNames()}
            style={getWrapperStyles()}
            ref={textboxRef}
            onMouseDown={handleMouseDown}
        >
            {/* Split Background Layer */}
            <div className="textbox-background" style={getBackgroundStyles()} />

            {/* Content Layer */}
            <div className="textbox-content" style={{ ...getTextContentStyles(), overflow: 'visible' }} contentEditable suppressContentEditableWarning>
                <NodeViewContent />
            </div>
            {selected && (
                <>
                    {/* Corner Resize Handles */}
                    {/* Top-left corner */}
                    <div
                        style={{
                            position: 'absolute',
                            left: -5,
                            top: -5,
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'nwse-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('nw')}
                    />
                    {/* Top-right corner */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -5,
                            top: -5,
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'nesw-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('ne')}
                    />
                    {/* Bottom-left corner */}
                    <div
                        style={{
                            position: 'absolute',
                            left: -5,
                            bottom: -5,
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'nesw-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('sw')}
                    />
                    {/* Bottom-right corner */}
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
                        onMouseDown={handleResizeStart('se')}
                    />

                    {/* Edge Resize Handles */}
                    {/* Top edge */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'ns-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('n')}
                    />
                    {/* Bottom edge */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'ns-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('s')}
                    />
                    {/* Left edge */}
                    <div
                        style={{
                            position: 'absolute',
                            left: -5,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'ew-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('w')}
                    />
                    {/* Right edge */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -5,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 12,
                            height: 12,
                            background: '#4285F4',
                            cursor: 'ew-resize',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                        onMouseDown={handleResizeStart('e')}
                    />

                    {/* Rotation handle */}
                    <div
                        style={{
                            position: 'absolute',
                            top: -35,
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
                            top: -35,
                            left: '50%',
                            width: '2px',
                            height: '35px',
                            background: '#34A853',
                            transformOrigin: 'bottom',
                        }}
                    />
                </>
            )}
        </NodeViewWrapper>
    );
};

// Helper for hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
