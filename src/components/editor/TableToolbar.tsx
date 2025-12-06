import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, PaintBucket } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface TableToolbarProps {
    editor: Editor;
}

export const TableToolbar = ({ editor }: TableToolbarProps) => {
    const [position, setPosition] = useState({ x: 100, y: 300 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showCellColorPicker, setShowCellColorPicker] = useState(false);
    const [showRowColorPicker, setShowRowColorPicker] = useState(false);
    const [showColumnColorPicker, setShowColumnColorPicker] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.draggable-toolbar-handle')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStart]);

    const colors = [
        '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF',
        '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444',
        '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B',
        '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981',
        '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6',
        '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1',
    ];

    const addRowAbove = () => {
        editor.chain().focus().addRowBefore().run();
    };

    const addColumnLeft = () => {
        editor.chain().focus().addColumnBefore().run();
    };

    const deleteRow = () => {
        editor.chain().focus().deleteRow().run();
    };

    const deleteColumn = () => {
        editor.chain().focus().deleteColumn().run();
    };

    const deleteTable = () => {
        editor.chain().focus().deleteTable().run();
    };

    const setCellColor = (color: string) => {
        // Apply background color to selected cell(s) using HTML style
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Find the table cell node
        for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                editor.chain().focus().updateAttributes(node.type.name, {
                    style: `background-color: ${color};`
                }).run();
                break;
            }
        }
        setShowCellColorPicker(false);
    };

    const setRowColor = (color: string) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'tableRow') {
                const rowPos = $from.before(d);
                const tr = state.tr;

                node.forEach((cell, offset) => {
                    const cellPos = rowPos + offset + 1;
                    tr.setNodeMarkup(cellPos, null, {
                        ...cell.attrs,
                        style: `background-color: ${color};`
                    });
                });

                editor.view.dispatch(tr);
                break;
            }
        }
        setShowRowColorPicker(false);
    };

    const setColumnColor = (color: string) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Find the column index of the current cell
        let columnIndex = 0;
        let tableNode = null;
        let tablePos = 0;

        for (let d = $from.depth; d > 0; d--) {
            const node = $from.node(d);
            if (node.type.name === 'tableRow') {
                let currentIndex = 0;
                let found = false;
                node.forEach((cell, offset) => {
                    const cellStart = $from.before(d) + offset + 1;
                    const cellEnd = cellStart + cell.nodeSize;
                    if ($from.pos >= cellStart && $from.pos < cellEnd && !found) {
                        columnIndex = currentIndex;
                        found = true;
                    }
                    currentIndex++;
                });
            }
            if (node.type.name === 'table') {
                tableNode = node;
                tablePos = $from.before(d);
            }
        }

        if (!tableNode) return;

        const tr = state.tr;
        let rowIndex = 0;

        tableNode.forEach((row, rowOffset) => {
            if (row.type.name === 'tableRow') {
                let currentCol = 0;
                row.forEach((cell, cellOffset) => {
                    if (currentCol === columnIndex) {
                        const cellPos = tablePos + rowOffset + cellOffset + 2;
                        tr.setNodeMarkup(cellPos, null, {
                            ...cell.attrs,
                            style: `background-color: ${color};`
                        });
                    }
                    currentCol++;
                });
                rowIndex++;
            }
        });

        editor.view.dispatch(tr);
        setShowColumnColorPicker(false);
    };

    return (
        <div
            ref={toolbarRef}
            className={`fixed bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-1.5 z-50 ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-auto'}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '200px',
                height: '300px',
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="draggable-toolbar-handle bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded text-xs text-center font-semibold cursor-grab active:cursor-grabbing mb-2">
                ⋮⋮ Table Format
            </div>

            <div className="flex flex-col gap-1">
                {/* Add Row */}
                <button
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 transition-all"
                    onClick={addRowAbove}
                    title="Add Row"
                >
                    <Plus size={14} className="text-purple-600" />
                    <span className="text-xs font-medium">Add Row</span>
                </button>

                {/* Delete Row */}
                <button
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-all"
                    onClick={deleteRow}
                    title="Delete Row"
                >
                    <Trash2 size={14} className="text-red-600" />
                    <span className="text-xs font-medium">Delete Row</span>
                </button>

                {/* Add Column */}
                <button
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-all"
                    onClick={addColumnLeft}
                    title="Add Column"
                >
                    <Plus size={14} className="text-blue-600" />
                    <span className="text-xs font-medium">Add Column</span>
                </button>

                {/* Delete Column */}
                <button
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-all"
                    onClick={deleteColumn}
                    title="Delete Column"
                >
                    <Trash2 size={14} className="text-red-600" />
                    <span className="text-xs font-medium">Delete Column</span>
                </button>

                {/* Cell Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-all w-full"
                        onClick={() => setShowCellColorPicker(!showCellColorPicker)}
                        title="Cell Color"
                    >
                        <PaintBucket size={14} className="text-green-600" />
                        <span className="text-xs font-medium">Cell Color</span>
                    </button>
                    {showCellColorPicker && (
                        <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 w-48">
                            <div className="text-[9px] font-semibold text-gray-700 mb-1">Cell Color</div>
                            <div className="grid grid-cols-6 gap-1 mb-1.5">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-5 h-5 cursor-pointer border border-gray-200 rounded hover:scale-110 transition-all"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setCellColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-all"
                                onClick={() => setShowCellColorPicker(false)}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Row Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-center gap-1 px-2 py-1.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 transition-all w-full"
                        onClick={() => setShowRowColorPicker(!showRowColorPicker)}
                        title="Row Color"
                    >
                        <PaintBucket size={14} className="text-purple-600" />
                        <span className="text-xs font-medium">Row Color</span>
                    </button>
                    {showRowColorPicker && (
                        <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 w-48">
                            <div className="text-[9px] font-semibold text-gray-700 mb-1">Row Color</div>
                            <div className="grid grid-cols-6 gap-1 mb-1.5">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-5 h-5 cursor-pointer border border-gray-200 rounded hover:scale-110 transition-all"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setRowColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-all"
                                onClick={() => setShowRowColorPicker(false)}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Column Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-center p-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-all w-full"
                        onClick={() => setShowColumnColorPicker(!showColumnColorPicker)}
                        title="Column Color"
                    >
                        <PaintBucket size={10} className="text-blue-600" />
                        <span className="text-[8px] ml-0.5">Col</span>
                    </button>
                    {showColumnColorPicker && (
                        <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 w-48">
                            <div className="text-[9px] font-semibold text-gray-700 mb-1">Column Color</div>
                            <div className="grid grid-cols-6 gap-1 mb-1.5">
                                {colors.map((color) => (
                                    <div
                                        key={color}
                                        className="w-5 h-5 cursor-pointer border border-gray-200 rounded hover:scale-110 transition-all"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setColumnColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                            <button
                                className="w-full text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded transition-all"
                                onClick={() => setShowColumnColorPicker(false)}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Table */}
                <button
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-red-500 hover:bg-red-600 rounded border border-red-600 transition-all mt-2"
                    onClick={deleteTable}
                    title="Delete Table"
                >
                    <Trash2 size={14} className="text-white" />
                    <span className="text-xs text-white font-bold">Delete Table</span>
                </button>
            </div>
        </div>
    );
};
