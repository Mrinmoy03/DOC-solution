import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ShapeNodeView } from '../components';

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

    draggable: false,

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
            textBelow: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-text-below'),
                renderHTML: (attributes) => ({
                    'data-text-below': attributes.textBelow,
                }),
            },
            isEditing: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-is-editing') === 'true',
                renderHTML: (attributes) => ({
                    'data-is-editing': attributes.isEditing,
                }),
            },
            editingField: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-editing-field'),
                renderHTML: (attributes) => ({
                    'data-editing-field': attributes.editingField,
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
            // Shadow Attributes
            shadowBlur: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-shadow-blur') || '4'),
                renderHTML: (attributes) => ({ 'data-shadow-blur': attributes.shadowBlur }),
            },
            shadowOpacity: {
                default: 0.4,
                parseHTML: (element) => parseFloat(element.getAttribute('data-shadow-opacity') || '0.4'),
                renderHTML: (attributes) => ({ 'data-shadow-opacity': attributes.shadowOpacity }),
            },
            shadowOffsetX: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-shadow-offset-x') || '4'),
                renderHTML: (attributes) => ({ 'data-shadow-offset-x': attributes.shadowOffsetX }),
            },
            shadowOffsetY: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-shadow-offset-y') || '4'),
                renderHTML: (attributes) => ({ 'data-shadow-offset-y': attributes.shadowOffsetY }),
            },
            shadowColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-shadow-color'),
                renderHTML: (attributes) => ({ 'data-shadow-color': attributes.shadowColor }),
            },
            shadowSpread: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-shadow-spread') || '0'),
                renderHTML: (attributes) => ({ 'data-shadow-spread': attributes.shadowSpread }),
            },
            shadowInset: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-shadow-inset') === 'true',
                renderHTML: (attributes) => ({ 'data-shadow-inset': attributes.shadowInset }),
            },
            reflectionOffset: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-reflection-offset') || '0'),
                renderHTML: (attributes) => ({ 'data-reflection-offset': attributes.reflectionOffset }),
            },
            reflectionSize: {
                default: 0.5, // 50% height
                parseHTML: (element) => parseFloat(element.getAttribute('data-reflection-size') || '0.5'),
                renderHTML: (attributes) => ({ 'data-reflection-size': attributes.reflectionSize }),
            },
            reflectionOpacity: {
                default: 0.4,
                parseHTML: (element) => parseFloat(element.getAttribute('data-reflection-opacity') || '0.4'),
                renderHTML: (attributes) => ({ 'data-reflection-opacity': attributes.reflectionOpacity }),
            },
            reflectionColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-reflection-color'),
                renderHTML: (attributes) => ({ 'data-reflection-color': attributes.reflectionColor }),
            },
            threeDDepth: {
                default: 600,
                parseHTML: (element) => parseInt(element.getAttribute('data-3d-depth') || '600'),
                renderHTML: (attributes) => ({ 'data-3d-depth': attributes.threeDDepth }),
            },
            threeDExtrusion: {
                default: 5,
                parseHTML: (element) => parseInt(element.getAttribute('data-3d-extrusion') || '5'),
                renderHTML: (attributes) => ({ 'data-3d-extrusion': attributes.threeDExtrusion }),
            },
            threeDColor: {
                default: '#cccccc',
                parseHTML: (element) => element.getAttribute('data-3d-color'),
                renderHTML: (attributes) => ({ 'data-3d-color': attributes.threeDColor }),
            },
            threeDRotateX: {
                default: 15,
                parseHTML: (element) => parseInt(element.getAttribute('data-3d-rotate-x') || '15'),
                renderHTML: (attributes) => ({ 'data-3d-rotate-x': attributes.threeDRotateX }),
            },
            threeDRotateY: {
                default: 15,
                parseHTML: (element) => parseInt(element.getAttribute('data-3d-rotate-y') || '15'),
                renderHTML: (attributes) => ({ 'data-3d-rotate-y': attributes.threeDRotateY }),
            },
            // Text Effects Attributes
            textShadowEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-text-shadow-enabled') === 'true',
                renderHTML: (attributes) => ({ 'data-text-shadow-enabled': attributes.textShadowEnabled }),
            },
            textShadowColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-text-shadow-color'),
                renderHTML: (attributes) => ({ 'data-text-shadow-color': attributes.textShadowColor }),
            },
            textShadowBlur: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-shadow-blur') || '4'),
                renderHTML: (attributes) => ({ 'data-text-shadow-blur': attributes.textShadowBlur }),
            },
            textShadowOpacity: {
                default: 0.4,
                parseHTML: (element) => parseFloat(element.getAttribute('data-text-shadow-opacity') || '0.4'),
                renderHTML: (attributes) => ({ 'data-text-shadow-opacity': attributes.textShadowOpacity }),
            },
            textShadowOffsetX: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-shadow-offset-x') || '4'),
                renderHTML: (attributes) => ({ 'data-text-shadow-offset-x': attributes.textShadowOffsetX }),
            },
            textShadowOffsetY: {
                default: 4,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-shadow-offset-y') || '4'),
                renderHTML: (attributes) => ({ 'data-text-shadow-offset-y': attributes.textShadowOffsetY }),
            },
            textShadowSpread: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-shadow-spread') || '0'),
                renderHTML: (attributes) => ({ 'data-text-shadow-spread': attributes.textShadowSpread }),
            },
            textShadowInset: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-text-shadow-inset') === 'true',
                renderHTML: (attributes) => ({ 'data-text-shadow-inset': attributes.textShadowInset }),
            },
            textReflectionEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-text-reflection-enabled') === 'true',
                renderHTML: (attributes) => ({ 'data-text-reflection-enabled': attributes.textReflectionEnabled }),
            },
            textReflectionOffset: {
                default: 0,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-reflection-offset') || '0'),
                renderHTML: (attributes) => ({ 'data-text-reflection-offset': attributes.textReflectionOffset }),
            },
            textReflectionSize: {
                default: 0.5,
                parseHTML: (element) => parseFloat(element.getAttribute('data-text-reflection-size') || '0.5'),
                renderHTML: (attributes) => ({ 'data-text-reflection-size': attributes.textReflectionSize }),
            },
            textReflectionOpacity: {
                default: 0.4,
                parseHTML: (element) => parseFloat(element.getAttribute('data-text-reflection-opacity') || '0.4'),
                renderHTML: (attributes) => ({ 'data-text-reflection-opacity': attributes.textReflectionOpacity }),
            },
            textReflectionColor: {
                default: '#000000',
                parseHTML: (element) => element.getAttribute('data-text-reflection-color'),
                renderHTML: (attributes) => ({ 'data-text-reflection-color': attributes.textReflectionColor }),
            },
            textThreeDEnabled: {
                default: false,
                parseHTML: (element) => element.getAttribute('data-text-3d-enabled') === 'true',
                renderHTML: (attributes) => ({ 'data-text-3d-enabled': attributes.textThreeDEnabled }),
            },
            textThreeDDepth: {
                default: 600,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-3d-depth') || '600'),
                renderHTML: (attributes) => ({ 'data-text-3d-depth': attributes.textThreeDDepth }),
            },
            textThreeDExtrusion: {
                default: 5,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-3d-extrusion') || '5'),
                renderHTML: (attributes) => ({ 'data-text-3d-extrusion': attributes.textThreeDExtrusion }),
            },
            textThreeDColor: {
                default: '#cccccc',
                parseHTML: (element) => element.getAttribute('data-text-3d-color'),
                renderHTML: (attributes) => ({ 'data-text-3d-color': attributes.textThreeDColor }),
            },
            textThreeDRotateX: {
                default: 15,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-3d-rotate-x') || '15'),
                renderHTML: (attributes) => ({ 'data-text-3d-rotate-x': attributes.textThreeDRotateX }),
            },
            textThreeDRotateY: {
                default: 15,
                parseHTML: (element) => parseInt(element.getAttribute('data-text-3d-rotate-y') || '15'),
                renderHTML: (attributes) => ({ 'data-text-3d-rotate-y': attributes.textThreeDRotateY }),
            },
            // Text Effects Attributes

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
