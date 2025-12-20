import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CollageStyle, CollageTemplate } from '../../types/collage';
import type { CellImage, CropData } from '../../types/crop';
import { CollageSidebar } from './CollageSidebar';
import { KonvaCollageCanvas } from './KonvaCollageCanvas';
import { Download, ChevronLeft, Upload, Image as ImageIcon } from 'lucide-react';

const DEFAULT_TEMPLATES: CollageTemplate[] = [
    { id: 'grid-1x1', name: 'Single', gridTemplateColumns: '1fr', gridTemplateRows: '1fr', cells: 1 },
    { id: 'grid-2x1', name: 'Dual V', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr', cells: 2 },
    { id: 'grid-1x2', name: 'Dual H', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr', cells: 2 },
    { id: 'grid-1x3', name: 'Triple H', gridTemplateColumns: '1fr', gridTemplateRows: 'repeat(3, 1fr)', cells: 3 },
    { id: 'grid-3x1', name: 'Triple V', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr', cells: 3 },
    { id: 'grid-2x2', name: 'Quad', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', cells: 4 },
    { id: 'grid-1x5', name: 'Five H', gridTemplateColumns: '1fr', gridTemplateRows: 'repeat(5, 1fr)', cells: 5 },
    { id: 'grid-5x1', name: 'Five V', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: '1fr', cells: 5 },
    { id: 'grid-3x3', name: 'Nine', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', cells: 9 },
    { id: 'grid-1-2', name: '1 Top 2 Bottom', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', cells: 3 }, // Special case handling might be needed for non-uniform grids, keeping simple for now
];

const DEFAULT_STYLE: CollageStyle = {
    gap: 10,
    padding: 20,
    borderRadius: 0,
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    borderWidth: 0,
    aspectRatio: 1,
};

interface GridSettings {
    rows: number;
    cols: number;
    rowWeights: number[];
    colWeights: number[];
}

export const CollageEditor: React.FC = () => {
    const navigate = useNavigate();
    const [isStarted, setIsStarted] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>(DEFAULT_TEMPLATES[5]); // Default 2x2
    const [style, setStyle] = useState<CollageStyle>(DEFAULT_STYLE);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [placedImages, setPlacedImages] = useState<{ [key: number]: string }>({});
    const [cellImages, setCellImages] = useState<{ [key: number]: CellImage }>({});
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [gridSettings, setGridSettings] = useState<GridSettings>({ rows: 2, cols: 2, rowWeights: [1, 1], colWeights: [1, 1] });
    const [cellSpans, setCellSpans] = useState<{ [key: number]: { rowSpan: number; colSpan: number } }>({});
    const canvasRef = useRef<any>(null);

    React.useEffect(() => {
        // Parse template to guess rows/cols if possible, or use defaults
        // Allow strict templates to override.
        // For standard named templates, we hardcode defaults or infer.
        let rows = 2;
        let cols = 2;

        if (selectedTemplate.gridTemplateRows.includes('repeat')) {
            const match = selectedTemplate.gridTemplateRows.match(/repeat\((\d+)/);
            if (match) rows = parseInt(match[1]);
        } else {
            rows = selectedTemplate.gridTemplateRows.split(' ').length;
        }

        if (selectedTemplate.gridTemplateColumns.includes('repeat')) {
            const match = selectedTemplate.gridTemplateColumns.match(/repeat\((\d+)/);
            if (match) cols = parseInt(match[1]);
        } else {
            cols = selectedTemplate.gridTemplateColumns.split(' ').length;
        }

        setGridSettings({
            rows,
            cols,
            rowWeights: new Array(rows).fill(1),
            colWeights: new Array(cols).fill(1)
        });
    }, [selectedTemplate]);

    // Sync cellImages with placedImages
    React.useEffect(() => {
        const newCellImages: { [key: number]: CellImage } = {};
        Object.entries(placedImages).forEach(([index, url]) => {
            const idx = parseInt(index);
            // Only create new entry if URL changed or doesn't exist
            if (!cellImages[idx] || cellImages[idx].url !== url) {
                newCellImages[idx] = {
                    url,
                    cropData: cellImages[idx]?.cropData || { x: 0, y: 0, width: 0, height: 0, zoom: 1 },
                    imageObj: cellImages[idx]?.imageObj || null,
                };
            } else {
                newCellImages[idx] = cellImages[idx];
            }
        });
        // Only update if there's an actual change
        if (JSON.stringify(Object.keys(newCellImages).sort()) !== JSON.stringify(Object.keys(cellImages).sort())) {
            setCellImages(newCellImages);
        }
    }, [placedImages]);

    const handleGridSettingChange = useCallback((type: 'row' | 'col', indexOrUpdates: number | { index: number, value: number }[], value?: number) => {
        setGridSettings(prev => {
            const newWeights = type === 'row' ? [...prev.rowWeights] : [...prev.colWeights];

            if (Array.isArray(indexOrUpdates)) {
                indexOrUpdates.forEach(u => {
                    if (newWeights[u.index] !== undefined) newWeights[u.index] = u.value;
                });
            } else if (typeof value === 'number') {
                newWeights[indexOrUpdates] = value;
            }

            return {
                ...prev,
                [type === 'row' ? 'rowWeights' : 'colWeights']: newWeights
            };
        });
    }, []);

    const handleInitialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setUploadedImages(newImages);

            // Auto-select template based on count
            const count = newImages.length;
            let bestTemplate = DEFAULT_TEMPLATES[5]; // Default 2x2

            if (count === 1) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-1x1') || bestTemplate;
            else if (count === 2) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-2x1') || bestTemplate;
            else if (count === 3) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-3x1') || bestTemplate;
            else if (count === 4) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-2x2') || bestTemplate;
            else if (count === 5) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-5x1') || bestTemplate;
            else if (count <= 9) bestTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'grid-3x3') || bestTemplate;

            setSelectedTemplate(bestTemplate);

            // Auto-place images
            const newPlaced: { [key: number]: string } = {};
            newImages.forEach((url, i) => {
                if (i < bestTemplate.cells) {
                    newPlaced[i] = url;
                }
            });
            setPlacedImages(newPlaced);
            setIsStarted(true);
        }
    };

    const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setUploadedImages((prev) => [...prev, ...newImages]);
        }
    };

    const handleDragStart = (e: React.DragEvent, url: string) => {
        const data = JSON.stringify({ type: 'sidebar', url });
        e.dataTransfer.setData('text/plain', data);
    };

    const handleDropImage = (index: number, dataString: string) => {
        try {
            const data = JSON.parse(dataString);

            if (data.type === 'sidebar') {
                setPlacedImages((prev) => ({ ...prev, [index]: data.url }));
            } else if (data.type === 'cell') {
                const sourceIndex = data.index;
                if (sourceIndex === index) return;

                setPlacedImages((prev) => {
                    const next = { ...prev };
                    const sourceUrl = next[sourceIndex];
                    const targetUrl = next[index];

                    next[index] = sourceUrl;

                    if (targetUrl) {
                        next[sourceIndex] = targetUrl;
                    } else {
                        delete next[sourceIndex];
                    }
                    return next;
                });

                // Also swap cellImages crop data
                setCellImages((prev) => {
                    const next = { ...prev };
                    const sourceImage = next[sourceIndex];
                    const targetImage = next[index];

                    // Swap the entire cellImage objects
                    if (sourceImage) {
                        next[index] = { ...sourceImage };
                    } else {
                        delete next[index];
                    }

                    if (targetImage) {
                        next[sourceIndex] = { ...targetImage };
                    } else {
                        delete next[sourceIndex];
                    }

                    return next;
                });
            }
        } catch (e) {
            // Fallback for raw URLs
            if (dataString && dataString.startsWith('blob:')) {
                setPlacedImages((prev) => ({ ...prev, [index]: dataString }));
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setPlacedImages((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
        setCellImages((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const handleCropChange = (index: number, cropData: CropData) => {
        setCellImages((prev) => ({
            ...prev,
            [index]: {
                ...prev[index],
                cropData,
            },
        }));
    };

    const handleDownload = async () => {
        if (canvasRef.current) {
            try {
                const stage = canvasRef.current;
                const dataURL = stage.toDataURL({
                    pixelRatio: 2,
                    mimeType: 'image/png'
                });
                const link = document.createElement('a');
                link.download = `collage-${Date.now()}.png`;
                link.href = dataURL;
                link.click();
            } catch (error) {
                console.error("Failed to generate collage", error);
            }
        }
    };

    if (!isStarted) {
        return (
            <div className="flex flex-col h-screen bg-slate-50">
                {/* Header */}
                <div className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            title="Back to Dashboard"
                        >
                            <ChevronLeft className="text-slate-600" />
                        </button>
                        <h1 className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Photo Collage Maker</h1>
                    </div>
                </div>

                {/* Landing Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="bg-indigo-50 p-6 rounded-full inline-flex">
                            <ImageIcon size={64} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Your Collage</h2>
                            <p className="text-slate-600">Upload your photos to automatically generate a beautiful grid. You can customize the layout afterwards.</p>
                        </div>

                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleInitialUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-500/20 transition-all transform group-hover:-translate-y-1 flex items-center justify-center gap-3 font-semibold text-lg">
                                <Upload size={24} />
                                Select Photos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Back to Dashboard"
                    >
                        <ChevronLeft className="text-slate-600" />
                    </button>
                    <h1 className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Photo Collage Maker</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsStarted(false)}
                        className="text-sm text-slate-500 hover:text-slate-800 font-medium"
                    >
                        Start Over
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 font-medium"
                    >
                        <Download size={18} />
                        <span>Export Collage</span>
                    </button>
                </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 flex overflow-hidden">
                <CollageSidebar
                    templates={DEFAULT_TEMPLATES}
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                    style={style}
                    onStyleChange={setStyle}
                    uploadedImages={uploadedImages}
                    onUploadImage={handleUploadImage}
                    onDragStart={handleDragStart}
                    gridSettings={gridSettings}
                    onGridSettingChange={handleGridSettingChange}
                />
                <KonvaCollageCanvas
                    template={{
                        ...selectedTemplate,
                        gridTemplateColumns: gridSettings.colWeights.map(w => `${w}fr`).join(' '),
                        gridTemplateRows: gridSettings.rowWeights.map(w => `${w}fr`).join(' '),
                    }}
                    style={style}
                    placedImages={placedImages}
                    onRemoveImage={handleRemoveImage}
                    onDropImage={handleDropImage}
                    canvasRef={canvasRef}
                    gridSettings={gridSettings}
                    onGridSettingChange={handleGridSettingChange}
                    cellImages={cellImages}
                    onCropChange={handleCropChange}
                    activeCell={activeCell}
                    onSetActiveCell={setActiveCell}
                    cellSpans={cellSpans}
                    onCellSpanChange={setCellSpans}
                />
            </div>
        </div>
    );
};
