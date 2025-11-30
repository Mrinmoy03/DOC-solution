import { useState, useEffect } from 'react';
import { X, Search, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface FindReplaceModalProps {
    onClose: () => void;
    editor: Editor | null;
}

export const FindReplaceModal = ({ onClose, editor }: FindReplaceModalProps) => {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [results, setResults] = useState<{ currentIndex: number; total: number }>({ currentIndex: 0, total: 0 });

    useEffect(() => {
        if (editor) {
            editor.commands.setSearchTerm(findText);
            updateResults();
        }
    }, [findText, editor]);

    // Poll for result updates (since extension storage updates don't automatically trigger React re-renders unless we subscribe)
    // Better approach: use editor.on('transaction') or similar, but polling is simpler for this quick fix
    useEffect(() => {
        if (!editor) return;

        const update = () => {
            updateResults();
        };

        editor.on('transaction', update);
        return () => {
            editor.off('transaction', update);
        };
    }, [editor]);

    const updateResults = () => {
        if (editor) {
            const storage = (editor.storage as any).search;
            if (storage) {
                setResults({
                    currentIndex: storage.currentIndex + 1,
                    total: storage.results.length
                });
            }
        }
    };

    const handleFindNext = () => {
        editor?.commands.findNext();
        // Force update logic is handled by transaction listener
        // But we might need to manually trigger a transaction to update decorations if they are stale
        // The command dispatch should trigger it.
        editor?.view.dispatch(editor.state.tr.setMeta('searchUpdated', true));
    };

    const handleFindPrevious = () => {
        editor?.commands.findPrevious();
        editor?.view.dispatch(editor.state.tr.setMeta('searchUpdated', true));
    };

    const handleReplace = () => {
        if (findText) {
            editor?.commands.replace(replaceText);
            // After replace, re-search to update indices
            setTimeout(() => {
                editor?.commands.setSearchTerm(findText);
            }, 50);
        }
    };

    const handleReplaceAll = () => {
        if (findText) {
            editor?.commands.replaceAll(replaceText);
            setTimeout(() => {
                editor?.commands.setSearchTerm(findText);
            }, 50);
        }
    };

    return (
        <div className="fixed top-20 right-10 bg-white rounded-lg shadow-xl w-[400px] z-[100] border border-gray-200 animate-in fade-in slide-in-from-top-5">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-move">
                <h2 className="text-sm font-semibold text-gray-700">Find and replace</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            placeholder="Find"
                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <div className="flex items-center text-xs text-gray-500 min-w-[60px] justify-end">
                        {results.total > 0 ? `${results.currentIndex} of ${results.total}` : '0 of 0'}
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={handleFindPrevious}
                            disabled={results.total === 0}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                            title="Previous match"
                        >
                            <ChevronUp size={16} />
                        </button>
                        <button
                            onClick={handleFindNext}
                            disabled={results.total === 0}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-50"
                            title="Next match"
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <ArrowRight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            placeholder="Replace with"
                            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        onClick={handleReplace}
                        disabled={results.total === 0}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded shadow-sm disabled:opacity-50"
                    >
                        Replace
                    </button>
                    <button
                        onClick={handleReplaceAll}
                        disabled={results.total === 0}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm disabled:opacity-50"
                    >
                        Replace all
                    </button>
                </div>
            </div>
        </div>
    );
};
