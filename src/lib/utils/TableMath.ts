/*
 * TableMath.ts
 * Utility for parsing and evaluating spreadsheet-like formulas in Tiptap tables.
 * Supported: SUM, AVERAGE, COUNT, MAX, MIN, PRODUCT, IF
 * References: A1, A1:B2, ABOVE, LEFT, RIGHT, BELOW
 */

export type TableData = (string | number)[][];

interface CellRef {
    row: number;
    col: number;
}

interface RangeRef {
    start: CellRef;
    end: CellRef;
}

// Helper: Convert "A" to 0, "B" to 1, etc.
const colLetterToIdx = (letter: string): number => {
    let column = 0;
    const length = letter.length;
    for (let i = 0; i < length; i++) {
        column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column - 1;
};

// Helper: Convert 0 to "A", 1 to "B", etc.
export const idxToColLetter = (n: number): string => {
    let ordA = 'A'.charCodeAt(0);
    let ordZ = 'Z'.charCodeAt(0);
    let len = ordZ - ordA + 1;
    let s = "";
    while (n >= 0) {
        s = String.fromCharCode(n % len + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
};

// Helper: Parse "A1" -> {row: 0, col: 0}
const parseCellRef = (ref: string): CellRef | null => {
    const match = ref.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return null;
    const colStr = match[1];
    const rowStr = match[2];
    return {
        col: colLetterToIdx(colStr),
        row: parseInt(rowStr, 10) - 1
    };
};

/**
 * Extracts numeric values from a table range.
 * Smart parsing: handles spaces, commas, currency symbols, percentages
 */
const getValues = (data: TableData, range: RangeRef): number[] => {
    const values: number[] = [];

    console.log('📥 Extracting values from range:', {
        startRow: range.start.row,
        endRow: range.end.row,
        startCol: range.start.col,
        endCol: range.end.col
    });

    for (let r = range.start.row; r <= range.end.row; r++) {
        for (let c = range.start.col; c <= range.end.col; c++) {
            if (data[r] && data[r][c] !== undefined) {
                const cellValue = String(data[r][c]);

                // Smart numeric parsing
                // 1. Remove whitespace
                let cleanValue = cellValue.trim();

                // 2. Skip empty cells
                if (cleanValue === '') {
                    console.log(`  Cell[${r},${c}]: empty - skipped`);
                    continue;
                }

                // 3. Remove common non-numeric characters (keep numbers, decimal, minus)
                // Remove: $ € £ ¥ , % and spaces
                cleanValue = cleanValue
                    .replace(/[$€£¥,\s%]/g, '')
                    .trim();

                // 4. Try to parse as number
                const val = parseFloat(cleanValue);

                if (!isNaN(val) && isFinite(val)) {
                    values.push(val);
                    console.log(`  Cell[${r},${c}]: "${cellValue}" → ${val} ✓`);
                } else {
                    console.log(`  Cell[${r},${c}]: "${cellValue}" → not a number, skipped`);
                }
            }
        }
    }

    console.log(`  → Found ${values.length} numeric values:`, values);
    return values;
};

/**
 * Resolves "ABOVE", "LEFT", etc. to a specific range based on current cell.
 */
const resolveDirectionalRange = (direction: string, currentCell: CellRef, data: TableData): RangeRef | null => {
    const { row, col } = currentCell;
    const numRows = data.length;
    // Assumption: All rows have same length (or handle ragged)
    const numCols = data[0]?.length || 0;

    console.log(`Resolving ${direction} from cell (row:${row}, col:${col}) in table ${numRows}x${numCols}`);

    let result: RangeRef | null = null;

    switch (direction.toUpperCase()) {
        case 'ABOVE':
            if (row === 0) {
                console.log('  → No cells above (already in first row)');
                return null;
            }
            result = { start: { row: 0, col }, end: { row: row - 1, col } };
            console.log(`  → Range: rows 0 to ${row - 1}, column ${col}`);
            break;
        case 'BELOW':
            if (row === numRows - 1) {
                console.log('  → No cells below (already in last row)');
                return null;
            }
            result = { start: { row: row + 1, col }, end: { row: numRows - 1, col } };
            console.log(`  → Range: rows ${row + 1} to ${numRows - 1}, column ${col}`);
            break;
        case 'LEFT':
            if (col === 0) {
                console.log('  → No cells to left (already in first column)');
                return null;
            }
            result = { start: { row, col: 0 }, end: { row, col: col - 1 } };
            console.log(`  → Range: row ${row}, columns 0 to ${col - 1}`);
            break;
        case 'RIGHT':
            if (col === numCols - 1) {
                console.log('  → No cells to right (already in last column)');
                return null;
            }
            result = { start: { row, col: col + 1 }, end: { row, col: numCols - 1 } };
            console.log(`  → Range: row ${row}, columns ${col + 1} to ${numCols - 1}`);
            break;
        default:
            console.log(`  → Unknown direction: ${direction}`);
            return null;
    }

    return result;
};

/**
 * Main Evaluation Function
 * @param formula e.g. "SUM(ABOVE)" or "AVERAGE(A1:A5)"
 * @param data 2D array of table cell text content
 * @param currentCell The {row, col} of the cell where formula is being inserted
 */
export const evaluateFormula = (formula: string, data: TableData, currentCell: CellRef): string | number => {
    // 1. Clean format: =SUM(...) -> SUM(...)
    let cleanFormula = formula.trim().toUpperCase();
    if (cleanFormula.startsWith('=')) {
        cleanFormula = cleanFormula.substring(1);
    }

    // 2. Parse Function and Arguments: FUNC(ARG)
    const match = cleanFormula.match(/^([A-Z]+)\(([^)]*)\)$/);
    if (!match) {
        console.error('Formula format error:', formula);
        return "!ERR:FMT"; // Error Format
    }

    const funcName = match[1];
    const argsStr = match[2];

    if (!argsStr) {
        console.error('Empty formula arguments:', formula);
        return "!ERR:ARG";
    }

    // 3. Resolve Range
    let values: number[] = [];

    // Check for simple directional keywords
    const directionalRange = resolveDirectionalRange(argsStr, currentCell, data);
    if (directionalRange) {
        values = getValues(data, directionalRange);
        console.log(`Directional range ${argsStr}:`, directionalRange, 'values:', values);
    } else if (argsStr === 'ABOVE' || argsStr === 'BELOW' || argsStr === 'LEFT' || argsStr === 'RIGHT') {
        // It's a directional keyword but returned null (edge case like LEFT in first column)
        console.warn(`⚠️ Directional range ${argsStr} is empty (edge of table)`);
        // Return 0 for empty edge cases instead of error
        return 0;
    } else {
        // Check for A1:B2 range
        const rangeMatch = argsStr.match(/^([A-Z]+[0-9]+):([A-Z]+[0-9]+)$/);
        if (rangeMatch) {
            const start = parseCellRef(rangeMatch[1]);
            const end = parseCellRef(rangeMatch[2]);
            if (start && end) {
                // Normalize range so start is top-left
                const rStart = Math.min(start.row, end.row);
                const rEnd = Math.max(start.row, end.row);
                const cStart = Math.min(start.col, end.col);
                const cEnd = Math.max(start.col, end.col);

                values = getValues(data, {
                    start: { row: rStart, col: cStart },
                    end: { row: rEnd, col: cEnd }
                });
                console.log(`Range ${argsStr}:`, values);
            } else {
                console.error('Invalid cell references:', argsStr);
                return "!ERR:REF";
            }
        } else {
            // Check for Single Cell (A1)
            const cellRef = parseCellRef(argsStr);
            if (cellRef) {
                const cellValue = String(data[cellRef.row]?.[cellRef.col] || '').trim();
                const val = parseFloat(cellValue);
                if (!isNaN(val)) {
                    values.push(val);
                    console.log(`Single cell ${argsStr}:`, val);
                }
            } else {
                console.error('Could not parse range:', argsStr);
                return "!ERR:REF";
            }
        }
    }

    console.log(`${funcName} on values:`, values);

    // Check if we have any values to work with
    if (values.length === 0) {
        console.warn('⚠️ No numeric values found in range!');
        return 0; // Return 0 instead of error for empty ranges
    }

    // 4. Execute Function
    switch (funcName) {
        case 'SUM':
            return values.reduce((a, b) => a + b, 0);
        case 'AVERAGE':
            return values.reduce((a, b) => a + b, 0) / values.length;
        case 'COUNT':
            return values.length;
        case 'MAX':
            return Math.max(...values);
        case 'MIN':
            return Math.min(...values);
        case 'PRODUCT':
            return values.reduce((a, b) => a * b, 1);
        default:
            console.error('Unknown function:', funcName);
            return "!ERR:FUNC";
    }
};
