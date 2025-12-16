import React from 'react';

interface HeaderProps {
    file: File | null;
    onClose: () => void;
    onSaveClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ file, onClose, onSaveClick }) => {
    return (
        <div className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="text-xl">✨</span>
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight">{file?.name}</h1>
                    <p className="text-slate-400 text-xs font-medium">Professional Editor</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onSaveClick}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-105"
                >
                    Save Image
                </button>
            </div>
        </div>
    );
};
