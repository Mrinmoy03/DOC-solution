import React from 'react';

interface SaveModalProps {
    show: boolean;
    onClose: () => void;
    filename: string;
    setFilename: (name: string) => void;
    saveFormat: 'png' | 'jpeg' | 'webp';
    setSaveFormat: (format: 'png' | 'jpeg' | 'webp') => void;
    onDownload: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
    show,
    onClose,
    filename,
    setFilename,
    saveFormat,
    setSaveFormat,
    onDownload,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-white mb-2">Save Image</h3>
                <p className="text-slate-400 text-sm mb-6">Enter a name for your edited image.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Filename</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter filename"
                                autoFocus
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">.{saveFormat}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Format</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['png', 'jpeg', 'webp'] as const).map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => setSaveFormat(fmt)}
                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${saveFormat === fmt
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                        }`}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onDownload}
                            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25"
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
