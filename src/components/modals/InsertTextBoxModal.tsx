import { X, Type } from 'lucide-react';

interface InsertTextBoxModalProps {
    onClose: () => void;
    onInsert: () => void;
}

export const InsertTextBoxModal = ({ onClose, onInsert }: InsertTextBoxModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Insert Text Box</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Type size={32} className="text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-2">
                            Insert a text box that you can drag, rotate, and format with various effects.
                        </p>
                        <p className="text-xs text-gray-500 text-center">
                            You can add shadow, reflection, 3D effects, or convert it to a watermark.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onInsert();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                        Insert Text Box
                    </button>
                </div>
            </div>
        </div>
    );
};
