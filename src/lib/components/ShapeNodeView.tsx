import { NodeViewWrapper } from '@tiptap/react';
import { useRef, useEffect, useState } from 'react';

export const ShapeNodeView = ({ node, updateAttributes, selected, editor, getPos }: any) => {
    const shapeRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    // Track local editing state - now stores WHICH field is being edited or null
    // All shapes now use this for attribute-based editing
    const [editingField, setEditingField] = useState<'text' | 'textBelow' | null>(null);

    const { type, width, height, x, y, rotation, fillColor, outlineColor, noFill, noOutline, imageUrl, text, textBelow,
        shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, shadowOpacity,
        reflectionOffset, reflectionOpacity, reflectionSize, reflectionColor,
        threeDDepth, threeDRotateX, threeDRotateY, threeDColor, threeDExtrusion,
        shadowEnabled, reflectionEnabled, threeDEnabled,
        textThreeDEnabled, textThreeDColor, textThreeDExtrusion, textThreeDDepth, textThreeDRotateX, textThreeDRotateY,
        textShadowEnabled, textShadowColor, textShadowBlur, textShadowOpacity, textShadowOffsetX, textShadowOffsetY,
        textReflectionEnabled, textReflectionOffset, textReflectionOpacity, textReflectionSize, textReflectionColor
    } = node.attrs;

    // Use a ref for interaction state to always have fresh values in event listeners
    const interactionState = useRef({
        isDragging: false,
        isResizing: false,
        isRotating: false,
        dragStart: { x: 0, y: 0 },
        resizeStart: { x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 },
        resizeDirection: '',
        rotationStart: { startAngle: 0, startRotation: 0, centerX: 0, centerY: 0 },
    });

    useEffect(() => {
        // If the node has the 'isEditing' attribute set to true (from toolbar), enable editing mode
        if (node.attrs.isEditing) {
            // Check if a specific field was requested
            const fieldToEdit = node.attrs.editingField || 'text';
            setEditingField(fieldToEdit);

            // Clear the attribute so we don't get stuck in editing mode re-triggering
            updateAttributes({ isEditing: false, editingField: null });
        }
    }, [node.attrs.isEditing, node.attrs.editingField, updateAttributes]);

    useEffect(() => {
        if (editingField && textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [editingField]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;

        // Allow interaction with textarea if editing
        if (editingField && target.tagName === 'TEXTAREA') {
            e.stopPropagation();
            return;
        }

        // Prevent dragging if clicking on resize handles
        if (target.closest('.resize-handle') || target.closest('.rotation-handle')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Manually select the node
        if (typeof getPos === 'function') {
            editor.commands.setNodeSelection(getPos());
        }

        interactionState.current = {
            ...interactionState.current,
            isDragging: true,
            dragStart: {
                x: e.clientX - x,
                y: e.clientY - y,
            },
        };
    };

    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();

        interactionState.current = {
            ...interactionState.current,
            isResizing: true,
            resizeDirection: direction,
            resizeStart: {
                x: e.clientX,
                y: e.clientY,
                width: width,
                height: height,
                posX: x,
                posY: y,
            },
        };
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Calculate center of shape
        const rect = shapeRef.current?.getBoundingClientRect();
        if (!rect) return;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate starting angle
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        interactionState.current = {
            ...interactionState.current,
            isRotating: true,
            rotationStart: {
                startAngle,
                startRotation: rotation || 0,
                centerX,
                centerY
            },
        };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const state = interactionState.current;

            if (state.isDragging) {
                updateAttributes({
                    x: e.clientX - state.dragStart.x,
                    y: e.clientY - state.dragStart.y,
                });
            } else if (state.isResizing) {
                // Simple resizing logic
                const dx = e.clientX - state.resizeStart.x;
                const dy = e.clientY - state.resizeStart.y;

                let newWidth = Math.max(20, state.resizeStart.width + dx);
                let newHeight = Math.max(20, state.resizeStart.height + dy);

                updateAttributes({
                    width: Math.round(newWidth),
                    height: Math.round(newHeight),
                });
            } else if (state.isRotating) {
                const { centerX, centerY, startAngle, startRotation } = state.rotationStart;
                const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                const angleDiff = currentAngle - startAngle;
                const degDiff = angleDiff * (180 / Math.PI);

                let newRotation = (startRotation + degDiff) % 360;
                // Snap to 45 degrees
                if (e.shiftKey) {
                    newRotation = Math.round(newRotation / 45) * 45;
                }

                updateAttributes({
                    rotation: newRotation
                });
            }
        };

        const handleMouseUp = () => {
            const state = interactionState.current;
            if (state.isDragging || state.isResizing || state.isRotating) {
                interactionState.current = {
                    ...state,
                    isDragging: false,
                    isResizing: false,
                    isRotating: false,
                };
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [updateAttributes]);

    const renderShape = () => {
        const fill = noFill ? 'transparent' : fillColor;
        const stroke = noOutline ? 'transparent' : outlineColor;

        const containerStyle: React.CSSProperties = {
            width: width,
            height: height,
            position: 'relative', // Ensure SVG fits
        };

        const svgStyle: React.CSSProperties = {
            display: 'block',
            overflow: 'visible',
            transition: 'all 0.3s ease',
            filter: [
                shadowEnabled ? `drop-shadow(${shadowOffsetX || 4}px ${shadowOffsetY || 4}px ${shadowBlur || 4}px ${hexToRgba(shadowColor || '#000000', shadowOpacity || 0.4)})` : '',
                threeDEnabled ?
                    (() => {
                        const extrusion = threeDExtrusion || 5;
                        const step = extrusion > 10 ? 2 : 1;
                        const shadows = [];
                        for (let i = 1; i <= extrusion; i += step) {
                            shadows.push(`drop-shadow(${i}px ${i}px 0px ${threeDColor || '#cccccc'})`);
                        }
                        return shadows.join(' ');
                    })()
                    : ''
            ].filter(Boolean).join(' ') || 'none',
            WebkitBoxReflect: reflectionEnabled ? `below ${reflectionOffset || 0}px linear-gradient(to bottom, ${hexToRgba(reflectionColor || '#000000', reflectionOpacity || 0.4)}, transparent ${Math.round((reflectionSize || 0.5) * 100)}%)` : undefined,
            transform: threeDEnabled ? `perspective(${threeDDepth || 600}px) rotateX(${threeDRotateX || 15}deg) rotateY(${threeDRotateY || 15}deg)` : undefined
        };

        // Text Effects Style Logic
        const textStyle: React.CSSProperties = {
            transition: 'all 0.3s ease',
        };

        // Text Shadow
        if (textShadowEnabled) {
            textStyle.textShadow = `${textShadowOffsetX || 2}px ${textShadowOffsetY || 2}px ${textShadowBlur || 2}px ${hexToRgba(textShadowColor || '#000000', textShadowOpacity || 0.4)}`;
        }

        // Text Reflection
        if (textReflectionEnabled) {
            textStyle.WebkitBoxReflect = `below ${textReflectionOffset || 0}px linear-gradient(to bottom, ${hexToRgba(textReflectionColor || '#000000', textReflectionOpacity || 0.4)}, transparent ${Math.round((textReflectionSize || 0.5) * 100)}%)`;
        }

        // 3D Text (overrides shadow)
        if (textThreeDEnabled) {
            const extrusion = textThreeDExtrusion || 5;
            const step = extrusion > 10 ? 2 : 1;
            const shadows = [];
            for (let i = 1; i <= extrusion; i += step) {
                shadows.push(`${i}px ${i}px 0 ${textThreeDColor || '#cccccc'}`);
            }
            textStyle.textShadow = shadows.join(', ');
            textStyle.transform = `${textStyle.transform || ''} perspective(${textThreeDDepth || 600}px) rotateX(${textThreeDRotateX || 0}deg) rotateY(${textThreeDRotateY || 0}deg)`;
        }

        switch (type) {
            case 'line':
                return (
                    <div style={containerStyle}>
                        <svg width="100%" height="100%" style={svgStyle} viewBox={`0 0 ${width} ${height || 2}`} preserveAspectRatio="none">
                            <line
                                x1="0"
                                y1="50%"
                                x2="100%"
                                y2="50%"
                                stroke={stroke}
                                strokeWidth="2"
                            />
                        </svg>
                        {/* Text Above */}
                        {text && (!editingField || editingField !== 'text') && (
                            <div style={{ position: 'absolute', top: '-25px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span className="cursor-text nodrag" onDoubleClick={(e) => { e.stopPropagation(); setEditingField('text'); }} style={{ ...textStyle, fontSize: '14px', color: '#000', pointerEvents: 'auto', display: 'inline-block' }}>
                                    {text}
                                </span>
                            </div>
                        )}
                        {/* Text Below */}
                        {textBelow && (!editingField || editingField !== 'textBelow') && (
                            <div style={{ position: 'absolute', bottom: '-25px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                                <span className="cursor-text nodrag" onDoubleClick={(e) => { e.stopPropagation(); setEditingField('textBelow'); }} style={{ ...textStyle, fontSize: '14px', color: '#000', pointerEvents: 'auto', display: 'inline-block' }}>
                                    {textBelow}
                                </span>
                            </div>
                        )}
                    </div>
                );
            case 'rectangle':
                return (
                    <div style={containerStyle}>
                        <svg width="100%" height="100%" style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <defs>
                                {imageUrl && (
                                    <pattern id={`img-${node.attrs.id || 'rect'}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
                                        <image href={imageUrl} x="0" y="0" width={width} height={height} preserveAspectRatio="xMidYMid slice" />
                                    </pattern>
                                )}
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill={imageUrl ? `url(#img-${node.attrs.id || 'rect'})` : fill}
                                stroke={stroke}
                                strokeWidth={noOutline ? 0 : 2}
                            />
                        </svg>
                        {text && !imageUrl && !editingField && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <span
                                    className="cursor-text"
                                    onClick={(e) => { e.stopPropagation(); setEditingField('text'); }}
                                    style={{
                                        ...textStyle,
                                        fontSize: '14px',
                                        color: '#000',
                                        pointerEvents: 'auto',
                                        display: 'inline-block', // Required for transform/reflection
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        )}
                    </div>
                );
            case 'circle':
                return (
                    <div style={containerStyle}>
                        <svg width="100%" height="100%" style={svgStyle} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                            <defs>
                                {imageUrl && (
                                    <pattern id={`img-${node.attrs.id || 'circle'}`} patternUnits="userSpaceOnUse" width="100%" height="100%">
                                        <image href={imageUrl} x="0" y="0" width={width} height={height} preserveAspectRatio="xMidYMid slice" />
                                    </pattern>
                                )}
                            </defs>
                            <ellipse
                                cx="50%"
                                cy="50%"
                                rx="50%"
                                ry="50%"
                                fill={imageUrl ? `url(#img-${node.attrs.id || 'circle'})` : fill}
                                stroke={stroke}
                                strokeWidth={noOutline ? 0 : 2}
                            />
                        </svg>
                        {text && !imageUrl && !editingField && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none',
                                }}
                            >
                                <span
                                    className="cursor-text"
                                    onClick={(e) => { e.stopPropagation(); setEditingField('text'); }}
                                    style={{
                                        ...textStyle,
                                        fontSize: '14px',
                                        color: '#000',
                                        pointerEvents: 'auto',
                                        display: 'inline-block', // Required for transform/reflection
                                    }}
                                >
                                    {text}
                                </span>
                            </div>
                        )}
                    </div>
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
                zIndex: node.attrs.zIndex || 1,
                cursor: interactionState.current.isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                transform: `
                    translate(${x}px, ${y}px) 
                    rotate(${rotation}deg) 
                `.trim().replace(/\s+/g, ' '),
            }}
            ref={shapeRef}
            onMouseDown={handleMouseDown}
            onDoubleClick={(e: React.MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;

                if (type === 'line' && clickY > rect.height / 2) {
                    setEditingField('textBelow');
                } else if (type === 'line') {
                    setEditingField('text');
                }
                // Rect/Circle double click logic
                else {
                    setEditingField('text');
                }
            }}
        >
            {renderShape()}

            {/* Direct Text Editing Overlay */}
            {editingField && (
                <textarea
                    ref={textAreaRef}
                    value={(editingField === 'text' ? text : textBelow) || ''}
                    onChange={(e) => updateAttributes({ [editingField]: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    style={{
                        position: 'absolute',
                        top: type === 'line'
                            ? (editingField === 'textBelow' ? '55%' : 'auto')
                            : 0,
                        bottom: type === 'line'
                            ? (editingField === 'textBelow' ? 'auto' : '55%')
                            : 'auto',
                        left: 0,
                        width: '100%',
                        height: type === 'line' ? 'auto' : '100%',
                        minHeight: '24px',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        textAlign: 'center',
                        color: 'black', // Ensure text is visible
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        // Basic vertical alignment approximation for non-lines
                        // paddingTop: type !== 'line' ? (height / 2 - 10) : 0, // Removed, flexbox handles it
                        cursor: 'text',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        overflow: 'hidden'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            )}

            {selected && !editingField && (
                <>
                    {/* Resize handle (bottom-right) */}
                    <div
                        className="resize-handle"
                        style={{
                            position: 'absolute',
                            right: -6,
                            bottom: -6,
                            width: 12,
                            height: 12,
                            background: '#fff',
                            border: '1px solid #4285F4',
                            cursor: 'nwse-resize',
                            zIndex: 10,
                        }}
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />

                    {/* Rotation handle (top center) */}
                    <div
                        className="rotation-handle"
                        style={{
                            position: 'absolute',
                            top: -25,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#fff',
                            border: '1px solid #28a745',
                            cursor: 'ew-resize',
                            zIndex: 10,
                        }}
                        onMouseDown={handleRotateStart}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 10,
                            left: 4,
                            width: 1,
                            height: 15,
                            background: '#28a745',
                        }} />
                    </div>

                    {/* Bounding box border when selected */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        border: '1px solid #4285F4',
                        pointerEvents: 'none',
                    }} />
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
