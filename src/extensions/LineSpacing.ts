import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineSpacing: {
            /**
             * Set the line height
             */
            setLineHeight: (lineHeight: string) => ReturnType;
            /**
             * Unset the line height
             */
            unsetLineHeight: () => ReturnType;
        };
    }
}

export const LineSpacing = Extension.create({
    name: 'lineSpacing',

    addOptions() {
        return {
            types: ['paragraph', 'heading'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: element => element.style.lineHeight || null,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) {
                                return {};
                            }
                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setLineHeight:
                (lineHeight) =>
                    ({ tr, state, dispatch }) => {
                        const { selection } = state;
                        const { from, to } = selection;

                        if (dispatch) {
                            state.doc.nodesBetween(from, to, (node, pos) => {
                                if (this.options.types.includes(node.type.name)) {
                                    tr.setNodeMarkup(pos, undefined, {
                                        ...node.attrs,
                                        lineHeight,
                                    });
                                }
                            });
                        }

                        return true;
                    },
            unsetLineHeight:
                () =>
                    ({ tr, state, dispatch }) => {
                        const { selection } = state;
                        const { from, to } = selection;

                        if (dispatch) {
                            state.doc.nodesBetween(from, to, (node, pos) => {
                                if (this.options.types.includes(node.type.name)) {
                                    const newAttrs = { ...node.attrs };
                                    delete newAttrs.lineHeight;
                                    tr.setNodeMarkup(pos, undefined, newAttrs);
                                }
                            });
                        }

                        return true;
                    },
        };
    },
});
