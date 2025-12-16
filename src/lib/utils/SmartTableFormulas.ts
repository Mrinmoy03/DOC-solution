/**
 * Smart Table Formula System
 * Intelligently detects cell positions and suggests appropriate formulas
 */

export type CellRef = { row: number; col: number };
export type TableData = (string | number)[][];
export type DirectionInfo = {
    available: boolean;
    cellCount: number;
    values?: number[];
    reason?: string;
};

/**
 * Extract numeric value from cell text
 */
function parseNumericValue(cellText: string): number | null {
    if (!cellText || cellText.trim() === '') return null;

    // Remove common formatting: $, €, £, commas, spaces, %
    const cleaned = cellText.replace(/[$€£¥,\s%]/g, '').trim();
    const num = parseFloat(cleaned);

    return !isNaN(num) && isFinite(num) ? num : null;
}

/**
 * Get information about what directions are available from current cell
 */
export function getDirectionalInfo(
    currentCell: CellRef,
    data: TableData
): Record<string, DirectionInfo> {
    const { row, col } = currentCell;
    const numRows = data.length;
    const numCols = data[0]?.length || 0;

    const info: Record<string, DirectionInfo> = {};

    // Validate bounds
    if (!data[row]) {
        return {
            LEFT: { available: false, cellCount: 0, reason: 'Row index out of bounds' },
            RIGHT: { available: false, cellCount: 0, reason: 'Row index out of bounds' },
            ABOVE: { available: false, cellCount: 0, reason: 'Row index out of bounds' },
            BELOW: { available: false, cellCount: 0, reason: 'Row index out of bounds' },
        };
    }

    // LEFT
    if (col === 0) {
        info.LEFT = { available: false, cellCount: 0, reason: 'Already in first column' };
    } else {
        const values: number[] = [];
        for (let c = 0; c < col; c++) {
            const val = parseNumericValue(String(data[row][c]));
            if (val !== null) values.push(val);
        }
        info.LEFT = { available: true, cellCount: col, values };
    }

    // RIGHT
    if (col === numCols - 1) {
        info.RIGHT = { available: false, cellCount: 0, reason: 'Already in last column' };
    } else {
        const values: number[] = [];
        for (let c = col + 1; c < numCols; c++) {
            const val = parseNumericValue(String(data[row][c]));
            if (val !== null) values.push(val);
        }
        info.RIGHT = { available: true, cellCount: numCols - col - 1, values };
    }

    // ABOVE
    if (row === 0) {
        info.ABOVE = { available: false, cellCount: 0, reason: 'Already in first row' };
    } else {
        const values: number[] = [];
        for (let r = 0; r < row; r++) {
            const val = parseNumericValue(String(data[r][col]));
            if (val !== null) values.push(val);
        }
        info.ABOVE = { available: true, cellCount: row, values };
    }

    // BELOW
    if (row === numRows - 1) {
        info.BELOW = { available: false, cellCount: 0, reason: 'Already in last row' };
    } else {
        const values: number[] = [];
        for (let r = row + 1; r < numRows; r++) {
            const val = parseNumericValue(String(data[r][col]));
            if (val !== null) values.push(val);
        }
        info.BELOW = { available: true, cellCount: numRows - row - 1, values };
    }

    return info;
}

/**
 * Calculate formula result
 */
export function calculateFormula(
    func: string,
    direction: string,
    currentCell: CellRef,
    data: TableData
): number | string {
    const dirInfo = getDirectionalInfo(currentCell, data);
    const info = dirInfo[direction.toUpperCase()];

    if (!info || !info.available) {
        return 0; // Return 0 for unavailable directions instead of error
    }

    const values = info.values || [];

    if (values.length === 0) {
        return 0; // No numeric values found
    }

    switch (func.toUpperCase()) {
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
            return '!ERR:FUNC';
    }
}

/**
 * Preview what a formula will calculate
 */
export function previewFormula(
    func: string,
    direction: string,
    currentCell: CellRef,
    data: TableData
): string {
    const dirInfo = getDirectionalInfo(currentCell, data);
    const info = dirInfo[direction.toUpperCase()];

    if (!info || !info.available) {
        return `Cannot use ${direction} from this position: ${info?.reason || 'Invalid direction'}`;
    }

    const values = info.values || [];

    if (values.length === 0) {
        return `No numeric values found ${direction.toLowerCase()}`;
    }

    const result = calculateFormula(func, direction, currentCell, data);

    return `${func}(${values.join(', ')}) = ${result}`;
}
