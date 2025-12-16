import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { spellChecker } from '../utils/spellChecker';

export const Linter = Extension.create({
    name: 'linter',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('linter'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, oldSet) {
                        if (tr.docChanged) {
                            return getLintDecorations(tr.doc);
                        }
                        return oldSet.map(tr.mapping, tr.doc);
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                    handleKeyDown(view, event) {
                        if (event.key === 'Tab') {
                            const { state, dispatch } = view;
                            const { selection } = state;
                            const { $from } = selection;

                            let applied = false;

                            // Check for typo at exact cursor position
                            state.doc.nodesBetween($from.pos - 1, $from.pos + 1, (node, pos) => {
                                if (!node.isText) return;
                                const text = node.text || '';
                                const relativePos = $from.pos - pos;

                                // Simple word check around cursor
                                const wordRegex = /\b\w+\b/g;
                                let match;
                                while ((match = wordRegex.exec(text)) !== null) {
                                    // check if cursor is inside or right at end of word
                                    if (relativePos >= match.index && relativePos <= match.index + match[0].length) {
                                        const word = match[0].toLowerCase();
                                        if (COMMON_TYPOS[word]) {
                                            const suggestion = COMMON_TYPOS[word];
                                            const from = pos + match.index;
                                            const to = pos + match.index + match[0].length;

                                            dispatch(state.tr.insertText(suggestion, from, to));
                                            applied = true;
                                            return false; // stop iteration
                                        } else {
                                            // Check dictionary suggestion
                                            const suggestion = spellChecker.suggest(word);
                                            if (suggestion) {
                                                const from = pos + match.index;
                                                const to = pos + match.index + match[0].length;
                                                dispatch(state.tr.insertText(suggestion, from, to));
                                                applied = true;
                                                return false;
                                            }
                                        }
                                    }
                                }
                            });

                            if (applied) {
                                event.preventDefault();
                                event.stopPropagation(); // Stop propagation to other handlers
                                return true;
                            }
                        }
                        return false;
                    }
                },
            }),
        ];
    },
});

const COMMON_TYPOS: Record<string, string> = {
    'teh': 'the',
    'recieve': 'receive',
    'adress': 'address',
    'occured': 'occurred',
    'seperate': 'separate',
    'definately': 'definitely',
    'wont': "won't",
    'dont': "don't",
    'cant': "can't",
    'thier': 'their',
    'wich': 'which',
    'goverment': 'government',
    'accomodate': 'accommodate',
    'mispell': 'misspell',
    'publically': 'publicly',
    'helo': 'hello',
    'writting': 'writing',
    'calender': 'calendar',
    'priviledge': 'privilege',
    'independant': 'independent',
};

function getLintDecorations(doc: any): DecorationSet {
    const decorations: Decoration[] = [];

    doc.descendants((node: any, pos: number) => {
        if (!node.isText) return;

        const text = node.text;

        // 1. Double Spaces
        let match;
        const doubleSpaceRegex = /  /g;
        while ((match = doubleSpaceRegex.exec(text)) !== null) {
            decorations.push(
                Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                    class: 'lint-error',
                    'data-error-type': 'double-space',
                    'data-suggestion': ' '
                })
            );
        }

        // 2. Missing space after comma
        const commaRegex = /,[a-zA-Z]/g;
        while ((match = commaRegex.exec(text)) !== null) {
            decorations.push(
                Decoration.inline(pos + match.index, pos + match.index + 1, {
                    class: 'lint-error',
                    'data-error-type': 'missing-space-comma',
                    'data-suggestion': ', '
                })
            );
        }

        // 3. Lowercase sentence start
        const sentenceRegex = /(?:^|[.!?]\s)([a-z])/g;
        while ((match = sentenceRegex.exec(text)) !== null) {
            // match[1] is the letter
            // Full match could be ". a" (length 3) or "a" (length 1 if start)
            // We need correct offset
            const fullMatch = match[0];
            const letter = match[1];
            const offset = fullMatch.lastIndexOf(letter);

            decorations.push(
                Decoration.inline(pos + match.index + offset, pos + match.index + offset + 1, {
                    class: 'lint-error',
                    'data-error-type': 'lowercase-start',
                    'data-suggestion': letter.toUpperCase()
                })
            );
        }

        // 4. Repeated Words (e.g., "the the")
        const repeatedWordRegex = /\b(\w+)\s+\1\b/gi;
        while ((match = repeatedWordRegex.exec(text)) !== null) {
            decorations.push(
                Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                    class: 'lint-error',
                    'data-error-type': 'repeated-word',
                })
            );
        }

        // 5. Common Typos & Dictionary Check
        // We iterate words to find typos
        const wordRegex = /\b\w+\b/g;
        while ((match = wordRegex.exec(text)) !== null) {
            const word = match[0].toLowerCase();
            if (COMMON_TYPOS[word]) {
                decorations.push(
                    Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                        class: 'lint-error',
                        'data-error-type': 'spelling',
                        'data-suggestion': COMMON_TYPOS[word]
                    })
                );
            } else if (!spellChecker.check(word)) {
                const suggestion = spellChecker.suggest(word);
                // Highlight even if no suggestion found (strict mode)
                decorations.push(
                    Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                        class: 'lint-error',
                        'data-error-type': 'spelling',
                        'data-suggestion': suggestion || ''
                    })
                );
            }
        }

        // 6. Long Sentences (Warning)
        // Split by punctuation
        // This is tricky per node, ideally we traverse sentences across nodes, but for now block-level is okay-ish?
        // Actually, Tiptap often splits paragraphs into text nodes. Each paragraph is usually a text node if no marks.
        // Let's check word count in the current text node for simplicity (approximation).
        const wordCount = text.split(/\s+/).length;
        if (wordCount > 40) {
            decorations.push(
                Decoration.inline(pos, pos + text.length, {
                    class: 'lint-warning',
                    'data-error-type': 'long-sentence',
                })
            );
        }
    });

    return DecorationSet.create(doc, decorations);
}
