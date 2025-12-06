import { Node, mergeAttributes } from '@tiptap/core';
import { wrappingInputRule } from '@tiptap/core';

export interface AlphabeticalListOptions {
    itemTypeName: string;
    HTMLAttributes: Record<string, any>;
    keepMarks: boolean;
    keepAttributes: boolean;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        alphabeticalList: {
            toggleAlphabeticalList: () => ReturnType;
        };
    }
}

export const AlphabeticalList = Node.create<AlphabeticalListOptions>({
    name: 'alphabeticalList',

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
                tag: 'ol[data-type="alphabetical"]',
                priority: 51,
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'ol',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'alphabetical',
                class: 'alphabetical-list',
            }),
            0,
        ];
    },

    addCommands() {
        return {
            toggleAlphabeticalList:
                () =>
                    ({ commands }) => {
                        return commands.toggleList(this.name, this.options.itemTypeName);
                    },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Shift-a': () => this.editor.commands.toggleAlphabeticalList(),
        };
    },

    addInputRules() {
        return [
            wrappingInputRule({
                find: /^a\.\s$/,
                type: this.type,
            }),
        ];
    },
});
