import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface ImageResizeOverlayProps {
    editor: Editor;
    selectedImageNode: { node: any, pos: number };
    onResizeEnd: () => void;
}

export const ImageResizeOverlay = ({ editor, selectedImageNode, onResizeEnd }: ImageResizeOverlayProps) => {
    const [dims, setDims] = useState<{ width: number, height: number, top: number, left: number } | null>(null);
    const updateOverlayPosition = useCallback(() => {
        if (!editor || !selectedImageNode) return;
        
        // We need to find the DOM element for this node
        const dom = editor.view.nodeDOM(selectedImageNode.pos) as HTMLElement;
        
        if (dom && dom.querySelector) {
            const img = dom.querySelector('img');
            if (img) {
                const rect = img.getBoundingClientRect();
                // Adjust for scroll if needed, but getBoundingClientRect is viewport relative
                // We need to position the overlay absolute relative to the viewport or a container
                // Assuming the overlay is fixed or absolute in a container that matches the viewport
                
                // Actually, let's use the editor view coordinates logic if possible, 
                // but finding the DOM element is more reliable for the image itself.
                
                // We need to account for the editor's scroll container if we are rendering inside it.
                // In DocumentEditor, we render this overlay inside the relative container.
                // So we need relative coordinates.
                
                const editorContainer = editor.view.dom.closest('.custom-scrollbar');
                if (editorContainer) {
                    const containerRect = editorContainer.getBoundingClientRect();
                    setDims({
                        width: rect.width,
                        height: rect.height,
                        top: rect.top - containerRect.top + editorContainer.scrollTop,
                        left: rect.left - containerRect.left + editorContainer.scrollLeft
                    });
                }
            }
        }
    }, [editor, selectedImageNode]);

    useEffect(() => {
        updateOverlayPosition();
        window.addEventListener('resize', updateOverlayPosition);
        return () => window.removeEventListener('resize', updateOverlayPosition);
    }, [updateOverlayPosition]);

    // Update position on scroll
    useEffect(() => {
        const editorContainer = editor.view.dom.closest('.custom-scrollbar');
        if (editorContainer) {
            editorContainer.addEventListener('scroll', updateOverlayPosition);
            return () => editorContainer.removeEventListener('scroll', updateOverlayPosition);
        }
    }, [editor, updateOverlayPosition]);


    const handleMouseDown = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = dims?.width || 0;
        const startHeight = dims?.height || 0;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (e: MouseEvent) => {
            if (!dims) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('e')) newWidth += deltaX;
            if (direction.includes('w')) newWidth -= deltaX;
            if (direction.includes('s')) newHeight += deltaY;
            if (direction.includes('n')) newHeight -= deltaY;

            // Maintain aspect ratio for corner handles
            if (direction.length === 2) {
                 if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    newHeight = newWidth / aspectRatio;
                 } else {
                    newWidth = newHeight * aspectRatio;
                 }
            }

            // Update editor immediately for smooth feedback? 
            // Or just update overlay and commit on mouse up?
            // Updating editor might be heavy. Let's update overlay first.
            // But updating overlay only won't show the image changing.
            // Let's try updating the editor.
            
            editor.chain().focus().setImage({ 
                src: selectedImageNode.node.attrs.src,
                width: Math.max(20, Math.round(newWidth)),
                height: Math.max(20, Math.round(newHeight))
            }).run();
            
            // We rely on the editor update to trigger updateOverlayPosition via props change/render
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            onResizeEnd();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!dims) return null;

    return (
        <div 
            className="absolute border-2 border-blue-500 pointer-events-none"
            style={{
                top: dims.top,
                left: dims.left,
                width: dims.width,
                height: dims.height,
                zIndex: 50
            }}
        >
            {/* Corners - larger and more visible */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize pointer-events-auto shadow-md" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize pointer-events-auto shadow-md" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nesw-resize pointer-events-auto shadow-md" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize pointer-events-auto shadow-md" onMouseDown={(e) => handleMouseDown(e, 'se')} />
        </div>
    );
};
