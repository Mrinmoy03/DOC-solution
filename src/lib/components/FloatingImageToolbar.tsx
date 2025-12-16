import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import { ImageToolbar } from './ImageToolbar';

interface FloatingImageToolbarProps {
    editor: Editor;
    selectedImageNode: { node: Node, pos: number };
    onCrop: () => void;

    onEdit: () => void;
    onPosition: (pos: string) => void;
    onReplace: () => void;
}

export const FloatingImageToolbar = ({
    editor,
    selectedImageNode,
    onCrop,

    onEdit,
    onPosition,
    onReplace
}: FloatingImageToolbarProps) => {
    const [style, setStyle] = useState<React.CSSProperties | null>(null);

    const updatePosition = useCallback(() => {
        if (!editor || !selectedImageNode) return;

        const dom = editor.view.nodeDOM(selectedImageNode.pos) as HTMLElement;
        if (dom) {
            const rect = dom.getBoundingClientRect();
            // We use fixed positioning to handle viewport coordinates directly
            // This avoids issues with relative containers and offsets

            // center horizontally over the image
            const left = rect.left + (rect.width / 2);
            // position above the image
            const top = rect.top - 60; // 60px padding above

            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                transform: 'translateX(-50%)',
                zIndex: 50,
                visibility: (top < 0) ? 'hidden' : 'visible' // Hide if scrolled off top (simple check)
            });
        }
    }, [editor, selectedImageNode]);

    useEffect(() => {
        updatePosition();
        window.addEventListener('resize', updatePosition);

        // Find scroll container
        const editorContainer = editor.view.dom.closest('.custom-scrollbar') || window;
        editorContainer.addEventListener('scroll', updatePosition, { capture: true });
        // Also listen to document scroll just in case
        document.addEventListener('scroll', updatePosition, { capture: true });

        return () => {
            window.removeEventListener('resize', updatePosition);
            editorContainer.removeEventListener('scroll', updatePosition, { capture: true });
            document.removeEventListener('scroll', updatePosition, { capture: true });
        };
    }, [updatePosition, editor]);

    if (!style) return null;

    return (
        <div style={style}>
            <ImageToolbar
                onCrop={onCrop}

                onEdit={onEdit}
                onPosition={onPosition}
                onReplace={onReplace}
                currentPosition={selectedImageNode.node.attrs.position || 'inline'}
            />
        </div>
    );
};
