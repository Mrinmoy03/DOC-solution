import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useEffect, useState, useRef } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Sector, Label
} from 'recharts';
import { createPortal } from 'react-dom';
import { ChartToolbar } from './ChartToolbarComponent';

export const ChartNodeView = ({ node, editor, updateAttributes, selected }: NodeViewProps) => {
    const {
        tableId, chartType, labelColumnIndex, dataColumnIndices, colors, title,
        smooth, donut, showGrid, showLegend, showValues,
        backgroundColor, textColor, gridColor, xAxisLabel, yAxisLabel,
        width = 600, height = 300, x = 0, y = 0
    } = node.attrs;

    const [chartData, setChartData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showToolbar, setShowToolbar] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

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

    useEffect(() => {
        if (!editor || !tableId) return;

        const updateData = () => {
            let targetTable: any = null;
            editor.state.doc.descendants((n) => {
                if (n.type.name === 'table' && n.attrs.id === tableId) {
                    targetTable = n;
                    return false;
                }
            });

            if (targetTable) {
                const rawData: any[] = [];
                const extractedHeaders: string[] = [];

                targetTable.content.forEach((row: any, rowIndex: number) => {
                    const rowValues: string[] = [];
                    row.content.forEach((cell: any) => rowValues.push(cell.textContent));

                    if (rowIndex === 0) {
                        rowValues.forEach(h => extractedHeaders.push(h));
                    } else {
                        const dataPoint: any = {};
                        dataPoint['name'] = rowValues[labelColumnIndex] || `Row ${rowIndex}`;
                        dataColumnIndices.forEach((colIndex: number) => {
                            const val = parseFloat(rowValues[colIndex]);
                            const key = extractedHeaders[colIndex] || `Col ${colIndex}`;
                            dataPoint[key] = isNaN(val) ? 0 : val;
                        });
                        rawData.push(dataPoint);
                    }
                });

                setHeaders(extractedHeaders);
                setChartData(rawData);
            }
        };

        updateData();
        const handleUpdate = () => updateData();
        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, tableId, labelColumnIndex, dataColumnIndices]);

    // Dragging handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('.resize-handle')) return;

        // Don't start drag if clicking on internal interactive elements (legends, etc) 
        // but here we mostly have SVG elements.
        // We want to drag the whole chart container.

        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        setDragStart({ x: e.clientX - x, y: e.clientY - y });
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowToolbar(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            updateAttributes({ x: newX, y: newY });
        };

        const handleMouseUp = () => setIsDragging(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, updateAttributes]);

    // Resizing handlers
    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({ x: e.clientX, y: e.clientY, width, height });
    };

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            const newWidth = Math.max(300, resizeStart.width + deltaX);
            const newHeight = Math.max(200, resizeStart.height + deltaY);
            updateAttributes({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => setIsResizing(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, resizeStart, updateAttributes]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowToolbar(false);
            }
        };

        if (showToolbar) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showToolbar]);

    const handleUpdateChart = (attrs: Record<string, any>) => {
        updateAttributes(attrs);
    };

    const renderChart = () => {
        const dataKeys = dataColumnIndices.map((idx: number) => headers[idx] || `Col ${idx}`);
        const tickStyle = { fill: textColor || '#666', fontSize: 12 };
        const axisLineStyle = { stroke: gridColor || '#e0e0e0' };

        switch (chartType) {
            case 'bar':
                if (chartData.length === 0) return null;
                return (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor || '#e0e0e0'} />}
                        <XAxis dataKey="name" tick={tickStyle} axisLine={axisLineStyle} tickLine={false}>
                            {xAxisLabel && <Label value={xAxisLabel} offset={-5} position="insideBottom" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold' }} />}
                        </XAxis>
                        <YAxis tick={tickStyle} axisLine={axisLineStyle} tickLine={false}>
                            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold', textAnchor: 'middle' }} />}
                        </YAxis>
                        <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key: string, index: number) => (
                            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} label={showValues ? { position: 'top', fill: textColor || '#666', fontSize: 11 } : false} />
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor || '#e0e0e0'} />}
                        <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={axisLineStyle}>
                            {xAxisLabel && <Label value={xAxisLabel} offset={-5} position="insideBottom" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold' }} />}
                        </XAxis>
                        <YAxis tick={tickStyle} tickLine={false} axisLine={axisLineStyle}>
                            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold', textAnchor: 'middle' }} />}
                        </YAxis>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key: string, index: number) => (
                            <Line
                                key={key}
                                type={smooth ? "monotone" : "linear"}
                                dataKey={key}
                                stroke={colors[index % colors.length] || '#8884d8'}
                                strokeWidth={3}
                                connectNulls
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                label={showValues ? { position: 'top', dy: -10, fill: textColor || '#666', fontSize: 11 } : false}
                            />
                        ))}
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <defs>
                            {dataKeys.map((_key: string, idx: number) => (
                                <linearGradient key={`color-${idx}`} id={`view-color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[idx % colors.length] || '#8884d8'} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={colors[idx % colors.length] || '#8884d8'} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor || '#e0e0e0'} />}
                        <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={axisLineStyle}>
                            {xAxisLabel && <Label value={xAxisLabel} offset={-5} position="insideBottom" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold' }} />}
                        </XAxis>
                        <YAxis domain={[0, 'auto']} tick={tickStyle} tickLine={false} axisLine={axisLineStyle}>
                            {yAxisLabel && <Label value={yAxisLabel} angle={-90} position="insideLeft" style={{ fill: textColor || '#666', fontSize: 14, fontWeight: 'bold', textAnchor: 'middle' }} />}
                        </YAxis>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        {showLegend && <Legend />}
                        {dataKeys.map((key: string, index: number) => (
                            <Area
                                key={key}
                                type={smooth ? "monotone" : "linear"}
                                dataKey={key}
                                stackId="1"
                                connectNulls
                                stroke={colors[index % colors.length] || '#8884d8'}
                                fill={`url(#view-color-${index})`}
                                fillOpacity={1}
                                strokeWidth={2}
                                label={showValues ? { position: 'top', fill: textColor || '#666', fontSize: 11 } : false}
                            />
                        ))}
                    </AreaChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        {dataKeys.map((key: string, index: number) => {
                            // @ts-ignore
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
            default:
                return null;
        }
    };

    return (
        <NodeViewWrapper
            ref={containerRef}
            className={`chart-node-view my-4 p-4 border-2 ${selected ? 'border-blue-500' : 'border-gray-200'} rounded-lg shadow-sm select-none relative`}
            data-type="chart"
            style={{
                backgroundColor: backgroundColor || '#ffffff',
                width: `${width}px`,
                transform: `translate(${x}px, ${y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {showToolbar && createPortal(
                <ChartToolbar
                    onUpdateChart={handleUpdateChart}
                    onClose={() => setShowToolbar(false)}
                    currentAttrs={{
                        title, chartType, smooth, donut, showGrid, showLegend, showValues,
                        backgroundColor, textColor, gridColor, xAxisLabel, yAxisLabel, colors
                    }}
                />,
                document.body
            )}
            <div className="flex flex-col items-center">
                {title && <h3 className="text-lg font-semibold mb-2" style={{ color: textColor || '#374151' }}>{title}</h3>}
                <div style={{ width: '100%', height: `${height}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {chartData.length > 0 ? (renderChart() || <div>No Chart Type Selected</div>) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                <p>No Data Available</p>
                                <p className="text-sm">Link this chart to a table to see data</p>
                            </div>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
            {selected && (
                <div
                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl z-10"
                    onMouseDown={handleResizeStart}
                />
            )}
        </NodeViewWrapper>
    );
};
