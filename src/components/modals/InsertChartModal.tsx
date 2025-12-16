
import { useState, useEffect, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { X, BarChart2, PieChart as PieChartIcon, Activity, TrendingUp, Grid, Palette } from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector
} from 'recharts';

interface InsertChartModalProps {
    editor: Editor | null;
    onClose: () => void;
    onInsert: (config: any) => void;
}

interface TableData {
    id: string;
    name: string;
    headers: string[];
    rows: string[][];
}

const COLORS = [
    ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'], // Cool
    ['#ff7c43', '#f95d6a', '#d45087', '#a05195', '#665191'], // Warm
    ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'], // Vivid
    ['#2c3e50', '#e74c3c', '#ecf0f1', '#3498db', '#2980b9'], // Professional
    ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'], // Material
    ['#FF9800', '#FFC107', '#FFEB3B', '#CDDC39', '#8BC34A'], // Citrus
    ['#607D8B', '#9E9E9E', '#795548', '#FF5722', '#FF9800'], // Earthy
    ['#009688', '#4DB6AC', '#80CBC4', '#B2DFDB', '#E0F2F1'], // Teal Gradient
    ['#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9'], // Indigo Gradient
];

export const InsertChartModal = ({ editor, onClose, onInsert }: InsertChartModalProps) => {
    const [tables, setTables] = useState<TableData[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string>('');
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
    const [labelColumnIndex, setLabelColumnIndex] = useState<number>(0);
    const [selectedDataColumns, setSelectedDataColumns] = useState<number[]>([1]);
    const [colorTheme, setColorTheme] = useState<number>(0);
    const [chartTitle, setChartTitle] = useState('');
    const [smooth, setSmooth] = useState(true);
    const [donut, setDonut] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [showValues, setShowValues] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    // Load tables from editor
    useEffect(() => {
        if (!editor) return;

        // 1. Ensure all tables have IDs
        let tr = editor.state.tr;
        let modified = false;

        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'table') {
                if (!node.attrs.id) {
                    const id = `table-${Math.random().toString(36).substr(2, 9)}`;
                    tr = tr.setNodeAttribute(pos, 'id', id);
                    modified = true;
                }
            }
        });

        if (modified) {
            editor.view.dispatch(tr);
        }

        // 2. Scan (updated) tables
        const foundTables: TableData[] = [];
        // Use tr.doc to scan the document state AFTER potential ID assignment
        tr.doc.descendants((node) => {
            if (node.type.name === 'table') {
                const id = node.attrs.id;
                if (!id) return;

                // Extract headers (first row) and preview data
                const rows: string[][] = [];
                node.content.forEach((row: any) => {
                    const rowData: string[] = [];
                    row.content.forEach((cell: any) => rowData.push(cell.textContent));
                    rows.push(rowData);
                });

                if (rows.length > 0) {
                    foundTables.push({
                        id,
                        name: `Table ${foundTables.length + 1} (${rows.length} rows, ${rows[0].length} cols)`,
                        headers: rows[0],
                        rows: rows.slice(1) // Exclude header for data
                    });
                }
            }
        });

        setTables(foundTables);
        if (foundTables.length > 0) {
            // Only reset selection if not already set or invalid
            if (!selectedTableId || !foundTables.find(t => t.id === selectedTableId)) {
                setSelectedTableId(foundTables[0].id);
            }
        }
    }, [editor]);

    const currentTable = useMemo(() => tables.find(t => t.id === selectedTableId), [tables, selectedTableId]);

    const chartData = useMemo(() => {
        if (!currentTable) return [];
        return currentTable.rows.map((row, idx) => {
            const item: any = { name: row[labelColumnIndex] || `Row ${idx + 1}` };
            selectedDataColumns.forEach(colIdx => {
                const head = currentTable.headers[colIdx] || `Col ${colIdx}`;
                const val = parseFloat(row[colIdx]);
                item[head] = isNaN(val) ? 0 : val;
            });
            return item;
        });
    }, [currentTable, labelColumnIndex, selectedDataColumns]);

    const handleInsert = () => {
        onInsert({
            tableId: selectedTableId,
            chartType,
            labelColumnIndex,
            dataColumnIndices: selectedDataColumns,
            colors: COLORS[colorTheme],
            title: chartTitle,
            smooth,
            donut,
            showGrid,
            showLegend,
            showValues
        });
        onClose();
    };

    const toggleDataColumn = (idx: number) => {
        if (selectedDataColumns.includes(idx)) {
            // Don't allow empty selection
            if (selectedDataColumns.length > 1) {
                setSelectedDataColumns(prev => prev.filter(i => i !== idx));
            }
        } else {
            setSelectedDataColumns(prev => [...prev, idx]);
        }
    };

    // Auto-select single column when switching to Pie (OPTIONAL now, we support multi-series)
    // removed useEffect restriction

    const renderActiveShape = (props: any) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={16} fontWeight="bold">
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Value: ${value}`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    const renderPreview = () => {
        const colors = COLORS[colorTheme];
        const dataKeys = selectedDataColumns.map(idx => currentTable?.headers[idx] || `Col ${idx}`);

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />}
                        <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
                        <YAxis tick={{ fill: '#666', fontSize: 12 }} axisLine={{ stroke: '#e0e0e0' }} tickLine={false} />
                        <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} label={showValues ? { position: 'top' } : false} />
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={chartData}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />}
                        <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                        <YAxis tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, i) => (
                            <Line
                                key={key}
                                type={smooth ? "monotone" : "linear"}
                                dataKey={key}
                                stroke={colors[i % colors.length]}
                                strokeWidth={3}
                                connectNulls
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                label={showValues ? { position: 'top', dy: -10 } : false}
                            />
                        ))}
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={chartData}>
                        <defs>
                            {dataKeys.map((_key, idx) => (
                                <linearGradient key={`color-${idx}`} id={`idx-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />}
                        <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                        <YAxis tick={{ fill: '#666', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e0e0e0' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key, i) => (
                            <Area
                                key={key}
                                type={smooth ? "monotone" : "linear"}
                                dataKey={key}
                                stackId="1"
                                connectNulls
                                stroke={colors[i % colors.length]}
                                fill={`url(#idx-${i})`}
                                fillOpacity={1}
                                strokeWidth={2}
                                label={showValues ? { position: 'top' } : false}
                            />
                        ))}
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        {dataKeys.map((key: string, index: number) => {
                            const PieAny = Pie as any;
                            return (
                                <PieAny
                                    key={key}
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    onMouseEnter={onPieEnter}
                                    data={chartData}
                                    dataKey={key}
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={donut ? 60 : 0}
                                    outerRadius={80}
                                    paddingAngle={donut ? 5 : 0}
                                    cornerRadius={donut ? 5 : 0}
                                    fill={colors[index % colors.length]}
                                >
                                    {chartData.map((_entry: any, cellIndex: number) => (
                                        <Cell key={`cell-${cellIndex}`} fill={colors[cellIndex % colors.length] || '#000'} />
                                    ))}
                                </PieAny>
                            );
                        })}
                        <Tooltip />
                        {showLegend && <Legend />}
                    </PieChart>
                );
            default: return null;
        }
    };

    if (!tables.length) {
        return (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px] text-center">
                    <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Tables Found</h3>
                    <p className="text-gray-600 mb-6">Please insert a table and add some data before creating a chart.</p>
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center overflow-y-auto py-10">
            <div className="bg-white rounded-xl shadow-2xl w-[900px] max-w-[95vw] flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="text-blue-600" />
                        Insert Advanced Chart
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar Configuration */}
                    <div className="w-full md:w-[350px] bg-slate-50 border-r p-5 overflow-y-auto space-y-6">

                        {/* 1. Data Source */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">1. Data Source</label>
                            <select
                                value={selectedTableId}
                                onChange={(e) => setSelectedTableId(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                                {tables.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Axis Configuration */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">2. Axis Data</label>

                            {/* X-Axis */}
                            <div>
                                <div className="text-sm font-medium text-slate-700 mb-1">
                                    {chartType === 'pie' ? 'Slice Labels (Name)' : 'X-Axis (Labels)'}
                                </div>
                                <select
                                    value={labelColumnIndex}
                                    onChange={(e) => setLabelColumnIndex(Number(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                                >
                                    {currentTable?.headers.map((h, i) => (
                                        <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Y-Axis */}
                            <div>
                                <div className="text-sm font-medium text-slate-700 mb-1">
                                    {chartType === 'pie' ? 'Slice Size (Values)' : 'Y-Axis (Values)'}
                                </div>
                                <div className="space-y-1 bg-white border border-slate-300 rounded-lg p-2 max-h-[150px] overflow-y-auto">
                                    {currentTable?.headers.map((h, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <input
                                                type={'checkbox'}
                                                id={`col-${i}`}
                                                checked={selectedDataColumns.includes(i)}
                                                onChange={() => toggleDataColumn(i)}
                                                disabled={i === labelColumnIndex}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`col-${i}`} className={`text-sm ${i === labelColumnIndex ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}>
                                                {h || `Column ${i + 1}`}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. Chart Customization */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">3. Customization</label>

                            <input
                                type="text"
                                placeholder="Chart Title (Optional)"
                                value={chartTitle}
                                onChange={(e) => setChartTitle(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm mb-2"
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'bar', icon: BarChart2, label: 'Bar' },
                                    { id: 'line', icon: TrendingUp, label: 'Line' },
                                    { id: 'pie', icon: PieChartIcon, label: 'Pie' },
                                    { id: 'area', icon: Activity, label: 'Area' },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setChartType(type.id as any)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${chartType === type.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                                    >
                                        <type.icon size={20} className="mb-1" />
                                        <span className="text-[10px] uppercase font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>


                            <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                                {(chartType === 'line' || chartType === 'area') && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={smooth}
                                            onChange={(e) => setSmooth(e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        Smooth Curves
                                    </label>
                                )}
                                {chartType === 'pie' && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={donut}
                                            onChange={(e) => setDonut(e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        Donut Chart
                                    </label>
                                )}
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showGrid}
                                        onChange={(e) => setShowGrid(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Show Grid
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showLegend}
                                        onChange={(e) => setShowLegend(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Show Legend
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showValues}
                                        onChange={(e) => setShowValues(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Show Values
                                </label>
                            </div>
                        </div>

                        {/* 4. Theme */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-2">
                                <Palette size={14} /> Color Theme
                            </label>
                            <div className="flex gap-2">
                                {COLORS.map((theme, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setColorTheme(idx)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center overflow-hidden rotate-45 transition-all ${colorTheme === idx ? 'border-blue-600 ring-2 ring-blue-100 scale-110' : 'border-transparent'}`}
                                    >
                                        <div className="flex w-full h-full">
                                            {theme.map(c => <div key={c} style={{ backgroundColor: c }} className="flex-1 h-full" />)}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-1 bg-slate-100 p-8 flex flex-col">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
                            <h3 className="text-center font-bold text-slate-700 mb-4">{chartTitle || 'Chart Preview'}</h3>
                            <div className="flex-1 w-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {renderPreview() || <div>Loading...</div>}
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleInsert}
                                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Activity size={18} />
                                Insert Chart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
