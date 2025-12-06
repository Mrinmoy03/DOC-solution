import { X, Square, Circle, Minus } from 'lucide-react';

interface InsertShapeModalProps {
    onClose: () => void;
    onInsert: (type: 'line' | 'rectangle' | 'circle') => void;
}

export const InsertShapeModal = ({ onClose, onInsert }: InsertShapeModalProps) => {
    const shapes = [
        { type: 'line' as const, icon: Minus, label: 'Line' },
        { type: 'rectangle' as const, icon: Square, label: 'Rectangle' },
        { type: 'circle' as const, icon: Circle, label: 'Circle' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-96 max-w-full mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Insert Shape</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">Choose a shape to insert:</p>
                    <div className="grid grid-cols-3 gap-4">
                        {shapes.map(({ type, icon: Icon, label }) => (
                            <button
                                key={type}
                                onClick={() => {
                                    onInsert(type);
                                    onClose();
                                }}
                                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <Icon size={32} className="text-gray-600 group-hover:text-blue-600 mb-2" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
