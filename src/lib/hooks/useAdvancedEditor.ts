import { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import {
    SearchAndReplace,
    FontSize,
    LineSpacing,
    ImageExtension,
    AlphabeticalList,
    RomanList,
    UnderlineColor,
    TextBox,
    Shape,
    TextEffects,
    Pagination,
    Linter,
    Chart
} from '../extensions';
import { useEditorStore } from '../../store/editorStore';

interface UseAdvancedEditorProps {
    initialContent?: string;
    onUpdate?: () => void;
}

export const useAdvancedEditor = ({ initialContent, onUpdate }: UseAdvancedEditorProps = {}) => {
    const { setWordCount } = useEditorStore();

    // Selection State
    const [selectedShapeNode, setSelectedShapeNode] = useState<{ node: Node, pos: number } | null>(null);
    const [selectedTextBoxNode, setSelectedTextBoxNode] = useState<{ node: Node, pos: number } | null>(null);
    const [selectedImageNode, setSelectedImageNode] = useState<{ node: Node, pos: number } | null>(null);
    const [isInTable, setIsInTable] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, actions: { label: string, action: () => void }[] } | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
            }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            ImageExtension.configure({
                allowBase64: true,
                inline: true,
            }),
            Table.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        id: {
                            default: null,
                            parseHTML: element => element.getAttribute('id'),
                            renderHTML: attributes => {
                                if (!attributes.id) {
                                    return {};
                                }
                                return { id: attributes.id };
                            },
                        },
                    };
                },
            }).configure({
                resizable: true,
            }),
            TableRow,
            TableHeader.extend({
                content: 'paragraph+',  // Ensure cells can contain paragraphs with text
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        style: {
                            default: null,
                            parseHTML: element => element.getAttribute('style'),
                            renderHTML: attributes => {
                                if (!attributes.style) {
                                    return {};
                                }
                                return { style: attributes.style };
                            },
                        },
                    };
                },
            }),
            TableCell.extend({
                content: 'paragraph+',  // Ensure cells can contain paragraphs with text
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        style: {
                            default: null,
                            parseHTML: element => element.getAttribute('style'),
                            renderHTML: attributes => {
                                if (!attributes.style) {
                                    return {};
                                }
                                return { style: attributes.style };
                            },
                        },
                        'data-formula': {
                            default: null,
                            parseHTML: element => element.getAttribute('data-formula'),
                            renderHTML: attributes => {
                                if (!attributes['data-formula']) {
                                    return {};
                                }
                                return { 'data-formula': attributes['data-formula'] };
                            },
                        },
                    };
                },
            }),
            CharacterCount,
            SearchAndReplace,
            Link.extend({
                inclusive: false,
            }).configure({
                openOnClick: true,
                autolink: true,
                defaultProtocol: 'https',
            }),
            Subscript,
            Superscript,
            FontSize,
            LineSpacing,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            AlphabeticalList,
            RomanList,
            UnderlineColor,
            TextBox,
            Shape,
            TextEffects,
            Pagination,
            Linter,
            Chart,
        ],
        content: initialContent || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[1056px]',
                spellcheck: 'true',
            },
        },
        onUpdate: ({ editor }) => {
            setWordCount(editor.storage.characterCount.words());
            const { selection } = editor.state;
            const node = (selection as unknown as { node: Node }).node;

            // Update Shape Node
            if (node && node.type.name === 'shape') {
                setSelectedShapeNode({ node: node, pos: selection.from });
            }

            // Update TextBox Node
            let textBoxFound = false;
            if (node && node.type.name === 'textBox') {
                setSelectedTextBoxNode({ node: node, pos: selection.from });
                textBoxFound = true;
            } else {
                const { $from } = selection;
                for (let d = $from.depth; d > 0; d--) {
                    const parentNode = $from.node(d);
                    if (parentNode.type.name === 'textBox') {
                        setSelectedTextBoxNode({ node: parentNode, pos: $from.before(d) });
                        textBoxFound = true;
                        break;
                    }
                }
            }

            if (!textBoxFound && selectedTextBoxNode) {
                setSelectedTextBoxNode(null);
            }
            if (selectedShapeNode && (!node || node.type.name !== 'shape')) {
                setSelectedShapeNode(null);
            }

            onUpdate?.();
        },
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;
            const node = (selection as unknown as { node: Node }).node;

            if (node && node.type.name === 'image') {
                setSelectedImageNode({ node: node, pos: selection.from });
            } else {
                setSelectedImageNode(null);
            }

            let textBoxFound = false;
            if (node && node.type.name === 'textBox') {
                setSelectedTextBoxNode({ node: node, pos: selection.from });
                textBoxFound = true;
            } else {
                const { $from } = selection;
                for (let d = $from.depth; d > 0; d--) {
                    const parentNode = $from.node(d);
                    if (parentNode.type.name === 'textBox') {
                        setSelectedTextBoxNode({ node: parentNode, pos: $from.before(d) });
                        textBoxFound = true;
                        break;
                    }
                }
            }
            if (!textBoxFound) {
                setSelectedTextBoxNode(null);
            }

            if (node && node.type.name === 'shape') {
                setSelectedShapeNode({ node: node, pos: selection.from });
            } else {
                setSelectedShapeNode(null);
            }

            const isTable = editor.isActive('table');
            setIsInTable(isTable);

            // Close context menu on selection change
            if (contextMenu) setContextMenu(null);
        },
    });

    // Handle Context Menu (Right Click)
    useEffect(() => {
        if (!editor) return;

        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('lint-error')) {
                e.preventDefault();
                const errorType = target.getAttribute('data-error-type');

                const view = editor.view;
                const pos = view.posAtDOM(target, 0);

                let actions: { label: string, action: () => void }[] = [];

                // ... (Linter context menu logic - copying from DocumentEditor)
                if (errorType === 'double-space') {
                    actions.push({
                        label: 'Fix: Single Space',
                        action: () => {
                            let problemRange: { from: number, to: number } | null = null;
                            const searchStart = Math.max(0, pos - 10);
                            const searchEnd = Math.min(view.state.doc.content.size, pos + 10);

                            view.state.doc.nodesBetween(searchStart, searchEnd, (node, p) => {
                                if (!node.isText) return;
                                const regex = /  /g;
                                let match;
                                while ((match = regex.exec(node.text!)) !== null) {
                                    const absStart = p + match.index;
                                    const absEnd = absStart + 2;
                                    if (pos >= absStart && pos <= absEnd) {
                                        problemRange = { from: absStart, to: absEnd };
                                    }
                                }
                            });

                            if (problemRange !== null) {
                                const { from } = problemRange;
                                editor.chain().deleteRange(problemRange).insertContentAt(from, ' ').run();
                            }
                        }
                    });
                } else if (errorType === 'missing-space-comma') {
                    actions.push({
                        label: 'Fix: Add Space',
                        action: () => {
                            let problemPos: number | null = null;
                            const searchStart = Math.max(0, pos - 10);
                            const searchEnd = Math.min(view.state.doc.content.size, pos + 10);

                            view.state.doc.nodesBetween(searchStart, searchEnd, (node, p) => {
                                if (!node.isText) return;
                                const regex = /,[a-zA-Z]/g;
                                let match;
                                while ((match = regex.exec(node.text!)) !== null) {
                                    const absCommaPos = p + match.index;
                                    if (pos >= absCommaPos && pos <= absCommaPos + 2) {
                                        problemPos = absCommaPos + 1;
                                    }
                                }
                            });

                            if (problemPos) {
                                editor.chain().insertContentAt(problemPos, ' ').run();
                            }
                        }
                    });
                } else if (errorType === 'lowercase-start') {
                    actions.push({
                        label: 'Fix: Capitalize',
                        action: () => {
                            let charPos: number | null = null;
                            const searchStart = Math.max(0, pos - 10);
                            const searchEnd = Math.min(view.state.doc.content.size, pos + 10);

                            view.state.doc.nodesBetween(searchStart, searchEnd, (node, p) => {
                                if (!node.isText) return;
                                const regex = /(?:\. |^)([a-z])/g;
                                let match;
                                while ((match = regex.exec(node.text!)) !== null) {
                                    const fullMatch = match[0];
                                    const offset = fullMatch.includes('. ') ? 2 : 0;
                                    const absCharPos = p + match.index + offset;
                                    if (pos >= absCharPos && pos <= absCharPos + 1) {
                                        charPos = absCharPos;
                                    }
                                }
                            });

                            if (charPos !== null) {
                                const char = editor.state.doc.textBetween(charPos, charPos + 1);
                                editor.chain().deleteRange({ from: charPos, to: charPos + 1 }).insertContentAt(charPos, char.toUpperCase()).run();
                            }
                        }
                    });
                } else if (errorType === 'spelling') {
                    const suggestion = target.getAttribute('data-suggestion');
                    if (suggestion) {
                        actions.push({
                            label: `Fix: ${suggestion}`,
                            action: () => {
                                let problemRange: { from: number, to: number } | null = null;
                                const searchStart = Math.max(0, pos - 20);
                                const searchEnd = Math.min(view.state.doc.content.size, pos + 20);

                                view.state.doc.nodesBetween(searchStart, searchEnd, (node, p) => {
                                    if (!node.isText) return;
                                    const wordRegex = /\b\w+\b/g;
                                    let match;
                                    while ((match = wordRegex.exec(node.text!)) !== null) {
                                        const absStart = p + match.index;
                                        const absEnd = absStart + match[0].length;
                                        if (pos >= absStart && pos <= absEnd) {
                                            problemRange = { from: absStart, to: absEnd };
                                        }
                                    }
                                });

                                if (problemRange !== null) {
                                    const { from } = problemRange;
                                    editor.chain().deleteRange(problemRange).insertContentAt(from, suggestion).run();
                                }
                            }
                        });
                    }
                } else if (errorType === 'repeated-word') {
                    actions.push({
                        label: 'Fix: Remove repeated word',
                        action: () => {
                            let problemRange: { from: number, to: number } | null = null;
                            const searchStart = Math.max(0, pos - 20);
                            const searchEnd = Math.min(view.state.doc.content.size, pos + 20);

                            view.state.doc.nodesBetween(searchStart, searchEnd, (node, p) => {
                                if (!node.isText) return;
                                const regex = /\b(\w+)\s+\1\b/gi;
                                let match;
                                while ((match = regex.exec(node.text!)) !== null) {
                                    const absStart = p + match.index;
                                    const absEnd = absStart + match[0].length;
                                    if (pos >= absStart && pos <= absEnd) {
                                        problemRange = { from: absStart, to: absEnd };
                                    }
                                }
                            });

                            if (problemRange !== null) {
                                const { from, to } = problemRange;
                                const fullText = editor.state.doc.textBetween(from, to);
                                const word = fullText.split(/\s+/)[0];
                                editor.chain().deleteRange(problemRange).insertContentAt(from, word).run();
                            }
                        }
                    });
                } else if (errorType === 'long-sentence') {
                    actions.push({
                        label: 'Suggestion: Split this sentence',
                        action: () => {
                            editor.commands.focus();
                        }
                    });
                    actions.push({
                        label: 'Ignore',
                        action: () => { }
                    });
                }

                setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    actions
                });
            }
        };

        const dom = editor.view.dom;
        dom.addEventListener('contextmenu', handleContextMenu);
        return () => dom.removeEventListener('contextmenu', handleContextMenu);
    }, [editor]);

    // Sync active editor with store
    useEffect(() => {
        if (editor) {
            useEditorStore.getState().setActiveEditor(editor);
            const handleFocus = () => {
                useEditorStore.getState().setActiveEditor(editor);
            };
            editor.on('focus', handleFocus);

            // DEBUGGING: Expose editor to window for console diagnostics
            (window as any).__editor__ = editor;

            // DEBUGGING: Add diagnostic function
            (window as any).diagnoseTable = () => {
                const { state } = editor;
                const { $from } = state.selection;

                console.log('🔍 TABLE DIAGNOSTIC:');
                console.log('Selection depth:', $from.depth);

                // Find table
                let tableNode: any = null;
                let tableDepth = -1;
                for (let d = $from.depth; d > 0; d--) {
                    const node = $from.node(d);
                    console.log(`  Depth ${d}: ${node.type.name}`);
                    if (node.type.name === 'table') {
                        tableNode = node;
                        tableDepth = d;
                        break;
                    }
                }

                if (!tableNode) {
                    console.error('❌ No table found at current position');
                    return;
                }

                console.log('✅ Found table at depth:', tableDepth);
                console.log('   childCount:', tableNode.childCount);
                console.log('   content.size:', tableNode.content.size);

                // Iterate children
                console.log('\n📋 Table Structure:');
                tableNode.forEach((child: any, _offset: number, index: number) => {
                    console.log(`  Row ${index}: ${child.type.name}, childCount: ${child.childCount}`);
                    if (child.type.name === 'tableRow') {
                        child.forEach((cell: any, _cellOffset: number, cellIndex: number) => {
                            console.log(`    Cell ${cellIndex}: ${cell.type.name}, text: "${cell.textContent}"`);
                        });
                    }
                });

                return tableNode;
            };

            // console.log('💡 Diagnostic function available: Run diagnoseTable() in console when cursor is in a table');

            return () => {
                editor.off('focus', handleFocus);
                useEditorStore.getState().setActiveEditor(null);
                delete (window as any).__editor__;
                delete (window as any).diagnoseTable;
            };
        }
    }, [editor]);

    return {
        editor,
        selectedShapeNode,
        selectedTextBoxNode,
        selectedImageNode,
        isInTable,
        contextMenu,
        setContextMenu,
    };
};
