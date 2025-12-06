import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ShapeNodeView } from '../components/editor/ShapeNodeView';

export interface ShapeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        shape: {
            insertShape: (options: {
                type: 'line' | 'rectangle' | 'circle';
                width?: number;
                height?: number;
                x?: number;
                y?: number;
            }) => ReturnType;
            updateShape: (attrs: Record<string, any>) => ReturnType;
            deleteShape: () => ReturnType;
        };
    }
}

export const Shape = Node.create<ShapeOptions>({
    name: 'shape',

    group: 'block',

    atom: true,

    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            type: {
                default: 'rectangle',
                parseHTML: (element) => element.getAttribute('data-type'),
                renderHTML: (attributes) => ({
                    'data-type': attributes.type,
                }),
            },
            width: {
                default: 200,
                parseHTML: (element) => parseInt(element.getAttribute('data-width') || '200'),
                renderHTML: (attributes) => ({
                    'data-width': attributes.width,
                }),
            },
            height: {
                default: 100,
                parseHTML: (element) => parseInt(element.getAttribute('data-height') || '100'),
                renderHTML: (attributes) => ({
                    'data-height': attributes.height,
                }),
            },
            x: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-x') || '0'),
                renderHTML: (attributes) => ({
                    'data-x': attributes.x,
                }),
            },
            y: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-y') || '0'),
                renderHTML: (attributes) => ({
                    'data-y': attributes.y,
                }),
            },
            rotation: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-rotation') || '0'),
                renderHTML: (attributes) => ({
                    'data-rotation': attributes.rotation,
                }),
            },
            fillColor: {
                default: '#ffffff',
                parseHTML: (element) => element.getAttribute('data-fill-color'),
                renderHTML: (attributes) => ({
                    'data-fill-color': attributes.fillColor,
                }),
            },
            outlineColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-outline-color'),
                renderHTML: (attributes) => ({
                    'data-outline-color': attributes.outlineColor,
                }),
            },
            noFill: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-no-fill') === 'true',
                renderHTML: (attributes) => ({
                    'data-no-fill': attributes.noFill,
                }),
            },
            noOutline: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-no-outline') === 'true',
                renderHTML: (attributes) => ({
                    'data-no-outline': attributes.noOutline,
                }),
            },
            zIndex: {
                default: 1,
                parseHTML: (element) => parseInt(element.getAttribute('data-z-index') || '1'),
                renderHTML: (attributes) => ({
                    'data-z-index': attributes.zIndex,
                }),
            },
            imageUrl: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-image-url'),
                renderHTML: (attributes) => ({
                    'data-image-url': attributes.imageUrl,
                }),
            },
            text: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-text'),
                renderHTML: (attributes) => ({
                    'data-text': attributes.text,
                }),
            },
            textPosition: {
                default: 'center',
                parseHTML: (element) => element.getAttribute('data-text-position'),
                renderHTML: (attributes) => ({
                    'data-text-position': attributes.textPosition,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-shape]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-shape': '',
                class: 'shape-node',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ShapeNodeView);
    },

    addCommands() {
        return {
            insertShape:
                (options) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
            updateShape:
                (attrs) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, attrs);
                    },
            deleteShape:
                () =>
                    ({ commands }) => {
                        return commands.deleteNode(this.name);
                    },
        };
    },
});
