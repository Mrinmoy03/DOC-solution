import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        search: {
            setSearchTerm: (term: string) => ReturnType;
            clearSearch: () => ReturnType;
            findNext: () => ReturnType;
            findPrevious: () => ReturnType;
            replace: (replacement: string) => ReturnType;
            replaceAll: (replacement: string) => ReturnType;
        };
    }
}

interface SearchOptions {
    searchTerm: string;
    currentIndex: number;
    results: { from: number; to: number }[];
}

export const SearchAndReplace = Extension.create<SearchOptions>({
    name: 'search',

    addOptions() {
        return {
            searchTerm: '',
            currentIndex: 0,
            results: [],
        };
    },

    addStorage() {
        return {
            searchTerm: '',
            results: [],
            currentIndex: -1,
        };
    },

    addCommands() {
        return {
            setSearchTerm:
                (term: string) =>
                    ({ editor, dispatch }) => {
                        if (dispatch) {
                            this.storage.searchTerm = term;
                            this.storage.currentIndex = -1;
                            this.storage.results = [];

                            if (term) {
                                const results: { from: number; to: number }[] = [];
                                editor.state.doc.descendants((node, pos) => {
                                    if (node.isText) {
                                        const text = node.text || '';
                                        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                        let match;
                                        while ((match = regex.exec(text)) !== null) {
                                            results.push({
                                                from: pos + match.index,
                                                to: pos + match.index + match[0].length,
                                            });
                                        }
                                    }
                                });
                                this.storage.results = results;
                                if (results.length > 0) {
                                    this.storage.currentIndex = 0;
                                }
                            }
                        }
                        return true;
                    },
            clearSearch:
                () =>
                    ({ dispatch }) => {
                        if (dispatch) {
                            this.storage.searchTerm = '';
                            this.storage.results = [];
                            this.storage.currentIndex = -1;
                        }
                        return true;
                    },
            findNext:
                () =>
                    ({ editor, dispatch }) => {
                        if (dispatch) {
                            if (this.storage.results.length > 0) {
                                this.storage.currentIndex = (this.storage.currentIndex + 1) % this.storage.results.length;
                                const result = this.storage.results[this.storage.currentIndex];
                                if (result) {
                                    editor.commands.setTextSelection({ from: result.from, to: result.to });
                                    editor.commands.scrollIntoView();
                                }
                            }
                        }
                        return true;
                    },
            findPrevious:
                () =>
                    ({ editor, dispatch }) => {
                        if (dispatch) {
                            if (this.storage.results.length > 0) {
                                this.storage.currentIndex = (this.storage.currentIndex - 1 + this.storage.results.length) % this.storage.results.length;
                                const result = this.storage.results[this.storage.currentIndex];
                                if (result) {
                                    editor.commands.setTextSelection({ from: result.from, to: result.to });
                                    editor.commands.scrollIntoView();
                                }
                            }
                        }
                        return true;
                    },
            replace:
                (replacement: string) =>
                    ({ dispatch, tr }) => {
                        if (dispatch) {
                            const currentResult = this.storage.results[this.storage.currentIndex];
                            if (currentResult) {
                                tr.insertText(replacement, currentResult.from, currentResult.to);
                            }
                        }
                        return true;
                    },
            replaceAll:
                (replacement: string) =>
                    ({ dispatch, tr }) => {
                        if (dispatch) {
                            const results = [...this.storage.results].reverse();
                            results.forEach(result => {
                                tr.insertText(replacement, result.from, result.to);
                            });
                        }
                        return true;
                    },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('search'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply: (tr, oldSet) => {
                        if (this.storage.searchTerm === '') {
                            return DecorationSet.empty;
                        }

                        if (tr.docChanged || tr.getMeta('searchUpdated')) {
                            const results: { from: number; to: number }[] = [];
                            const term = this.storage.searchTerm;

                            if (!term) return DecorationSet.empty;

                            tr.doc.descendants((node, pos) => {
                                if (node.isText) {
                                    const text = node.text || '';
                                    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                    let match;
                                    while ((match = regex.exec(text)) !== null) {
                                        results.push({
                                            from: pos + match.index,
                                            to: pos + match.index + match[0].length,
                                        });
                                    }
                                }
                            });
                            this.storage.results = results;

                            if (this.storage.currentIndex >= results.length) {
                                this.storage.currentIndex = 0;
                            }
                            if (results.length > 0 && this.storage.currentIndex === -1) {
                                this.storage.currentIndex = 0;
                            }

                            const decorations = results.map((result, index) => {
                                const isCurrent = index === this.storage.currentIndex;
                                return Decoration.inline(result.from, result.to, {
                                    class: isCurrent ? 'bg-yellow-400 text-black' : 'bg-yellow-200',
                                });
                            });

                            return DecorationSet.create(tr.doc, decorations);
                        }

                        return oldSet.map(tr.mapping, tr.doc);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});
