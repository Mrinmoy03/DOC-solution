import React from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import type { BackgroundState } from './types';

interface CanvasProps {
    imageUrl: string;
    scale: number;
    rotate: number;
    canvasMode: 'original' | 'square';
    background: BackgroundState;
    crop: Crop | undefined;
    setCrop: (crop: Crop) => void;
    setCompletedCrop: (crop: PixelCrop) => void;
    onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    imgRef: React.RefObject<HTMLImageElement | null>;
    filterString: string;
    borderWidth: number;
    borderColor: string;
    setScale: React.Dispatch<React.SetStateAction<number>>;
}

export const Canvas: React.FC<CanvasProps> = ({
    imageUrl,
    scale,
    rotate,
    canvasMode,
    background,
    crop,
    setCrop,
    setCompletedCrop,
    onImageLoad,
    imgRef,
    filterString,
    borderWidth,
    borderColor,
    setScale,
}) => {
    return (
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0iIzMzMyIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4')]">
            <div
                className="transition-transform duration-200 ease-out"
                style={{ transform: `scale(${scale})` }}
            >
                <div
                    className={`relative flex items-center justify-center shadow-2xl transition-all duration-300 ${canvasMode === 'square' ? 'aspect-square h-[50vh] sm:h-[60vh] md:h-[70vh]' : ''
                        }`}
                    style={{
                        backgroundColor: background.type === 'color' ? background.value : undefined,
                    }}
                >
                    {/* Blur Background */}
                    {canvasMode === 'square' && background.type === 'blur' && (
                        <>
                            <div className="absolute inset-0 overflow-hidden rounded-lg">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-cover blur-2xl scale-110 opacity-60"
                                    alt="background"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/20 rounded-lg" />
                        </>
                    )}

                    {/* Image Wrapper */}
                    <div
                        style={{
                            transform: `rotate(${rotate}deg)`,
                            border: `${borderWidth}px solid ${borderColor}`,
                            filter: filterString,
                            width: canvasMode === 'square' ? '100%' : undefined,
                            height: canvasMode === 'square' ? '100%' : undefined,
                            display: canvasMode === 'square' ? 'flex' : undefined,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        className={`relative ${canvasMode === 'square' ? 'p-8 box-border' : ''}`}
                    >
                        {canvasMode === 'square' ? (
                            <img
                                ref={imgRef}
                                src={imageUrl}
                                alt="Edit"
                                onLoad={onImageLoad}
                                className="block object-contain max-w-full max-h-full"
                                style={{
                                    pointerEvents: 'none',
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: 'auto',
                                    height: 'auto',
                                }}
                            />
                        ) : (
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={setCompletedCrop}
                                aspect={undefined}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    display: 'flex',
                                }}
                            >
                                <img
                                    ref={imgRef}
                                    src={imageUrl}
                                    alt="Edit"
                                    onLoad={onImageLoad}
                                    className="block object-contain max-w-full max-h-[80vh]"
                                    style={{
                                        pointerEvents: 'none',
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        width: 'auto',
                                        height: 'auto',
                                    }}
                                />
                            </ReactCrop>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Zoom Controls */}
            <div className="fixed bottom-3 left-[calc(50%+13rem)] -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl z-50">
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.1))} className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center">-</button>
                <span className="text-white font-mono text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(s + 0.1, 5))} className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center">+</button>
            </div>
        </div>
    );
};
