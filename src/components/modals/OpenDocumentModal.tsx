import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface OpenDocumentModalProps {
    onClose: () => void;
    onFileSelect: (file: File) => void;
}

export const OpenDocumentModal = ({ onClose, onFileSelect }: OpenDocumentModalProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.docx') || file.name.endsWith('.doc') || file.name.endsWith('.pdf'))) {
            onFileSelect(file);
            onClose();
        } else {
            alert('Please select a valid .docx or .pdf file');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileSelect(file);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-[600px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Open a file</h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center h-[300px] transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Upload size={32} className="text-gray-500" />
                        </div>
                        <p className="text-lg text-gray-700 mb-2">Drag a file here</p>
                        <p className="text-sm text-gray-500 mb-6">Or, if you prefer...</p>
                        <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer font-medium transition-colors">
                            Select a file from your device
                            <input
                                type="file"
                                className="hidden"
                                accept=".docx,.doc,.pdf"
                                onChange={handleFileChange}
                            />
                        </label>
                        <p className="mt-4 text-xs text-gray-400">Supported formats: .docx, .doc, .pdf</p>
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
