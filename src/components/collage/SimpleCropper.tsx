import React, { useState, useRef, useEffect } from 'react';

interface SimpleCropperProps {
    imageUrl: string;
    onCropChange: (cropData: { x: number; y: number; width: number; height: number; zoom: number }) => void;
    onComplete: () => void;
}

export const SimpleCropper: React.FC<SimpleCropperProps> = ({
    imageUrl,
    onCropChange,
    onComplete,
}) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Load image to get dimensions
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDone = () => {
        if (!containerRef.current || !imageSize.width) return;

        const container = containerRef.current.getBoundingClientRect();

        // Calculate the visible area in image coordinates
        const scale = zoom;
        const visibleWidth = imageSize.width / scale;
        const visibleHeight = imageSize.height / scale;

        // Calculate offset based on pan
        const offsetX = -pan.x / (container.width / visibleWidth);
        const offsetY = -pan.y / (container.height / visibleHeight);

        const cropX = Math.max(0, (imageSize.width - visibleWidth) / 2 + offsetX);
        const cropY = Math.max(0, (imageSize.height - visibleHeight) / 2 + offsetY);

        onCropChange({
            x: cropX,
            y: cropY,
            width: visibleWidth,
            height: visibleHeight,
            zoom: scale,
        });

        onComplete();
    };

    return (
        <div className="absolute inset-0 bg-black">
            <div
                ref={containerRef}
                className="absolute inset-0 overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img
                    src={imageUrl}
                    alt="Crop preview"
                    draggable={false}
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginLeft: '-50%',
                        marginTop: '-50%',
                    }}
                />
            </div>

            {/* Controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 flex items-center gap-4 z-10">
                <div className="flex-1 flex items-center gap-2">
                    <span className="text-white text-sm">Zoom:</span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1"
                    />
                </div>
                <button
                    onClick={handleDone}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                >
                    Done
                </button>
            </div>
        </div>
    );
};
