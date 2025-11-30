import { useState } from 'react';
import { X } from 'lucide-react';

interface PageSetupModalProps {
    onClose: () => void;
    onApply?: (settings: PageSettings) => void;
}

interface PageSettings {
    size: 'letter' | 'a4' | 'legal';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export const PageSetupModal = ({ onClose, onApply }: PageSetupModalProps) => {
    const [settings, setSettings] = useState<PageSettings>({
        size: 'letter',
        orientation: 'portrait',
        margins: { top: 1, bottom: 1, left: 1, right: 1 }
    });

    const handleApply = () => {
        if (onApply) {
            onApply(settings);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-[500px]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Page setup</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paper size</label>
                        <select
                            value={settings.size}
                            onChange={(e) => setSettings({ ...settings, size: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="letter">Letter (8.5" × 11")</option>
                            <option value="a4">A4 (210mm × 297mm)</option>
                            <option value="legal">Legal (8.5" × 14")</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={settings.orientation === 'portrait'}
                                    onChange={() => setSettings({ ...settings, orientation: 'portrait' })}
                                    className="mr-2"
                                />
                                Portrait
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={settings.orientation === 'landscape'}
                                    onChange={() => setSettings({ ...settings, orientation: 'landscape' })}
                                    className="mr-2"
                                />
                                Landscape
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Margins (inches)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Top</label>
                                <input
                                    type="number"
                                    value={settings.margins.top}
                                    onChange={(e) => setSettings({ ...settings, margins: { ...settings.margins, top: parseFloat(e.target.value) } })}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Bottom</label>
                                <input
                                    type="number"
                                    value={settings.margins.bottom}
                                    onChange={(e) => setSettings({ ...settings, margins: { ...settings.margins, bottom: parseFloat(e.target.value) } })}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Left</label>
                                <input
                                    type="number"
                                    value={settings.margins.left}
                                    onChange={(e) => setSettings({ ...settings, margins: { ...settings.margins, left: parseFloat(e.target.value) } })}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Right</label>
                                <input
                                    type="number"
                                    value={settings.margins.right}
                                    onChange={(e) => setSettings({ ...settings, margins: { ...settings.margins, right: parseFloat(e.target.value) } })}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
