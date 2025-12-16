import { useEditorStore } from '../../store/editorStore';

export const EditorFooter = () => {
    const { wordCount, currentPage } = useEditorStore();

    return (
        <div className="sticky bottom-0 z-30 h-8 bg-white border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-600 select-none">
            <div className="flex items-center gap-4">
                <span>Page {currentPage}</span>
                <span>{wordCount} words</span>
            </div>
            <div>
                {/* Additional footer items can go here */}
            </div>
        </div>
    );
};
