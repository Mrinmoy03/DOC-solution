export interface CropData {
    x: number;        // Crop area x position in pixels
    y: number;        // Crop area y position in pixels
    width: number;    // Crop area width in pixels
    height: number;   // Crop area height in pixels
    zoom: number;     // Zoom level (1 = 100%)
}

export interface CellImage {
    url: string;
    cropData: CropData;
    imageObj: HTMLImageElement | null;  // Loaded image object
}

export interface GridCell {
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    image?: CellImage;
}

export interface Point {
    x: number;
    y: number;
}

export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}
