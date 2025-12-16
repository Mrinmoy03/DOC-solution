/**
 * Smart Table Engine 🚀
 * Advanced architecture for Excel-like table analysis and formula execution.
 */

export interface CellData {
    id: string;         // "A1", "B2"
    row: number;        // 0-indexed
    col: number;        // 0-indexed
    value: string;      // Raw text content
    numericValue: number | null; // Parsed number or null
    type: 'number' | 'text' | 'empty';
    timestamp: number;
}

export interface TableGrid {
    rows: number;
    cols: number;
    cells: CellData[][]; // 2D grid [row][col]
    flatCells: Record<string, CellData>; // Map "A1": CellData
}

/**
 * Converts column index to Excel-style letter (0 -> A, 1 -> B, 26 -> AA)
 */
export function getColLabel(index: number): string {
    let label = '';
    let i = index;
    while (i >= 0) {
        label = String.fromCharCode(65 + (i % 26)) + label;
        i = Math.floor(i / 26) - 1;
    }
    return label;
}

/**
 * Converts Excel-style reference string (A1, B2) to coordinates
 */
export function parseCellRef(ref: string): { row: number, col: number } | null {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const colStr = match[1];
    const rowStr = match[2];

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
    }

    return {
        row: parseInt(rowStr, 10) - 1, // 1-based to 0-based
        col: col - 1 // 1-based to 0-based
    };
}

/**
 * Intelligent Number Parser
 * Handles: $100, 1,000, 50%, (500)
 */
function parseSmartNumber(text: string): number | null {
    if (!text || !text.trim()) return null;

    // Remove logic-breaking chars but keep signs
    let clean = text.trim();

    // Percent handling
    const isPercent = clean.endsWith('%');
    if (isPercent) clean = clean.slice(0, -1);

    // Currency and commas
    clean = clean.replace(/[$€£¥,\s]/g, '');

    // Parentheses for negative
    if (clean.startsWith('(') && clean.endsWith(')')) {
        clean = '-' + clean.slice(1, -1);
    }

    const num = parseFloat(clean);
    if (isNaN(num) || !isFinite(num)) return null;

    return isPercent ? num / 100 : num;
}

/**
 * Scans a 2D array of strings (from ProseMirror) into a Smart Grid
 */
export function scanTable(rawData: string[][]): TableGrid {
    const rows = rawData.length;
    const cols = rawData[0]?.length || 0;
    const cells: CellData[][] = [];
    const flatCells: Record<string, CellData> = {};

    for (let r = 0; r < rows; r++) {
        const rowCells: CellData[] = [];
        for (let c = 0; c < cols; c++) {
            const raw = rawData[r][c] || '';
            const num = parseSmartNumber(raw);
            const address = `${getColLabel(c)}${r + 1}`;

            const cell: CellData = {
                id: address,
                row: r,
                col: c,
                value: raw,
                numericValue: num,
                type: raw.trim() === '' ? 'empty' : (num !== null ? 'number' : 'text'),
                timestamp: Date.now()
            };

            rowCells.push(cell);
            flatCells[address] = cell;
        }
        cells.push(rowCells);
    }

    return { rows, cols, cells, flatCells };
}

/**
 * Resolves a range string "A1:B2" to a list of numerics
 */
function resolveRange(range: string, grid: TableGrid): number[] {
    const parts = range.split(':');
    if (parts.length !== 2) return [];

    const start = parseCellRef(parts[0]);
    const end = parseCellRef(parts[1]);

    if (!start || !end) return [];

    const values: number[] = [];

    // Normalize bounds (min/max handles backward selection like B2:A1)
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
            // Safe access
            const cell = grid.cells[r]?.[c];
            if (cell && cell.type === 'number' && cell.numericValue !== null) {
                values.push(cell.numericValue);
            }
        }
    }

    return values;
}

/**
 * Main Formula Evaluator
 * Supports: SUM(A1:B2), AVERAGE(LEFT)
 */
export function evaluateAdvancedFormula(
    formula: string,
    currentCell: { row: number, col: number },
    grid: TableGrid
): { result: number | string, details: string } {

    // 1. Basic Directional Parsing (Backward compatibility + Mixed)
    // E.g. SUM(LEFT)
    // We can also support SUM(A1:B2)

    // Clean formula
    const cleanFormula = formula.replace(/^=/, '').trim().toUpperCase();
    const match = cleanFormula.match(/^([A-Z]+)\((.*)\)$/);

    if (!match) return { result: '!ERR:FMT', details: 'Invalid format' };

    const func = match[1];
    const args = match[2].trim();

    let values: number[] = [];
    let rangeDesc = args;

    // A. Directional Argument
    if (['LEFT', 'RIGHT', 'ABOVE', 'BELOW'].includes(args)) {
        // Logic similar to previous but using grid
        const { row, col } = currentCell;
        if (args === 'LEFT') {
            for (let c = 0; c < col; c++) {
                const cell = grid.cells[row][c];
                if (cell.type === 'number') values.push(cell.numericValue!);
            }
        } else if (args === 'RIGHT') {
            for (let c = col + 1; c < grid.cols; c++) {
                const cell = grid.cells[row][c];
                if (cell.type === 'number') values.push(cell.numericValue!);
            }
        } else if (args === 'ABOVE') {
            for (let r = 0; r < row; r++) {
                const cell = grid.cells[r][col];
                if (cell.type === 'number') values.push(cell.numericValue!);
            }
        } else if (args === 'BELOW') {
            for (let r = row + 1; r < grid.rows; r++) {
                const cell = grid.cells[r][col];
                if (cell.type === 'number') values.push(cell.numericValue!);
            }
        }
    }
    // B. Range Argument (A1:B2)
    else if (args.includes(':')) {
        values = resolveRange(args, grid);
    }
    // C. Single Cell (A1)
    else {
        const coords = parseCellRef(args);
        if (coords && grid.cells[coords.row]?.[coords.col]) {
            const cell = grid.cells[coords.row][coords.col];
            if (cell.type === 'number') values.push(cell.numericValue!);
        }
    }

    if (values.length === 0) {
        return { result: 0, details: `No numeric data found in ${rangeDesc}` };
    }

    // Execute Math
    let result = 0;
    switch (func) {
        case 'SUM': result = values.reduce((a, b) => a + b, 0); break;
        case 'AVERAGE': result = values.reduce((a, b) => a + b, 0) / values.length; break;
        case 'COUNT': result = values.length; break;
        case 'MAX': result = Math.max(...values); break;
        case 'MIN': result = Math.min(...values); break;
        case 'PRODUCT': result = values.reduce((a, b) => a * b, 1); break;
        default: return { result: '!ERR:FUNC', details: 'Unknown function' };
    }

    // Format output (rounding to 2 decimals if not integer)
    const finalResult = Number.isInteger(result) ? result : Number(result.toFixed(2));

    return {
        result: finalResult,
        details: `${func}(${rangeDesc}) = ${finalResult} [Values: ${values.join(', ')}]`
    };
}

/**
 * Adjusts formula references for Drag/Fill operations (Relative Referencing)
 * Example: SUM(A1:B2) filled 1 row down -> SUM(A2:B3)
 */
export function adjustFormulaReferences(formula: string, rowOffset: number, colOffset: number): string {
    return formula.replace(/([A-Z]+)(\d+)/g, (match, colStr, rowStr) => {
        // Parse current reference
        let colIndex = 0;
        for (let i = 0; i < colStr.length; i++) {
            colIndex = colIndex * 26 + (colStr.charCodeAt(i) - 64);
        }
        colIndex -= 1; // 0-based
        const rowIndex = parseInt(rowStr, 10) - 1; // 0-based

        // Apply offset
        const newRow = rowIndex + rowOffset;
        const newCol = colIndex + colOffset;

        // Validation: Don't allow negative indices
        if (newRow < 0 || newCol < 0) return match; // Return original if out of bounds

        // Convert back to string
        return `${getColLabel(newCol)}${newRow + 1}`;
    });
}
