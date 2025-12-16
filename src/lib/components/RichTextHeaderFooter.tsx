import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { FontSize, UnderlineColor } from '../../lib/extensions';

interface RichTextHeaderFooterProps {
    content: string;
    onUpdate: (content: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
}

export const RichTextHeaderFooter = ({ content, onUpdate, placeholder, style, className }: RichTextHeaderFooterProps) => {
    const { setActiveEditor } = useEditorStore();
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // History is enabled by default. To disable it, we need to exclude it or configure it if supported.
                // Since 'history' option is not in the type, we'll omit it for now or use 'any' cast if strictly needed.
                // For now, let's just leave it enabled or try to exclude it if StarterKit supports 'exclude'.
                // StarterKit doesn't have an 'exclude' option in the config object directly for extensions usually.
                // We will just let it be for now to fix the build error.
            }),
            TextStyle,
            FontFamily,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['paragraph', 'heading'] }),
            UnderlineColor,
            Subscript,
            Superscript,
            Link,
            FontSize,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none w-full h-full',
            },
        },
        onUpdate: ({ editor }) => {
            if (onUpdateRef.current) {
                onUpdateRef.current(editor.getHTML());
            }
        },
        onFocus: ({ editor }) => {
            setActiveEditor(editor);
        },
    });

    // Update content if it changes externally (e.g. initial load or sync from other instances)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Check if this editor instance is focused to avoid overwriting while typing
            // We use setTimeout to ensure we don't interfere with the current event loop if needed
            if (!editor.isFocused) {
                // Save cursor position if we wanted to be super fancy, but for now just sync content
                // when not focused. This ensures other pages' headers update when one is typed in.
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div
            className={`w-full h-full cursor-text ${className || ''}`}
            style={style}
            onClick={() => editor.chain().focus().run()}
        >
            <EditorContent editor={editor} className="w-full h-full" />
            {editor.isEmpty && (
                <div className="absolute top-0 left-0 text-gray-300 pointer-events-none" style={{
                    // Adjust placeholder position to respect padding if needed, 
                    // but since EditorContent respects padding, and this is absolute...
                    // Actually, if div has padding, absolute child is relative to padding box? No.
                    // Absolute child is relative to border box of positioned ancestor.
                    // If we have padding on THIS div, the EditorContent is inside.
                    // But the placeholder is absolute top-0.
                    // So placeholder will stick to top of PADDING box (top of div).
                    // But text starts inside content box.
                    // So placeholder needs to be pushed down by padding?
                    // Or we just let the placeholder render inside the editor flow?
                    // Tiptap placeholder extension handles this better, but we are using custom div.
                    // Let's rely on the passed style being padding.
                    // If style has padding, unique handling might be needed.
                    // For now, let's assume we might need to apply the same padding to placeholder?
                    // OR better: use the Tiptap Placeholder extension instead of this custom div.
                    // But ensuring the user request is met, I will just apply the same padding to placeholder container if possible or just use top/left offsets.
                    // Let's try simple first: The visual label is absolute top-1.
                    // The text content is pushed by padding.
                    // If placeholder is top-0, it will be at top of div (over the label).
                    // We need placeholder to align with text.
                    // Text is displaced by padding.
                    // So placeholder should be too.
                    top: style?.paddingTop,
                    left: style?.paddingLeft,
                    right: style?.paddingRight,
                }}>
                    {placeholder}
                </div>
            )}
        </div>
    );
};
