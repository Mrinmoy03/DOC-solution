import Image from '@tiptap/extension-image';

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
            position: {
                default: 'inline',
                renderHTML: attributes => {
                    return {
                        'data-position': attributes.position,
                        class: `image-${attributes.position}`,
                    };
                },
            },
            left: {
                default: null,
                renderHTML: attributes => {
                    if (attributes.left !== null && (attributes.position === 'behind' || attributes.position === 'front')) {
                        return {
                            style: `left: ${attributes.left}px;`,
                        };
                    }
                    return {};
                },
            },
            top: {
                default: null,
                renderHTML: attributes => {
                    if (attributes.top !== null && (attributes.position === 'behind' || attributes.position === 'front')) {
                        return {
                            style: `top: ${attributes.top}px;`,
                        };
                    }
                    return {};
                },
            },
        };
    },
});
