import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface PageNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PageNumberModal: React.FC<PageNumberModalProps> = ({ isOpen, onClose }) => {
    const { pageNumber, setPageNumberState } = useEditorStore();
    const [position, setPosition] = useState(pageNumber.position);
    const [showOnFirstPage, setShowOnFirstPage] = useState(pageNumber.showOnFirstPage);
    const [format, setFormat] = useState(pageNumber.format);

    useEffect(() => {
        if (isOpen) {
            setPosition(pageNumber.position);
            setShowOnFirstPage(pageNumber.showOnFirstPage);
            setFormat(pageNumber.format);
        }
    }, [isOpen, pageNumber]);

    const handleApply = () => {
        setPageNumberState({
            showPageNumbers: true,
            position,
            showOnFirstPage,
            format,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Page numbers</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Position</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPosition('top-right')}
                                className={`p-3 border rounded flex flex-col items-center gap-2 hover:bg-gray-50 ${position.startsWith('top') ? 'border-[#4285F4] bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="w-full h-12 border border-gray-300 bg-white relative">
                                    <div className="absolute top-1 right-1 text-[8px] text-gray-400">1</div>
                                </div>
                                <span className="text-xs text-gray-600">Header</span>
                            </button>
                            <button
                                onClick={() => setPosition('bottom-right')}
                                className={`p-3 border rounded flex flex-col items-center gap-2 hover:bg-gray-50 ${position.startsWith('bottom') ? 'border-[#4285F4] bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="w-full h-12 border border-gray-300 bg-white relative">
                                    <div className="absolute bottom-1 right-1 text-[8px] text-gray-400">1</div>
                                </div>
                                <span className="text-xs text-gray-600">Footer</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showOnFirstPage"
                                checked={showOnFirstPage}
                                onChange={(e) => setShowOnFirstPage(e.target.checked)}
                                className="rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]"
                            />
                            <label htmlFor="showOnFirstPage" className="text-sm text-gray-700">Show on first page</label>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#4285F4] hover:bg-[#3367D6] rounded"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
