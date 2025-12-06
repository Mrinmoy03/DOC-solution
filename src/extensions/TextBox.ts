import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TextBoxNodeView } from '../components/editor/TextBoxNodeView';

export interface TextBoxOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textBox: {
            insertTextBox: (options?: {
                width?: number;
                height?: number;
                x?: number;
                y?: number;
            }) => ReturnType;
            updateTextBox: (attrs: Record<string, any>) => ReturnType;
            deleteTextBox: () => ReturnType;
        };
    }
}

export const TextBox = Node.create<TextBoxOptions>({
    name: 'textBox',

    group: 'block',

    content: 'block+',

    draggable: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            width: {
                default: 300,
                parseHTML: (element) => parseInt(element.getAttribute('data-width') || '300'),
                renderHTML: (attributes) => ({
                    'data-width': attributes.width,
                }),
            },
            height: {
                default: 150,
                parseHTML: (element) => parseInt(element.getAttribute('data-height') || '150'),
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
            shadowColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-shadow-color'),
                renderHTML: (attributes) => ({
                    'data-shadow-color': attributes.shadowColor,
                }),
            },
            shadowEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-shadow-enabled') === 'true',
                renderHTML: (attributes) => ({
                    'data-shadow-enabled': attributes.shadowEnabled,
                }),
            },
            reflectionEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-reflection-enabled') === 'true',
                renderHTML: (attributes) => ({
                    'data-reflection-enabled': attributes.reflectionEnabled,
                }),
            },
            threeDEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-3d-enabled') === 'true',
                renderHTML: (attributes) => ({
                    'data-3d-enabled': attributes.threeDEnabled,
                }),
            },
            isWatermark: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-watermark') === 'true',
                renderHTML: (attributes) => ({
                    'data-watermark': attributes.isWatermark,
                }),
            },
            watermarkSize: {
                default: 100,
                parseHTML: (element) => parseInt(element.getAttribute('data-watermark-size') || '100'),
                renderHTML: (attributes) => ({
                    'data-watermark-size': attributes.watermarkSize,
                }),
            },
            watermarkRotation: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-watermark-rotation') || '0'),
                renderHTML: (attributes) => ({
                    'data-watermark-rotation': attributes.watermarkRotation,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-textbox]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-textbox': '',
                class: 'textbox-node',
            }),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TextBoxNodeView);
    },

    addCommands() {
        return {
            insertTextBox:
                (options = {}) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                            content: [
                                {
                                    type: 'paragraph',
                                },
                            ],
                        });
                    },
            updateTextBox:
                (attrs) =>
                    ({ commands }) => {
                        return commands.updateAttributes(this.name, attrs);
                    },
            deleteTextBox:
                () =>
                    ({ commands }) => {
                        return commands.deleteNode(this.name);
                    },
        };
    },
});
