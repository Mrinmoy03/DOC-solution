import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from '../../types/crop';

interface ImageCropperProps {
    imageUrl: string;
    cellWidth: number;
    cellHeight: number;
    onCropChange: (cropData: { x: number; y: number; width: number; height: number; zoom: number }) => void;
    onComplete: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
    imageUrl,
    cellWidth,
    cellHeight,
    onCropChange,
    onComplete,
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback(
        (croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);

            console.log('Crop completed:', {
                croppedArea,
                croppedAreaPixels,
                zoom,
            });

            // Use croppedAreaPixels directly - these are absolute coordinates in the original image
            onCropChange({
                x: Math.round(croppedAreaPixels.x),
                y: Math.round(croppedAreaPixels.y),
                width: Math.round(croppedAreaPixels.width),
                height: Math.round(croppedAreaPixels.height),
                zoom,
            });
        },
        [onCropChange, zoom]
    );

    // Calculate aspect ratio from cell dimensions
    const aspect = cellWidth / cellHeight;

    return (
        <div className="absolute inset-0 bg-black">
            <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={undefined}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="cover"
                restrictPosition={false}
                showGrid={false}
                cropSize={{ width: cellWidth, height: cellHeight }}
            />

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
                    onClick={onComplete}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                >
                    Done
                </button>
            </div>
        </div>
    );
};
