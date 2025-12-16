import { useState, useEffect, useMemo } from 'react';
import { X, Calculator, ArrowRight, HelpCircle } from 'lucide-react';
import { scanTable, evaluateAdvancedFormula, type TableGrid, type CellData } from '../../lib/utils/SmartTableEngine';

interface AdvancedFormulaModalProps {
    onClose: () => void;
    onInsert: (result: string | number, formula?: string) => void;
    tableData: string[][]; // Raw data from editor
    currentPosition: { row: number, col: number };
}

export const AdvancedFormulaModal = ({ onClose, onInsert, tableData, currentPosition }: AdvancedFormulaModalProps) => {
    const [formula, setFormula] = useState('=SUM(');
    const [preview, setPreview] = useState<{ result: string | number, details: string } | null>(null);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);

    const [selectionStart, setSelectionStart] = useState<CellData | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Initialize Smart Grid
    const grid: TableGrid = useMemo(() => scanTable(tableData), [tableData]);

    // Live Evaluate
    useEffect(() => {
        if (formula.length > 2) {
            const res = evaluateAdvancedFormula(formula, currentPosition, grid);
            setPreview(res);
        } else {
            setPreview(null);
        }
    }, [formula, currentPosition, grid]);

    // Selection Logic
    const handleMouseDown = (cell: CellData) => {
        setIsSelecting(true);
        setSelectionStart(cell);

        // Start building range or single cell
        const ref = cell.id;
        setFormula(prev => {
            // Smartly append separator if needed
            if (prev.endsWith(')') || (prev.length > 0 && !prev.endsWith('(') && !prev.match(/[\+\-\*\/\,\:]$/))) {
                return prev + ',' + ref;
            }
            return prev + ref;
        });
        setSelectedCell(ref);
    };

    const handleMouseEnter = (cell: CellData) => {
        if (isSelecting && selectionStart) {
            // Update range in formula
            // Logic: simple replace last ref with new range
            // E.g. "SUM(A1" -> "SUM(A1:B2"

            setFormula(prev => {
                const parts = prev.split(/([\,\(\)\+\-\*\/])/); // Split by symbols
                const lastPart = parts[parts.length - 1];

                // If currently editing a range or single cell at end
                if (lastPart.includes(':')) {
                    // Update end of range
                    const rangeStart = lastPart.split(':')[0];
                    return prev.slice(0, -lastPart.length) + rangeStart + ':' + cell.id;
                } else if (lastPart === selectionStart.id) {
                    // Turn single cell into range
                    return prev + ':' + cell.id;
                }

                return prev;
            });
            setSelectedCell(`${selectionStart.id}:${cell.id}`);
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setSelectionStart(null);
    };

    const handleApply = () => {
        if (preview && typeof preview.result !== 'string') {
            onInsert(preview.result, formula); // Pass formula too!
        } else if (preview && typeof preview.result === 'string' && !preview.result.startsWith('!ERR')) {
            onInsert(preview.result, formula);
        } else {
            const res = evaluateAdvancedFormula(formula, currentPosition, grid);
            onInsert(res.result, formula);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onMouseUp={handleMouseUp}>
            <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[650px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Advanced Formula Builder</h2>
                            <p className="text-xs text-emerald-100 opacity-80">Drag to Select • Smart Fill Ready</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Controls */}
                    <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">

                        {/* Formula Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formula Expression</label>
                            <input
                                type="text"
                                value={formula}
                                onChange={(e) => setFormula(e.target.value)}
                                className="w-full p-3 font-mono text-lg border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                placeholder="=SUM(A1:B2)"
                                autoFocus
                            />
                        </div>

                        {/* Quick Functions */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Functions</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'PRODUCT'].map(fn => (
                                    <button
                                        key={fn}
                                        onClick={() => setFormula(`=${fn}(`)}
                                        className="px-3 py-2 bg-white border border-gray-200 rounded hover:bg-emerald-50 hover:border-emerald-300 text-sm font-medium text-gray-700 transition-colors text-left flex items-center gap-2 shadow-sm"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        {fn}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 leading-relaxed">
                            <strong>💡 Pro Tip:</strong> Click and drag across the grid to select a cell range (like A1:B3) instantly.
                        </div>

                        {/* Preview Card */}
                        <div className={`mt-auto p-4 rounded-lg border shadow-sm ${preview?.result === 0 || String(preview?.result).startsWith('!ERR') ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-emerald-200'}`}>
                            <div className="text-xs font-semibold text-gray-500 mb-1">LIVE RESULT</div>
                            <div className="text-2xl font-bold text-gray-900 font-mono">
                                {preview ? preview.result : '---'}
                            </div>
                            {preview && <div className="text-xs text-gray-600 mt-2 break-words leading-tight opacity-80">{preview.details}</div>}
                        </div>

                        <button
                            onClick={handleApply}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Insert Result <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Right Panel: Visual Grid */}
                    <div className="flex-1 bg-gray-100 p-6 overflow-auto relative select-none">
                        <div className="bg-white shadow-lg border border-gray-300 rounded overflow-hidden">
                            {/* Grid Header */}
                            <div className="flex border-b border-gray-300 bg-gray-50">
                                <div className="w-10 shrink-0 border-r border-gray-300 bg-gray-100"></div> {/* Corner */}
                                {Array.from({ length: grid.cols }).map((_, i) => (
                                    <div key={i} className="flex-1 min-w-[80px] py-1 text-center text-xs font-bold text-gray-600 border-r border-gray-200 last:border-r-0 uppercase">
                                        {grid.flatCells[`${String.fromCharCode(65 + i)}1`]?.id.replace(/[0-9]/g, '') || String.fromCharCode(65 + i)}
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body */}
                            {grid.cells.map((row: CellData[], rIdx: number) => (
                                <div key={rIdx} className="flex border-b border-gray-200 last:border-b-0 h-10">
                                    {/* Row Number */}
                                    <div className="w-10 shrink-0 bg-gray-50 border-r border-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {rIdx + 1}
                                    </div>
                                    {/* Cells */}
                                    {row.map((cell: CellData, cIdx: number) => {
                                        const isCurrent = rIdx === currentPosition.row && cIdx === currentPosition.col;

                                        // Visual Selection Check
                                        let isSelected = false;
                                        if (selectedCell) {
                                            if (selectedCell.includes(':')) {
                                                // Range Check logic would go here ideally, simplest is pure string match for now
                                                // Real implementation uses the logic below
                                                const [startRef, endRef] = selectedCell.split(':');
                                                const startCell = grid.flatCells[startRef];
                                                const endCell = grid.flatCells[endRef];

                                                if (startCell && endCell) {
                                                    const minRow = Math.min(startCell.row, endCell.row);
                                                    const maxRow = Math.max(startCell.row, endCell.row);
                                                    const minCol = Math.min(startCell.col, endCell.col);
                                                    const maxCol = Math.max(startCell.col, endCell.col);

                                                    isSelected = (cell.row >= minRow && cell.row <= maxRow && cell.col >= minCol && cell.col <= maxCol);
                                                }
                                            } else {
                                                isSelected = selectedCell === cell.id;
                                            }
                                        }

                                        const isNumeric = cell.type === 'number';

                                        return (
                                            <div
                                                key={cell.id}
                                                onMouseDown={() => !isCurrent && handleMouseDown(cell)}
                                                onMouseEnter={() => handleMouseEnter(cell)}
                                                className={`
                                                    flex-1 min-w-[80px] border-r border-gray-100 last:border-r-0 px-2 flex items-center justify-end text-sm relative
                                                    ${isCurrent ? 'bg-blue-100 ring-2 ring-inset ring-blue-500 cursor-default' : 'cursor-cell hover:bg-emerald-50'}
                                                    ${isSelected ? 'bg-emerald-100 ring-1 ring-inset ring-emerald-400' : ''}
                                                    transition-colors
                                                `}
                                                title={`Cell ${cell.id}: ${cell.value}`}
                                            >
                                                <span className={`${isNumeric ? 'text-emerald-700 font-mono font-bold' : 'text-gray-400 italic'}`}>
                                                    {cell.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-4 right-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow border border-gray-200 text-xs text-gray-500 flex items-center gap-1.5">
                            <HelpCircle size={12} />
                            <span>Click and drag to select range</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
