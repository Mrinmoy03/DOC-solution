import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

export const ImageNodeView = ({ node, updateAttributes, selected }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
    const [rotationStart, setRotationStart] = useState({ angle: 0, centerX: 0, centerY: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    const {
        src,
        alt,
        width,
        height,
        x,
        y,
        rotation,
        position,
    } = node.attrs;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        // Don't prevent default immediately if we want to allow text selection elsewhere, 
        // but for dragging node, we usually prevent default.
        // e.preventDefault(); 

        setIsDragging(true);
        setDragStart({
            x: e.clientX - (x || 0),
            y: e.clientY - (y || 0),
        });
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling
        // Dispatch event for parent to listen
        window.dispatchEvent(new CustomEvent('image-double-click', { detail: { node } }));
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        setResizeStart({
            width: width || 200,
            height: height || 200,
            x: e.clientX,
            y: e.clientY,
        });
    };

    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);
        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
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
                // Simple resizing logic, aspect ratio maintenance could be added here
                updateAttributes({
                    width: Math.max(50, resizeStart.width + deltaX),
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

    const getStyles = (): React.CSSProperties => {
        return {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${x || 0}px, ${y || 0}px) rotate(${rotation || 0}deg)`,
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            // display: 'inline-block', // Let class control display
            lineHeight: 0,
            // zIndex: 10, // Removed to let CSS control z-index
            transition: isDragging || isResizing || isRotating ? 'none' : 'transform 0.1s ease',
        };
    };

    return (
        <NodeViewWrapper
            as="div"
            className={`image-node-view ${selected ? 'selected' : ''} image-${position || 'inline'}`}
            style={getStyles()}
            ref={imageRef}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            data-drag-handle
        >
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none', // Let the wrapper handle events
                    display: 'block'
                }}
            />

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
                            zIndex: 20
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
                            zIndex: 20
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
                            zIndex: 15
                        }}
                    />
                </>
            )}
        </NodeViewWrapper>
    );
};
