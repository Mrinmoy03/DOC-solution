import { useState } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';

interface InsertLinkModalProps {
    onClose: () => void;
    onInsert: (url: string, text?: string) => void;
    selectedText?: string;
}

export const InsertLinkModal = ({ onClose, onInsert, selectedText }: InsertLinkModalProps) => {
    const [url, setUrl] = useState('');
    const [linkText, setLinkText] = useState(selectedText || '');

    const handleInsert = () => {
        if (url) {
            onInsert(url, linkText);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[450px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Insert link</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text to display</label>
                        <input
                            type="text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            placeholder="Link text"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleInsert}
                            disabled={!url}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
                        >
                            <LinkIcon size={16} />
                            Insert
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
