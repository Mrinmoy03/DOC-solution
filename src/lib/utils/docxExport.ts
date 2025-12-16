import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun, UnderlineType, Header, Footer } from 'docx';
import { saveAs } from 'file-saver';
import { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';

// Helper to fetch image text/blob
async function urlToBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    return await response.arrayBuffer();
}

// Convert data URL to buffer
function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
    const binaryString = window.atob(dataUrl.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

interface HeaderFooterState {
    headerMargin: number;
    footerMargin: number;
    showHeader: boolean;
    showFooter: boolean;
    headerContent: string;
    footerContent: string;
    headerLineStyle: string;
    footerLineStyle: string;
    headerLineColor: string;
    footerLineColor: string;
}

/**
 * Main export function
 */
export async function exportToDocx(editor: Editor, fileName: string, chartImages?: string[], headerFooter?: HeaderFooterState) {
    if (!editor) return;

    const json = editor.getJSON();

    // Recursive mapping of all nodes
    const children = await mapNodes(json.content || [], { chartImages, chartIndex: { val: 0 } });

    // Header/Footer Construction
    const headers: { default: Header } | undefined = headerFooter?.showHeader ? {
        default: new Header({
            children: [
                new Paragraph({
                    children: [new TextRun(headerFooter.headerContent || "")],
                    border: {
                        bottom: headerFooter.headerLineStyle !== 'none' ? {
                            color: headerFooter.headerLineColor || "auto",
                            space: 1,
                            style: getBorderStyle(headerFooter.headerLineStyle),
                            size: headerFooter.headerLineStyle === 'double' ? 12 : 6,
                        } : undefined
                    }
                })
            ]
        })
    } : undefined;

    const footers: { default: Footer } | undefined = headerFooter?.showFooter ? {
        default: new Footer({
            children: [
                new Paragraph({
                    children: [new TextRun(headerFooter.footerContent || "")],
                    border: {
                        top: headerFooter.footerLineStyle !== 'none' ? {
                            color: headerFooter.footerLineColor || "auto",
                            space: 1,
                            style: getBorderStyle(headerFooter.footerLineStyle),
                            size: headerFooter.footerLineStyle === 'double' ? 12 : 6,
                        } : undefined
                    }
                })
            ]
        })
    } : undefined;

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440, // 1 inch
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            headers: headers,
            footers: footers,
            children: children,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}

function getBorderStyle(style: string) {
    switch (style) {
        case 'solid': return BorderStyle.SINGLE;
        case 'dashed': return BorderStyle.DASHED;
        case 'dotted': return BorderStyle.DOTTED;
        case 'double': return BorderStyle.DOUBLE;
        default: return BorderStyle.SINGLE;
    }
}

interface MapOptions {
    isList?: boolean;
    listType?: 'bullet' | 'ordered';
    chartImages?: string[];
    chartIndex?: { val: number };
}

/**
 * Recursively maps Tiptap JSON nodes to docx elements.
 */
async function mapNodes(nodes: JSONContent[], options: MapOptions = {}): Promise<any[]> {
    const mapped: any[] = [];

    for (const node of nodes) {
        if (node.type === 'paragraph') {
            const children = await mapTextRuns(node.content || []);
            const p = new Paragraph({
                children: children,
                alignment: getAlignment(node.attrs?.textAlign),
                spacing: {
                    after: 200,
                    line: 276,
                },
                bullet: options.isList ? { level: 0 } : undefined,
            });
            mapped.push(p);

        } else if (node.type === 'heading') {
            const h = new Paragraph({
                text: getNodeText(node),
                children: await mapTextRuns(node.content || []),
                heading: getHeadingLevel(node.attrs?.level),
                alignment: getAlignment(node.attrs?.textAlign),
                spacing: { before: 240, after: 120 }
            });
            mapped.push(h);

        } else if (node.type === 'bulletList') {
            const listChildren = await mapNodes(node.content || [], { ...options, isList: true, listType: 'bullet' });
            mapped.push(...listChildren);

        } else if (node.type === 'orderedList') {
            const listChildren = await mapNodes(node.content || [], { ...options, isList: true, listType: 'ordered' });
            mapped.push(...listChildren);

        } else if (node.type === 'listItem') {
            const itemContent = await mapNodes(node.content || [], { ...options, isList: true, listType: options.listType });
            mapped.push(...itemContent);

        } else if (node.type === 'image') {
            if (node.attrs?.src) {
                try {
                    const buffer = await urlToBuffer(node.attrs.src);
                    let width = 400;
                    let height = 300;

                    mapped.push(new Paragraph({
                        children: [
                            new ImageRun({
                                data: buffer,
                                transformation: { width, height },
                                type: "png",
                            }),
                        ],
                        alignment: getAlignment(node.attrs?.textAlign) || AlignmentType.CENTER,
                    }));
                } catch (e) {
                    console.warn("Failed to load image", e);
                }
            }
        } else if (node.type === 'chart') {
            // Handle Chart Export - consume image from array order
            if (options.chartImages && options.chartIndex && options.chartIndex.val < options.chartImages.length) {
                try {
                    const base64 = options.chartImages[options.chartIndex.val];
                    options.chartIndex.val++; // Increment counter for next chart

                    if (base64) {
                        const buffer = dataUrlToBuffer(base64);
                        mapped.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: buffer,
                                    transformation: { width: 500, height: 300 }, // Standard chart size
                                    type: "png",
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }));
                    }
                } catch (e) {
                    console.warn("Failed to embed chart image", e);
                }
            }

        } else if (node.type === 'table') {
            const rows = await Promise.all((node.content || []).map(row => mapTableRow(row, options)));
            const table = new Table({
                rows: rows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1 },
                }
            });
            mapped.push(table);
        } else {
            if (node.content) {
                mapped.push(new Paragraph({
                    children: await mapTextRuns(node.content),
                }));
            }
        }
    }

    return mapped;
}

async function mapTableRow(row: JSONContent, options: MapOptions): Promise<TableRow> {
    const cells = await Promise.all((row.content || []).map(cell => mapTableCell(cell, options)));
    return new TableRow({ children: cells });
}

async function mapTableCell(cell: JSONContent, options: MapOptions): Promise<TableCell> {
    const content = await mapNodes(cell.content || [], options);
    return new TableCell({
        children: content,
    });
}

function getHalfPointsFromPx(pxStr: string | undefined): number {
    if (!pxStr) return 24; // Default to 12pt (24 half-points) if undefined. This matches editor's 16px (approx 12pt).
    const px = parseFloat(pxStr.replace('px', ''));
    if (isNaN(px)) return 24; // Default fallback
    // 1px approx 0.75pt. Docx uses half-points.
    // So 16px = 12pt = 24 half-points.
    // Formula: px * 0.75 * 2 = px * 1.5
    return Math.round(px * 1.5);
}

async function mapTextRuns(nodes: JSONContent[]): Promise<TextRun[]> {
    return nodes.map(node => {
        if (node.type !== 'text') return new TextRun("");

        const marks = node.marks || [];
        const textStyle = marks.find(m => m.type === 'textStyle');
        const fontSize = textStyle?.attrs?.fontSize;

        // Handle Underline attributes (Color & Style)
        const underlineMark = marks.find(m => m.type === 'underline' || m.type === 'underlineColor');
        let underlineType = undefined;
        let underlineColor = undefined;

        if (underlineMark) {
            underlineType = UnderlineType.SINGLE; // Default
            if (underlineMark.attrs?.style) {
                switch (underlineMark.attrs.style) {
                    case 'double': underlineType = UnderlineType.DOUBLE; break;
                    case 'dotted': underlineType = UnderlineType.DOTTED; break;
                    case 'dashed': underlineType = UnderlineType.DASH; break;
                    case 'wavy': underlineType = UnderlineType.WAVE; break;
                    default: underlineType = UnderlineType.SINGLE;
                }
            }
            if (underlineMark.attrs?.color) {
                // Remove '#' for docx
                underlineColor = underlineMark.attrs.color.replace('#', '');
            }
        }

        return new TextRun({
            text: node.text || "",
            bold: marks.some(m => m.type === 'bold'),
            italics: marks.some(m => m.type === 'italic'),
            strike: marks.some(m => m.type === 'strike'),
            underline: underlineMark ? {
                type: underlineType || UnderlineType.SINGLE,
                color: underlineColor || "auto"
            } : undefined,
            superScript: marks.some(m => m.type === 'superscript'),
            subScript: marks.some(m => m.type === 'subscript'),
            color: textStyle?.attrs?.color,
            highlight: marks.find(m => m.type === 'highlight')?.attrs?.color,
            size: getHalfPointsFromPx(fontSize), // Docx expects half-points
            // font: "Roboto" (We could map fontFamily here if we tracked it)
        });
    });
}

function getNodeText(node: JSONContent): string {
    if (node.text) return node.text;
    if (node.content) return node.content.map(getNodeText).join("");
    return "";
}

function getHeadingLevel(level?: number) {
    switch (level) {
        case 1: return HeadingLevel.HEADING_1;
        case 2: return HeadingLevel.HEADING_2;
        case 3: return HeadingLevel.HEADING_3;
        case 4: return HeadingLevel.HEADING_4;
        case 5: return HeadingLevel.HEADING_5;
        case 6: return HeadingLevel.HEADING_6;
        default: return HeadingLevel.HEADING_1;
    }
}

function getAlignment(align?: string) {
    switch (align) {
        case 'center': return AlignmentType.CENTER;
        case 'right': return AlignmentType.RIGHT;
        case 'justify': return AlignmentType.JUSTIFIED;
        case 'left': return AlignmentType.LEFT;
        default: return AlignmentType.LEFT;
    }
}
