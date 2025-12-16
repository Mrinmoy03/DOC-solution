import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';

interface ImageDragOverlayProps {
    editor: Editor;
    selectedImageNode: { node: Node, pos: number };
}

export const ImageDragOverlay = ({ editor, selectedImageNode }: ImageDragOverlayProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<{ left: number, top: number } | null>(null);

    const updatePosition = useCallback(() => {
        if (!editor || !selectedImageNode) return;
        
        const dom = editor.view.nodeDOM(selectedImageNode.pos) as HTMLElement;
        if (dom && dom.querySelector) {
            const img = dom.querySelector('img');
            if (img) {
                const rect = img.getBoundingClientRect();
                const editorContainer = editor.view.dom.closest('.custom-scrollbar');
                
                if (editorContainer) {
                    const containerRect = editorContainer.getBoundingClientRect();
                    
                    // Get current position from attributes or use current rect position
                    const currentLeft = selectedImageNode.node.attrs.left ?? (rect.left - containerRect.left);
                    const currentTop = selectedImageNode.node.attrs.top ?? (rect.top - containerRect.top);
                    
                    setPosition({
                        left: currentLeft,
                        top: currentTop
                    });
                }
            }
        }
    }, [editor, selectedImageNode]);

    useEffect(() => {
        updatePosition();
    }, [updatePosition]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = position?.left || 0;
        const startTop = position?.top || 0;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;

            setPosition({ left: newLeft, top: newTop });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setIsDragging(false);

            if (position) {
                // Update the image node with new position
                editor.chain()
                    .setNodeSelection(selectedImageNode.pos)
                    .updateAttributes('image', {
                        left: Math.round(position.left),
                        top: Math.round(position.top)
                    })
                    .run();
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!position) return null;

    const imagePosition = selectedImageNode.node.attrs.position;
    if (imagePosition !== 'behind' && imagePosition !== 'front') return null;

    return (
        <div
            className="absolute pointer-events-auto"
            style={{
                left: position.left,
                top: position.top,
                zIndex: imagePosition === 'front' ? 1000 : 0,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none">
                Drag to move
            </div>
        </div>
    );
};
