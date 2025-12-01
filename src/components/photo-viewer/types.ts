export interface PhotoViewerProps {
    file: File | null;
    onClose: () => void;
    onSave?: (file: File) => void;
}

export interface FilterState {
    brightness: number;
    contrast: number;
    saturate: number;
    grayscale: number;
    sepia: number;
    blur: number;
    hueRotate: number;
}

export interface ResizeDimensions {
    width: number;
    height: number;
}

export interface BackgroundState {
    type: 'color' | 'blur' | 'transparent';
    value: string;
}

// Dummy export to ensure this file is treated as a module with runtime exports
export const TYPES_VERSION = '1.0.0';
