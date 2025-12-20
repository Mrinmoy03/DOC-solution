import React, { useRef } from 'react';
import type { CollageStyle, CollageTemplate } from '../../types/collage';
import { Upload } from 'lucide-react';

interface CollageSidebarProps {
    templates: CollageTemplate[];
    selectedTemplate: CollageTemplate;
    onSelectTemplate: (template: CollageTemplate) => void;
    style: CollageStyle;
    onStyleChange: (style: CollageStyle) => void;
    uploadedImages: string[];
    onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDragStart: (e: React.DragEvent, url: string) => void;
    // New Props
    gridSettings: { rows: number; cols: number; rowWeights: number[]; colWeights: number[] };
    onGridSettingChange: (type: 'row' | 'col', index: number, value: number) => void;
}

export const CollageSidebar: React.FC<CollageSidebarProps> = ({
    templates,
    selectedTemplate,
    onSelectTemplate,
    style,
    onStyleChange,
    uploadedImages,
    onUploadImage,
    onDragStart,
    gridSettings,
    onGridSettingChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUploadImage(e);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="w-80 bg-white border-r border-slate-200 h-full overflow-y-auto p-4 flex flex-col gap-6">
            {/* Templates Section */}
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Layouts</h3>
                <div className="grid grid-cols-3 gap-2">
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template)}
                            className={`aspect-square border-2 rounded-lg p-1 transition-all ${selectedTemplate.id === template.id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div
                                className="w-full h-full grid bg-slate-100 gap-[2px]"
                                style={{
                                    gridTemplateColumns: template.gridTemplateColumns,
                                    gridTemplateRows: template.gridTemplateRows,
                                }}
                            >
                                {Array.from({ length: template.cells }).map((_, i) => (
                                    <div key={i} className="bg-slate-300 rounded-[1px]"></div>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Grid Section */}
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Custom Grid</h3>
                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Rows</label>
                        <input type="number" min="1" max="10" defaultValue="2" id="custom-rows" className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Cols</label>
                        <input type="number" min="1" max="10" defaultValue="2" id="custom-cols" className="w-full px-2 py-1 border border-slate-300 rounded-md text-sm" />
                    </div>
                    <button
                        onClick={() => {
                            const rows = Number((document.getElementById('custom-rows') as HTMLInputElement).value);
                            const cols = Number((document.getElementById('custom-cols') as HTMLInputElement).value);
                            if (rows > 0 && cols > 0) {
                                onSelectTemplate({
                                    id: `custom-${Date.now()}`,
                                    name: 'Custom',
                                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                                    cells: rows * cols,
                                });
                            }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors h-8"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Style Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Style</h3>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Spacing</label>
                    <input
                        type="range"
                        min="0"
                        max="40"
                        value={style.gap}
                        onChange={(e) => onStyleChange({ ...style, gap: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Border Radius</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={style.borderRadius}
                        onChange={(e) => onStyleChange({ ...style, borderRadius: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Padding</label>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={style.padding}
                        onChange={(e) => onStyleChange({ ...style, padding: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Background</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#ffffff', '#000000', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1'].map(color => (
                            <button
                                key={color}
                                onClick={() => onStyleChange({ ...style, backgroundColor: color })}
                                className={`w-6 h-6 rounded-full border border-slate-300 ${style.backgroundColor === color ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        <input
                            type="color"
                            value={style.backgroundColor}
                            onChange={(e) => onStyleChange({ ...style, backgroundColor: e.target.value })}
                            className="w-6 h-6 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Border Width</label>
                    <input
                        type="range"
                        min="0"
                        max="20"
                        value={style.borderWidth || 0}
                        onChange={(e) => onStyleChange({ ...style, borderWidth: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Border Color</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            value={style.borderColor || '#000000'}
                            onChange={(e) => onStyleChange({ ...style, borderColor: e.target.value })}
                            className="w-8 h-8 p-0 border-0 rounded-md overflow-hidden cursor-pointer"
                        />
                        <span className="text-xs text-slate-500">{style.borderColor || '#000000'}</span>
                    </div>
                </div>
            </div>

            {/* Grid Adjustments - COMMENTED OUT */}
            {/* 
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Adjust Grid</h3>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Column Widths</label>
                    <div className="space-y-2">
                        {gridSettings.colWeights.map((weight, i) => (
                            <div key={`col-${i}`} className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => onGridSettingChange('col', i, Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Row Heights</label>
                    <div className="space-y-2">
                        {gridSettings.rowWeights.map((weight, i) => (
                            <div key={`row-${i}`} className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => onGridSettingChange('row', i, Number(e.target.value))}
                                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            */}

            {/* Images Section */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Images</h3>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Upload Images"
                    >
                        <Upload size={16} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {uploadedImages.map((url, idx) => (
                        <div
                            key={idx}
                            className="aspect-square rounded-lg overflow-hidden relative group cursor-move border border-slate-200"
                            draggable
                            onDragStart={(e) => onDragStart(e, url)}
                        >
                            <img src={url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {uploadedImages.length === 0 && (
                        <div className="col-span-2 py-8 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                            No images uploaded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
