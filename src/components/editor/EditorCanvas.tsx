import { EditorContent, Editor } from '@tiptap/react';
import { RichTextHeaderFooter } from './RichTextHeaderFooter';
import { useEditorStore } from '../../store/editorStore';

interface EditorCanvasProps {
    editor: Editor | null;
}

export const EditorCanvas = ({ editor }: EditorCanvasProps) => {
    const { ruler, page, zoom, headerFooter } = useEditorStore();
    const { leftMargin, rightMargin, topMargin, bottomMargin } = ruler;
    const { width, height } = page;

    return (
        <div className="flex-1 overflow-y-auto bg-[#F9FBFD] p-8 cursor-text" onClick={() => editor?.chain().focus().run()}>
            <div
                className="mx-auto bg-white shadow-sm border border-gray-200 relative"
                style={{
                    width: `${width}px`,
                    minHeight: `${height}px`,
                    paddingTop: `${topMargin}px`,
                    paddingBottom: `${bottomMargin}px`,
                    paddingLeft: `${leftMargin}px`,
                    paddingRight: `${rightMargin}px`,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                }}
            >
                {/* Header Area */}
                {headerFooter.showHeader && (
                    <div
                        className="absolute left-0 right-0 border-b border-transparent hover:border-gray-200 group"
                        style={{
                            top: 0,
                            height: `${topMargin}px`,
                            padding: `${headerFooter.headerMargin * 96}px ${rightMargin}px 0 ${leftMargin}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full">
                            <RichTextHeaderFooter
                                content={headerFooter.headerContent}
                                onUpdate={(content) => useEditorStore.getState().setHeaderFooterState({ headerContent: content })}
                                placeholder="Header"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Area */}
                {headerFooter.showFooter && (
                    <div
                        className="absolute left-0 right-0 border-t border-transparent hover:border-gray-200 group"
                        style={{
                            bottom: 0,
                            height: `${bottomMargin}px`,
                            padding: `0 ${rightMargin}px ${headerFooter.footerMargin * 96}px ${leftMargin}px`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full h-full">
                            <RichTextHeaderFooter
                                content={headerFooter.footerContent}
                                onUpdate={(content) => useEditorStore.getState().setHeaderFooterState({ footerContent: content })}
                                placeholder="Footer"
                            />
                        </div>
                    </div>
                )}

                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
