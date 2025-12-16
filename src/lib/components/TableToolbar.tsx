
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, PaintBucket, Sigma, GripHorizontal } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface TableToolbarProps {
    editor: Editor;
    onInsertFormula: () => void;
}

export const TableToolbar = ({ editor, onInsertFormula }: TableToolbarProps) => {
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
            className={`fixed bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-2 z-[100] transition-shadow duration-200 ${isDragging ? 'cursor-grabbing ring-2 ring-blue-400 opacity-95' : 'cursor-auto hover:shadow-3xl'} flex flex-col gap-2`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '210px',
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="draggable-toolbar-handle flex items-center justify-between bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Table Tools</span>
                <GripHorizontal size={14} className="text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
                {/* Add Row */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white hover:bg-blue-50 text-slate-700 rounded-md border border-slate-200 transition-all text-xs font-medium shadow-sm"
                    onClick={addRowAbove}
                    title="Add Row"
                >
                    <Plus size={14} className="text-blue-500" />
                    Row
                </button>

                {/* Add Column */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 rounded-md border border-slate-200 transition-all text-xs font-medium shadow-sm"
                    onClick={addColumnLeft}
                    title="Add Column"
                >
                    <Plus size={14} className="text-emerald-500" />
                    Col
                </button>

                {/* Delete Row */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white hover:bg-red-50 text-slate-700 rounded-md border border-slate-200 transition-all text-xs font-medium shadow-sm"
                    onClick={deleteRow}
                    title="Delete Row"
                >
                    <Trash2 size={14} className="text-red-500" />
                    Row
                </button>

                {/* Delete Column */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white hover:bg-red-50 text-slate-700 rounded-md border border-slate-200 transition-all text-xs font-medium shadow-sm"
                    onClick={deleteColumn}
                    title="Delete Column"
                >
                    <Trash2 size={14} className="text-red-500" />
                    Col
                </button>
            </div>

            <div className="h-px bg-slate-200 my-0.5"></div>

            {/* Colors & Formula */}
            <div className="flex flex-col gap-1.5">
                {/* Cell Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-between px-2 py-1.5 w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm"
                        onClick={() => {
                            setShowCellColorPicker(!showCellColorPicker);
                            setShowRowColorPicker(false);
                            setShowColumnColorPicker(false);
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            <PaintBucket size={14} className="text-indigo-500" />
                            Cell Color
                        </span>
                    </button>
                    {showCellColorPicker && (
                        <div className="absolute left-full top-0 ml-2 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-[110] w-48 animate-in fade-in zoom-in-95 duration-100">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 px-0.5">Select Color</div>
                            <div className="grid grid-cols-6 gap-1">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className="w-5 h-5 rounded hover:scale-110 hover:shadow-sm transition-transform border border-slate-200 cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setCellColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Row Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-between px-2 py-1.5 w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm"
                        onClick={() => {
                            setShowRowColorPicker(!showRowColorPicker);
                            setShowCellColorPicker(false);
                            setShowColumnColorPicker(false);
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            <PaintBucket size={14} className="text-violet-500" />
                            Row Color
                        </span>
                    </button>
                    {showRowColorPicker && (
                        <div className="absolute left-full top-0 ml-2 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-[110] w-48 animate-in fade-in zoom-in-95 duration-100">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 px-0.5">Row Color</div>
                            <div className="grid grid-cols-6 gap-1">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className="w-5 h-5 rounded hover:scale-110 hover:shadow-sm transition-transform border border-slate-200 cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setRowColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Column Color */}
                <div className="relative">
                    <button
                        className="flex items-center justify-between px-2 py-1.5 w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-sm"
                        onClick={() => {
                            setShowColumnColorPicker(!showColumnColorPicker);
                            setShowCellColorPicker(false);
                            setShowRowColorPicker(false);
                        }}
                    >
                        <span className="flex items-center gap-1.5">
                            <PaintBucket size={14} className="text-sky-500" />
                            Col Color
                        </span>
                    </button>
                    {showColumnColorPicker && (
                        <div className="absolute left-full top-0 ml-2 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-[110] w-48 animate-in fade-in zoom-in-95 duration-100">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 px-0.5">Col Color</div>
                            <div className="grid grid-cols-6 gap-1">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className="w-5 h-5 rounded hover:scale-110 hover:shadow-sm transition-transform border border-slate-200 cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        onClick={() => setColumnColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-200 my-0.5"></div>

                {/* Formula Button */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md border border-indigo-200 transition-all text-xs font-semibold shadow-sm"
                    onClick={onInsertFormula}
                    title="Advanced Formula"
                >
                    <Sigma size={14} className="" />
                    Functions
                </button>

                {/* Delete Table */}
                <button
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 transition-all text-xs font-semibold shadow-sm mt-1"
                    onClick={deleteTable}
                    title="Delete Table"
                >
                    <Trash2 size={14} className="" />
                    Delete Table
                </button>
            </div>
        </div>
    );
};
