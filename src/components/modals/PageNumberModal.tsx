import React, { useState, useEffect } from 'react';
import { X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface PageNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PageNumberModal: React.FC<PageNumberModalProps> = ({ isOpen, onClose }) => {
    const { pageNumber, setPageNumberState } = useEditorStore();

    // Split combined position into vertical ('top' | 'bottom') and horizontal ('left' | 'center' | 'right')
    const [verticalPos, setVerticalPos] = useState<'top' | 'bottom'>('bottom');
    const [horizontalPos, setHorizontalPos] = useState<'left' | 'center' | 'right'>('right');

    const [showOnFirstPage, setShowOnFirstPage] = useState(pageNumber.showOnFirstPage);
    const [format, setFormat] = useState(pageNumber.format);

    useEffect(() => {
        if (isOpen) {
            const [v, h] = pageNumber.position.split('-') as ['top' | 'bottom', 'left' | 'center' | 'right'];
            setVerticalPos(v);
            setHorizontalPos(h || 'right'); // Default to right if undefined (legacy)
            setShowOnFirstPage(pageNumber.showOnFirstPage);
            setFormat(pageNumber.format);
        }
    }, [isOpen, pageNumber]);

    const handleApply = () => {
        setPageNumberState({
            showPageNumbers: true,
            position: `${verticalPos}-${horizontalPos}` as any,
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
                                onClick={() => setVerticalPos('top')}
                                className={`p-3 border rounded flex flex-col items-center gap-2 hover:bg-gray-50 ${verticalPos === 'top' ? 'border-[#4285F4] bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="w-full h-12 border border-gray-300 bg-white relative">
                                    <div className={`absolute top-1 w-2 h-2 bg-gray-400 rounded-full ${horizontalPos === 'left' ? 'left-1' : horizontalPos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-1'}`}></div>
                                </div>
                                <span className="text-xs text-gray-600">Header</span>
                            </button>
                            <button
                                onClick={() => setVerticalPos('bottom')}
                                className={`p-3 border rounded flex flex-col items-center gap-2 hover:bg-gray-50 ${verticalPos === 'bottom' ? 'border-[#4285F4] bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="w-full h-12 border border-gray-300 bg-white relative">
                                    <div className={`absolute bottom-1 w-2 h-2 bg-gray-400 rounded-full ${horizontalPos === 'left' ? 'left-1' : horizontalPos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-1'}`}></div>
                                </div>
                                <span className="text-xs text-gray-600">Footer</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Alignment</h3>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                            <button
                                onClick={() => setHorizontalPos('left')}
                                className={`p-2 rounded ${horizontalPos === 'left' ? 'bg-white shadow-sm text-[#4285F4]' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Left"
                            >
                                <AlignLeft size={20} />
                            </button>
                            <button
                                onClick={() => setHorizontalPos('center')}
                                className={`p-2 rounded ${horizontalPos === 'center' ? 'bg-white shadow-sm text-[#4285F4]' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Center"
                            >
                                <AlignCenter size={20} />
                            </button>
                            <button
                                onClick={() => setHorizontalPos('right')}
                                className={`p-2 rounded ${horizontalPos === 'right' ? 'bg-white shadow-sm text-[#4285F4]' : 'text-gray-600 hover:text-gray-900'}`}
                                title="Right"
                            >
                                <AlignRight size={20} />
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
