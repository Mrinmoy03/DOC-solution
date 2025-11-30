import { useState } from 'react';
import { X } from 'lucide-react';

interface InsertTableModalProps {
    onClose: () => void;
    onInsert: (rows: number, cols: number) => void;
}

export const InsertTableModal = ({ onClose, onInsert }: InsertTableModalProps) => {
    const [hoveredRows, setHoveredRows] = useState(0);
    const [hoveredCols, setHoveredCols] = useState(0);

    const MAX_ROWS = 10;
    const MAX_COLS = 10;

    const handleCellHover = (row: number, col: number) => {
        setHoveredRows(row);
        setHoveredCols(col);
    };

    const handleInsert = () => {
        if (hoveredRows > 0 && hoveredCols > 0) {
            onInsert(hoveredRows, hoveredCols);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[350px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Insert table</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 text-center text-sm font-medium text-gray-600">
                        {hoveredRows > 0 && hoveredCols > 0 ? `${hoveredCols} x ${hoveredRows}` : 'Select table size'}
                    </div>

                    <div
                        className="grid gap-1 mx-auto w-fit"
                        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 20px)` }}
                        onMouseLeave={() => { setHoveredRows(0); setHoveredCols(0); }}
                    >
                        {Array.from({ length: MAX_ROWS }).map((_, rowIndex) => (
                            Array.from({ length: MAX_COLS }).map((_, colIndex) => {
                                const r = rowIndex + 1;
                                const c = colIndex + 1;
                                const isActive = r <= hoveredRows && c <= hoveredCols;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`w-5 h-5 border border-gray-300 rounded-sm cursor-pointer transition-colors ${isActive ? 'bg-blue-500 border-blue-600' : 'bg-white hover:bg-gray-50'}`}
                                        onMouseEnter={() => handleCellHover(r, c)}
                                        onClick={handleInsert}
                                    />
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
