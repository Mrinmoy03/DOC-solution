import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface HeaderFooterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({ isOpen, onClose }) => {
    const { headerFooter, setHeaderFooterState } = useEditorStore();
    const [showHeader, setShowHeader] = useState(headerFooter.showHeader);
    const [showFooter, setShowFooter] = useState(headerFooter.showFooter);
    const [headerMargin, setHeaderMargin] = useState(headerFooter.headerMargin);
    const [footerMargin, setFooterMargin] = useState(headerFooter.footerMargin);

    useEffect(() => {
        if (isOpen) {
            setShowHeader(headerFooter.showHeader);
            setShowFooter(headerFooter.showFooter);
            setHeaderMargin(headerFooter.headerMargin);
            setFooterMargin(headerFooter.footerMargin);
        }
    }, [isOpen, headerFooter]);

    const handleApply = () => {
        setHeaderFooterState({
            showHeader,
            showFooter,
            headerMargin,
            footerMargin,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[400px] max-w-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Headers & footers</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Options</h3>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showHeader"
                                checked={showHeader}
                                onChange={(e) => setShowHeader(e.target.checked)}
                                className="rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]"
                            />
                            <label htmlFor="showHeader" className="text-sm text-gray-700">Show header</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showFooter"
                                checked={showFooter}
                                onChange={(e) => setShowFooter(e.target.checked)}
                                className="rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]"
                            />
                            <label htmlFor="showFooter" className="text-sm text-gray-700">Show footer</label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Margins</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Header (inches from top)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={headerMargin}
                                    onChange={(e) => setHeaderMargin(parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Footer (inches from bottom)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={footerMargin}
                                    onChange={(e) => setFooterMargin(parseFloat(e.target.value))}
                                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] outline-none"
                                />
                            </div>
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
