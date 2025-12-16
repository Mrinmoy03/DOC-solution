import { Underline } from '@tiptap/extension-underline';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        underlineColor: {
            /**
             * Set the underline color
             */
            setUnderlineColor: (color: string) => ReturnType;
            /**
             * Set the underline style
             */
            setUnderlineStyle: (style: string) => ReturnType;
        };
    }
}

export const UnderlineColor = Underline.extend({
    name: 'underlineColor',
    addAttributes() {
        return {
            ...this.parent?.(),
            color: {
                default: null,
                parseHTML: element => element.style.textDecorationColor || element.style.textDecoration.split(' ').find(s => s.startsWith('#') || s.startsWith('rgb')),
            },
            style: {
                default: null,
                parseHTML: element => element.style.textDecorationStyle,
            }
        };
    },

    renderHTML({ HTMLAttributes }) {
        const { color, style, ...attributes } = HTMLAttributes;
        const styles: string[] = [];

        if (color) {
            styles.push(`text-decoration-color: ${color}`);
        }
        if (style) {
            styles.push(`text-decoration-style: ${style}`);
        }

        if (styles.length > 0) {
            attributes.style = styles.join('; ');
        }

        return ['u', attributes, 0];
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setUnderlineColor: (color) => ({ chain }) => {
                const attributes = this.editor.getAttributes(this.name);
                return chain()
                    .setMark(this.name, { ...attributes, color })
                    .run();
            },
            setUnderlineStyle: (style) => ({ chain }) => {
                const attributes = this.editor.getAttributes(this.name);
                return chain()
                    .setMark(this.name, { ...attributes, style })
                    .run();
            }
        };
    },
});
