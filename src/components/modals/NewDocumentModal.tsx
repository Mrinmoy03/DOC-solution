import { X, AlertTriangle } from 'lucide-react';

interface NewDocumentModalProps {
    onClose: () => void;
    onConfirm: (saveFirst: boolean) => void;
}

export const NewDocumentModal = ({ onClose, onConfirm }: NewDocumentModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[450px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">New document</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertTriangle className="text-yellow-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-medium text-gray-900 mb-1">Save current document?</h3>
                            <p className="text-sm text-gray-600">
                                Do you want to save the changes to the current document before creating a new one?
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(false)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium"
                        >
                            Don't Save
                        </button>
                        <button
                            onClick={() => onConfirm(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
                        >
                            Save & New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
