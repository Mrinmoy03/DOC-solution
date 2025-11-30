import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { FontSize } from '../../extensions/FontSize';

interface RichTextHeaderFooterProps {
    content: string;
    onUpdate: (content: string) => void;
    placeholder?: string;
}

export const RichTextHeaderFooter = ({ content, onUpdate, placeholder }: RichTextHeaderFooterProps) => {
    const { setActiveEditor } = useEditorStore();

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
            Underline,
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
            onUpdate(editor.getHTML());
        },
        onFocus: ({ editor }) => {
            setActiveEditor(editor);
        },
    });

    // Update content if it changes externally (e.g. initial load)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Only update if content is significantly different to avoid cursor jumps
            // For simple use cases, this might be enough. 
            // Ideally we'd compare text content or use a more robust sync mechanism.
            // But for header/footer which are mostly static, this is okay.
            if (editor.isEmpty && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="w-full h-full" onClick={() => editor.chain().focus().run()}>
            <EditorContent editor={editor} className="w-full h-full" />
            {editor.isEmpty && (
                <div className="absolute top-0 left-0 text-gray-300 pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
};
