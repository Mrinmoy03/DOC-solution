import { Mark, mergeAttributes } from '@tiptap/core';

export interface TextEffectsOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textEffects: {
            setTextEffects: (attributes: Record<string, any>) => ReturnType;
            unsetTextEffects: () => ReturnType;
        };
    }
}

export const TextEffects = Mark.create<TextEffectsOptions>({
    name: 'textEffects',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            // Shadow
            shadowEnabled: { default: false },
            shadowColor: { default: '#000000' },
            shadowBlur: { default: 2 },
            shadowOpacity: { default: 0.4 },
            shadowOffsetX: { default: 2 },
            shadowOffsetY: { default: 2 },

            // Reflection
            reflectionEnabled: { default: false },
            reflectionOffset: { default: 0 },
            reflectionOpacity: { default: 0.4 },
            reflectionSize: { default: 1.0 },
            reflectionColor: { default: '#000000' },

            // 3D
            threeDEnabled: { default: false },
            threeDDepth: { default: 600 },
            threeDExtrusion: { default: 5 },
            threeDColor: { default: '#cccccc' },
            threeDRotateX: { default: 0 },
            threeDRotateY: { default: 0 },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-text-effects]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const styles: Record<string, string> = {
            'display': 'inline-block', // Required for transform/reflection
            'transition': 'all 0.3s ease',
        };

        // Helper for hex to rgba
        const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        // Text Shadow
        if (HTMLAttributes.shadowEnabled) {
            styles['text-shadow'] = `${HTMLAttributes.shadowOffsetX || 2}px ${HTMLAttributes.shadowOffsetY || 2}px ${HTMLAttributes.shadowBlur || 2}px ${hexToRgba(HTMLAttributes.shadowColor || '#000000', HTMLAttributes.shadowOpacity || 0.4)}`;
        }

        // Reflection
        if (HTMLAttributes.reflectionEnabled) {
            // Standard reflection: fade out from top (near text) to bottom
            const color = hexToRgba(HTMLAttributes.reflectionColor || '#000000', HTMLAttributes.reflectionOpacity || 0.4);
            styles['-webkit-box-reflect'] = `below ${HTMLAttributes.reflectionOffset || 0}px linear-gradient(to bottom, ${color}, transparent ${Math.round((HTMLAttributes.reflectionSize || 0.5) * 100)}%)`;
        }

        // 3D
        if (HTMLAttributes.threeDEnabled) {
            const extrusion = HTMLAttributes.threeDExtrusion || 5;
            const step = extrusion > 10 ? 2 : 1;
            const shadows = [];
            for (let i = 1; i <= extrusion; i += step) {
                shadows.push(`${i}px ${i}px 0 ${HTMLAttributes.threeDColor || '#cccccc'}`);
            }
            styles['text-shadow'] = shadows.join(', ');
            styles['transform'] = `perspective(${HTMLAttributes.threeDDepth || 600}px) rotateX(${HTMLAttributes.threeDRotateX || 0}deg) rotateY(${HTMLAttributes.threeDRotateY || 0}deg)`;
        }

        // Convert styles object to string
        const styleString = Object.entries(styles)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');

        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
            style: styleString,
            'data-text-effects': ''
        }), 0];
    },

    addCommands() {
        return {
            setTextEffects:
                attributes =>
                    ({ commands }) => {
                        return commands.setMark(this.name, attributes);
                    },
            unsetTextEffects:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
