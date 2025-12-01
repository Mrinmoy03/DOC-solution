import { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check } from 'lucide-react';

interface ImageCropModalProps {
    imageUrl: string;
    onClose: () => void;
    onCrop: (croppedImageUrl: string) => void;
}

export const ImageCropModal = ({ imageUrl, onClose, onCrop }: ImageCropModalProps) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    const handleApplyCrop = async () => {
        if (!imgRef.current || !completedCrop) return;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        try {
            ctx.drawImage(
                image,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            const croppedImageUrl = canvas.toDataURL('image/png');
            onCrop(croppedImageUrl);
            onClose();
        } catch (error) {
            // If CORS error, try fetching the image as blob
            console.error('Canvas tainted, attempting blob conversion:', error);
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                
                const tempImg = new Image();
                tempImg.crossOrigin = 'anonymous';
                tempImg.onload = () => {
                    ctx.drawImage(
                        tempImg,
                        cropX,
                        cropY,
                        cropWidth,
                        cropHeight,
                        0,
                        0,
                        cropWidth,
                        cropHeight
                    );
                    const croppedImageUrl = canvas.toDataURL('image/png');
                    URL.revokeObjectURL(blobUrl);
                    onCrop(croppedImageUrl);
                    onClose();
                };
                tempImg.src = blobUrl;
            } catch (fetchError) {
                console.error('Failed to crop image:', fetchError);
                alert('Failed to crop image. The image may be from a restricted source.');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Crop Image</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleApplyCrop} 
                            disabled={!completedCrop}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Apply Crop"
                        >
                            <Check size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Cancel">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={undefined}
                    >
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            alt="Crop me"
                            crossOrigin="anonymous"
                            style={{ maxHeight: '70vh', maxWidth: '100%' }}
                        />
                    </ReactCrop>
                </div>
            </div>
        </div>
    );
};
