import { useState } from 'react';
import { Crop, Edit3, Image as ImageIcon, Replace } from 'lucide-react';

interface ImageToolbarProps {
    onCrop: () => void;
    // onResize: () => void; // Removed
    onEdit: () => void;
    onPosition: (position: string) => void;
    onReplace: () => void;
    currentPosition?: string;
}

export const ImageToolbar = ({
    onCrop,
    // onResize, // Removed
    onEdit,
    onPosition,
    onReplace,
    currentPosition = 'inline'
}: ImageToolbarProps) => {
    const [showPositionMenu, setShowPositionMenu] = useState(false);

    const positions = [
        { value: 'inline', label: 'Inline with text', icon: '📄' },
        { value: 'wrap-left', label: 'Wrap text right', icon: '◀️' },
        { value: 'wrap-right', label: 'Wrap text left', icon: '▶️' },
        { value: 'break', label: 'Break text', icon: '📋' },
        { value: 'behind', label: 'Behind text', icon: '⬇️' },
        { value: 'front', label: 'In front of text', icon: '⬆️' },
    ];

    return (
        <div className="bg-white border border-gray-300 rounded shadow-lg p-2 flex items-center gap-2 absolute z-50" style={{ top: '-50px', left: '50%', transform: 'translateX(-50%)' }}>
            <button
                onClick={onCrop}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Crop image"
            >
                <Crop size={18} />
            </button>



            <button
                onClick={onEdit}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Edit image"
            >
                <Edit3 size={18} />
            </button>

            <div className="relative">
                <button
                    onClick={() => setShowPositionMenu(!showPositionMenu)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Image position"
                >
                    <ImageIcon size={18} />
                </button>

                {showPositionMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-48 py-1">
                        {positions.map((pos) => (
                            <div
                                key={pos.value}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                                onClick={() => {
                                    onPosition(pos.value);
                                    setShowPositionMenu(false);
                                }}
                            >
                                <span>{pos.icon}</span>
                                <span>{pos.label}</span>
                                {currentPosition === pos.value && <span className="ml-auto text-blue-600">✓</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={onReplace}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Replace image"
            >
                <Replace size={18} />
            </button>
        </div>
    );
};
