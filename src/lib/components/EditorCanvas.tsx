import { useEffect, useState } from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { RichTextHeaderFooter } from './RichTextHeaderFooter';
import { useEditorStore } from '../../store/editorStore';

interface EditorCanvasProps {
    editor: Editor | null;
}

export const EditorCanvas = ({ editor }: EditorCanvasProps) => {
    const { ruler, page, zoom, headerFooter, pageNumber, pageMargins } = useEditorStore();
    const { leftMargin, rightMargin, topMargin, bottomMargin } = ruler;
    const { width, height } = page;
    const setTotalPages = useEditorStore((state) => state.setTotalPages);

    // const containerRef = useRef<HTMLDivElement>(null);

    const [contentHeight, setContentHeight] = useState(height);
    const GAP_SIZE = 20; // ~0.5cm

    // Calculate total pages based on content height
    const calculatedPages = Math.max(1, Math.ceil(contentHeight / height));

    // Update store when pages change
    useEffect(() => {
        setTotalPages(calculatedPages);
    }, [calculatedPages, setTotalPages]);

    // Track cursor position - currently using scroll position for page number
    // to align with visual viewing.
    /*
    useEffect(() => {
        if (!editor) return;
        // Future implementation for cursor-based page tracking
    }, [editor]);
    */

    // Resize Observer to track content height
    useEffect(() => {
        if (!editor) return;

        const updateHeight = () => {
            const dom = editor.view.dom;
            if (dom) {
                // We use scrollHeight to get the full height of the content
                // Ensure we respect the min-height of at least one page
                const newHeight = Math.max(height, dom.scrollHeight);
                // Only update if significantly changed to avoid loops
                if (Math.abs(newHeight - contentHeight) > 10) {
                    setContentHeight(newHeight);
                }
            }
        };

        // Initial check
        updateHeight();

        // Polling as a backup for Tiptap updates that might not trigger resize immediately
        const interval = setInterval(updateHeight, 1000);

        const observer = new ResizeObserver(updateHeight);
        if (editor.view.dom) {
            observer.observe(editor.view.dom);
        }

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, [editor, height, contentHeight]);



    return (
        <div
            className="flex-1 bg-[#e4e7ea] py-2 px-4 cursor-text relative"
            onClick={() => editor?.chain().focus().run()}
            id="editor-scroll-container"
        >
            <div
                className="mx-auto relative"
                style={{
                    width: `${width}px`,
                    minHeight: `${calculatedPages * height + (calculatedPages - 1) * GAP_SIZE}px`, // Total calculated height
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                }}
            >
                {/* Pages Background Layer */}
                {Array.from({ length: calculatedPages }).map((_, index) => {
                    const pageSpecificMargins = pageMargins[index] || {};
                    const currentTop = pageSpecificMargins.top ?? topMargin;
                    const currentBottom = pageSpecificMargins.bottom ?? bottomMargin;

                    return (
                        <div
                            key={index}
                            className="absolute left-0 right-0 bg-white shadow-sm border border-gray-300 editor-page-bg"
                            style={{
                                height: `${height}px`,
                                top: `${index * (height + GAP_SIZE)}px`,
                                '--page-index': index,
                            } as React.CSSProperties}
                        >
                            {/* Header Area for each page */}
                            {headerFooter.showHeader && (
                                <div
                                    className="absolute left-0 right-0 border-b border-transparent hover:border-gray-200 group"
                                    style={{
                                        top: 0,
                                        // Ensure header container is at least as tall as the header start margin + some buffer
                                        // If header margin > page margin, we need to extend this container so it doesn't clip?
                                        // Actually, the issue is likely that the BODY content needs to be pushed down.
                                        // But we also need to visualize the header area correctly.
                                        height: `${Math.max(currentTop, (headerFooter.headerMargin * 96) + 24)}px`,

                                        borderBottomStyle: (headerFooter.headerLineStyle && headerFooter.headerLineStyle !== 'none' ? headerFooter.headerLineStyle : undefined) as any,
                                        borderBottomWidth: headerFooter.headerLineStyle === 'double' ? '3px' : (headerFooter.headerLineStyle && headerFooter.headerLineStyle !== 'none' ? '1px' : '0'),
                                        borderBottomColor: headerFooter.headerLineColor || '#000000',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative w-full h-full text-sm text-gray-500">
                                        {/* Visual Label for Header Area */}
                                        <div className="absolute top-1 left-2 text-[10px] text-blue-400 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                                            Header Title Space
                                        </div>
                                        <RichTextHeaderFooter
                                            content={headerFooter.headerContent}
                                            onUpdate={(content) => useEditorStore.getState().setHeaderFooterState({ headerContent: content })}
                                            placeholder="Type Header Title Here..."
                                            style={{
                                                padding: `${headerFooter.headerMargin * 96}px ${rightMargin}px 0 ${leftMargin}px`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer Area for each page */}
                            {headerFooter.showFooter && (
                                <div
                                    className="absolute left-0 right-0 border-t border-transparent hover:border-gray-200 group"
                                    style={{
                                        bottom: 0,
                                        // Similar logic for footer
                                        height: `${Math.max(currentBottom, (headerFooter.footerMargin * 96) + 24)}px`,

                                        borderTopStyle: (headerFooter.footerLineStyle && headerFooter.footerLineStyle !== 'none' ? headerFooter.footerLineStyle : undefined) as any,
                                        borderTopWidth: headerFooter.footerLineStyle === 'double' ? '3px' : (headerFooter.footerLineStyle && headerFooter.footerLineStyle !== 'none' ? '1px' : '0'),
                                        borderTopColor: headerFooter.footerLineColor || '#000000',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative w-full h-full text-sm text-gray-500">
                                        {/* Visual Label for Footer Area */}
                                        <div className="absolute bottom-1 left-2 text-[10px] text-blue-400 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none">
                                            Footer Title Space
                                        </div>
                                        <RichTextHeaderFooter
                                            content={headerFooter.footerContent}
                                            onUpdate={(content) => useEditorStore.getState().setHeaderFooterState({ footerContent: content })}
                                            placeholder="Type Footer Title Here..."
                                            style={{
                                                padding: `0 ${rightMargin}px ${headerFooter.footerMargin * 96}px ${leftMargin}px`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Page Number */}
                            {pageNumber.showPageNumbers && (index > 0 || pageNumber.showOnFirstPage) && (
                                <div
                                    className="absolute text-xs text-gray-500 pointer-events-none font-sans"
                                    style={{
                                        ...(pageNumber.position.startsWith('top')
                                            ? { top: `${Math.max(32, headerFooter.headerMargin * 96)}px` }
                                            : { bottom: `${Math.max(32, headerFooter.footerMargin * 96)}px` }
                                        ),
                                        ...(pageNumber.position.includes('left')
                                            ? { left: `${leftMargin}px` }
                                            : pageNumber.position.includes('center')
                                                ? { left: '50%', transform: 'translateX(-50%)' }
                                                : { right: `${rightMargin}px` }
                                        ),
                                    }}
                                >
                                    {(() => {
                                        const pageNum = index + 1;
                                        const { format } = pageNumber;
                                        if (format === 'i, ii, iii') {
                                            const roman = (n: number) => {
                                                const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
                                                let romanStr = '';
                                                let num = n;
                                                for (let i in lookup) {
                                                    while (num >= lookup[i]) {
                                                        romanStr += i;
                                                        num -= lookup[i];
                                                    }
                                                }
                                                return romanStr.toLowerCase();
                                            };
                                            return roman(pageNum);
                                        } else if (format === 'a, b, c') {
                                            return String.fromCharCode(96 + pageNum);
                                        }
                                        return pageNum;
                                    })()}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Content Layer */}
                <div
                    className="relative z-10 pointer-events-none"
                    style={{
                        paddingTop: `${Math.max(pageMargins[0]?.top ?? topMargin, (headerFooter.showHeader ? (headerFooter.headerMargin * 96) + 24 : 0))}px`,
                        paddingBottom: `${Math.max(pageMargins[calculatedPages - 1]?.bottom ?? bottomMargin, (headerFooter.showFooter ? (headerFooter.footerMargin * 96) + 24 : 0))}px`,
                        paddingLeft: `${leftMargin}px`,
                        paddingRight: `${rightMargin}px`,
                        // We must ensure the content flows over the pages. 
                        width: '100%',
                    }}
                >
                    {/* Re-enable pointer events for the actual editor content */}
                    <div className="pointer-events-auto">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </div>
    );
};
