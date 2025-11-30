import { useState } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';

interface InsertImageModalProps {
    onClose: () => void;
    onInsert: (src: string) => void;
}

export const InsertImageModal = ({ onClose, onInsert }: InsertImageModalProps) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                onInsert(result);
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlInsert = () => {
        if (imageUrl) {
            onInsert(imageUrl);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Insert image</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <TabButton
                        icon={<Upload size={16} />}
                        label="Upload"
                        active={activeTab === 'upload'}
                        onClick={() => setActiveTab('upload')}
                    />
                    <TabButton
                        icon={<LinkIcon size={16} />}
                        label="By URL"
                        active={activeTab === 'url'}
                        onClick={() => setActiveTab('url')}
                    />
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'upload' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-600 mb-2">Drag an image here</p>
                                <p className="text-sm text-gray-500 mb-4">or</p>
                                <label className="inline-block">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <span className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded cursor-pointer inline-block">
                                        Browse
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'url' && (
                        <div className="py-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                            </label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUrlInsert}
                                    disabled={!imageUrl}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Insert
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ icon, label, active, onClick }: {
    icon: React.ReactNode,
    label: string,
    active: boolean,
    onClick: () => void
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${active
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);
