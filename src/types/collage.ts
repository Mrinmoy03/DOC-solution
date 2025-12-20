
export interface CollageTemplate {
  id: string;
  name: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  cells: number; // Number of image slots
}

export interface CollageStyle {
  gap: number;
  padding: number;
  borderRadius: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  aspectRatio: number;
}

export interface DraggedImage {
  id: string;
  url: string;
}

export interface CellSpan {
  rowSpan: number;
  colSpan: number;
}
