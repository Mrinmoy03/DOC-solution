
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from '../components';

export const ImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
            height: {
                default: null,
            },
            x: {
                default: 0,
            },
            y: {
                default: 0,
            },
            rotation: {
                default: 0,
            },
            // Keep existing attributes for backward compatibility or if needed by other parts
            position: {
                default: 'inline',
                renderHTML: attributes => {
                    return {
                        'data-position': attributes.position,
                        class: `image-${attributes.position}`,
                    };
                },
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },
});
