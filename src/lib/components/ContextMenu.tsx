import React, { useEffect, useRef } from 'react';

interface ContextMenuProps {
    x: number;
    y: number;
    actions: { label: string; action: () => void }[];
    onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 shadow-lg rounded-md py-1 z-[9999]"
            style={{ top: y, left: x }}
        >
            {actions.length > 0 ? (
                actions.map((item, index) => (
                    <button
                        key={index}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                    >
                        {/* We can add icons here if needed */}
                        {item.label}
                    </button>
                ))
            ) : (
                <div className="px-4 py-2 text-sm text-gray-400 italic">No suggestions</div>
            )}
        </div>
    );
};
