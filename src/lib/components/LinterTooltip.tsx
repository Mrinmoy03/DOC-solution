import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface LinterTooltipProps {
    editor: Editor | null;
}

export const LinterTooltip: React.FC<LinterTooltipProps> = ({ editor }) => {
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<string | null>(null);
    const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editor) return;

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('lint-error') || target.classList.contains('lint-warning')) {
                const rect = target.getBoundingClientRect();
                setPosition({
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY + 5
                });
                setSuggestion(target.getAttribute('data-suggestion'));
                setErrorType(target.getAttribute('data-error-type'));
                setActiveElement(target);
            } else {
                // If we are not hovering a lint error, and we are not hovering the tooltip itself
                if (tooltipRef.current && !tooltipRef.current.contains(target)) {
                    setPosition(null);
                    setActiveElement(null);
                }
            }
        };



        document.addEventListener('mouseover', handleMouseOver);
        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [editor]);

    const handleApply = () => {
        if (activeElement && suggestion && editor) {
            // We need to find the position of this element in the document
            // This is tricky with Tiptap view coordinates vs DOM.
            // Easier: Use the editor's view.posAtDOM logic
            try {
                const view = editor.view;
                const pos = view.posAtDOM(activeElement, 0);

                // Standardize replacement based on error type
                // or just replace the content of the node? NO, decorations are inline.
                // We need to find the modification range.

                // Actually, the decoration does NOT change the DOM structure deeply, it wraps text.
                // So view.posAtDOM(activeElement, 0) gives the start pos.

                // Calculate 'to' based on text content length of the decorated element
                const from = pos;
                const to = pos + (activeElement.textContent?.length || 0);

                if (from !== -1) {
                    editor.chain().focus().insertContentAt({ from, to }, suggestion).run();
                    setPosition(null);
                }
            } catch (e) {
                console.error("Failed to apply suggestion", e);
            }
        }
    };

    const handleIgnore = () => {
        setPosition(null);
        // Logic to ignore could be added here (e.g., adding to a user dictionary)
    };

    if (!position) return null;

    return (
        <div
            ref={tooltipRef}
            className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-slate-200 p-3 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2 min-w-[200px]"
            style={{
                top: position.y - window.scrollY, // Adjust for fixed positioning vs scroll
                left: position.x - window.scrollX
            }}
        >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    {errorType?.replace(/-/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400">Tap Tab to fix</span>
            </div>

            {suggestion ? (
                <button
                    onClick={handleApply}
                    className="text-left text-sm font-medium text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors flex items-center gap-2"
                >
                    <span className="text-green-500 font-bold">✓</span>
                    Change to <span className="font-bold text-slate-900">"{suggestion}"</span>
                </button>
            ) : (
                <div className="text-sm text-slate-500 italic px-2">No suggestion available</div>
            )}

            <button
                onClick={handleIgnore}
                className="text-left text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-2 py-1 rounded-md transition-colors"
            >
                Ignore
            </button>
        </div>
    );
};
