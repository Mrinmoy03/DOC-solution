import { Node, mergeAttributes } from '@tiptap/core';
import { wrappingInputRule } from '@tiptap/core';

export interface RomanListOptions {
    itemTypeName: string;
    HTMLAttributes: Record<string, any>;
    keepMarks: boolean;
    keepAttributes: boolean;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        romanList: {
            toggleRomanList: () => ReturnType;
        };
    }
}

export const RomanList = Node.create<RomanListOptions>({
    name: 'romanList',

    addOptions() {
        return {
            itemTypeName: 'listItem',
            HTMLAttributes: {},
            keepMarks: false,
            keepAttributes: false,
        };
    },

    group: 'block list',

    content() {
        return `${this.options.itemTypeName}+`;
    },

    parseHTML() {
        return [
            {
                tag: 'ol[data-type="roman"]',
                priority: 51,
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'ol',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'roman',
                class: 'roman-list',
            }),
            0,
        ];
    },

    addCommands() {
        return {
            toggleRomanList:
                () =>
                    ({ commands }) => {
                        return commands.toggleList(this.name, this.options.itemTypeName);
                    },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Shift-r': () => this.editor.commands.toggleRomanList(),
        };
    },

    addInputRules() {
        return [
            wrappingInputRule({
                find: /^i\.\s$/,
                type: this.type,
            }),
        ];
    },
});
