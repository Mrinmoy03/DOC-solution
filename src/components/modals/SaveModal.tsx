import { useState } from 'react';
import { X, FileText, FileType } from 'lucide-react';

interface SaveModalProps {
    onClose: () => void;
    onSave: (fileName: string, fileType: 'pdf' | 'docx') => void;
    currentFileName: string;
}

export const SaveModal = ({ onClose, onSave, currentFileName }: SaveModalProps) => {
    const [fileName, setFileName] = useState(currentFileName.replace(/\.(pdf|docx)$/i, ''));
    const [fileType, setFileType] = useState<'pdf' | 'docx'>('docx');

    const handleSave = () => {
        if (fileName) {
            onSave(fileName, fileType);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[450px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Save document</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">File name</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">File type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${fileType === 'docx' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                onClick={() => setFileType('docx')}
                            >
                                <FileType size={24} className={fileType === 'docx' ? 'text-blue-500' : 'text-gray-400'} />
                                <span className={`text-sm font-medium ${fileType === 'docx' ? 'text-blue-700' : 'text-gray-600'}`}>Word (.docx)</span>
                            </div>
                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${fileType === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                onClick={() => setFileType('pdf')}
                            >
                                <FileText size={24} className={fileType === 'pdf' ? 'text-blue-500' : 'text-gray-400'} />
                                <span className={`text-sm font-medium ${fileType === 'pdf' ? 'text-blue-700' : 'text-gray-600'}`}>PDF (.pdf)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!fileName}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
