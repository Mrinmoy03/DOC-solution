import { useState, useEffect } from 'react';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Minus, Plus,
    Undo, Redo, Printer, PaintBucket, Type, Highlighter, CheckSquare,
    RemoveFormatting, ChevronDown, Strikethrough, Superscript, Subscript, Check
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { InsertImageModal } from '../modals/InsertImageModal';
import { InsertLinkModal } from '../modals/InsertLinkModal';

export const EditorToolbar = () => {
    const { zoom, setZoom, activeEditor } = useEditorStore();
    const [showImageModal, setShowImageModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showZoomMenu, setShowZoomMenu] = useState(false);
    const [showStyleMenu, setShowStyleMenu] = useState(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showHighlight, setShowHighlight] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [selectedLinkText, setSelectedLinkText] = useState('');

    const fonts = [
        'Arial',
        'Amatic SC',
        'Caveat',
        'Comfortaa',
        'Comic Sans MS',
        'Courier New',
        'EB Garamond',
        'Georgia',
        'Impact',
        'Lexend',
        'Lobster',
        'Lora',
        'Merriweather',
        'Montserrat',
        'Nunito',
        'Oswald',
        'Times New Roman',
        'Verdana',
    ];

    const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

    const fontSizes = Array.from({ length: 92 }, (_, i) => i + 5); // 5 to 96

    const editor = activeEditor;

    // Close font menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.font-menu-container')) {
                setShowFontMenu(false);
            }
            if (!target.closest('.font-size-menu-container')) {
                setShowFontSizeMenu(false);
            }
        };

        if (showFontMenu || showFontSizeMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showFontMenu, showFontSizeMenu]);

    // Close font/font size menus when other menus open
    useEffect(() => {
        if (showZoomMenu || showStyleMenu || showTextColor || showHighlight) {
            setShowFontMenu(false);
            setShowFontSizeMenu(false);
        }
    }, [showZoomMenu, showStyleMenu, showTextColor, showHighlight]);

    if (!editor) return (
        <div className="bg-[#edf2fa] px-4 py-1.5 flex items-center gap-1.5 border-b border-gray-300 flex-wrap sticky top-0 z-20 rounded-t-2xl mx-4 mt-2 opacity-50 pointer-events-none">
            {/* Render disabled toolbar structure */}
            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton disabled title="Undo (Ctrl+Z)"><Undo size={16} /></ToolbarButton>
                <ToolbarButton disabled title="Redo (Ctrl+Y)"><Redo size={16} /></ToolbarButton>
                <ToolbarButton disabled title="Print (Ctrl+P)"><Printer size={16} /></ToolbarButton>
                <ToolbarButton disabled title="Paint format"><PaintBucket size={16} /></ToolbarButton>
            </div>
            {/* ... rest of disabled toolbar ... */}
        </div>
    );

    const toggleBold = () => editor.chain().focus().toggleBold().run();
    const toggleItalic = () => editor.chain().focus().toggleItalic().run();
    const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
    const toggleStrike = () => editor.chain().focus().toggleStrike().run();
    const toggleSuperscript = () => editor.chain().focus().toggleSuperscript().run();
    const toggleSubscript = () => editor.chain().focus().toggleSubscript().run();

    const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
        editor.chain().focus().setTextAlign(align).run();
    };

    const handleInsertImage = (url: string) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleInsertLink = (url: string, text?: string) => {
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            finalUrl = 'https://' + url;
        }

        if (text) {
            if (editor.state.selection.empty) {
                editor.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
            } else {
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
                if (selectedText && text !== selectedText) {
                    editor.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
                } else {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
                }
            }
        } else {
            editor.chain().focus().setLink({ href: finalUrl }).run();
        }
        setShowLinkModal(false);
    };

    const setStyle = (style: string, level?: number) => {
        if (style === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else if (style === 'heading' && level) {
            editor.chain().focus().toggleHeading({ level: level as any }).run();
        }
        setShowStyleMenu(false);
    };

    const setTextColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setShowTextColor(false);
    };

    const setHighlightColor = (color: string) => {
        editor.chain().focus().toggleHighlight({ color }).run();
        setShowHighlight(false);
    };

    const setFont = (font: string) => {
        editor.chain().focus().setFontFamily(font).run();
        setShowFontMenu(false);
    };

    const getCurrentFont = () => {
        return editor.getAttributes('textStyle').fontFamily || 'Arial';
    };

    const getCurrentStyleName = () => {
        if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
        if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
        if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
        if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
        if (editor.isActive('heading', { level: 5 })) return 'Heading 5';
        if (editor.isActive('heading', { level: 6 })) return 'Heading 6';
        if (editor.isActive('paragraph')) return 'Normal text';
        return 'Normal text';
    };

    return (
        <div className="bg-[#edf2fa] px-4 py-1.5 flex items-center gap-1.5 border-b border-gray-300 flex-wrap sticky top-0 z-40 rounded-t-2xl mx-4 mt-2">
            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
                    <Redo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => window.print()} title="Print (Ctrl+P)">
                    <Printer size={16} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1 relative">
                <button
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded text-sm font-medium min-w-[60px] justify-between"
                    onClick={() => setShowZoomMenu(!showZoomMenu)}
                >
                    {zoom}% <ChevronDown size={12} />
                </button>
                {showZoomMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-32 py-1">
                        {[50, 75, 100, 125, 150, 200].map((z) => (
                            <div
                                key={z}
                                className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => { setZoom(z); setShowZoomMenu(false); }}
                            >
                                {z}%
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1 relative">
                <button
                    className="flex items-center gap-1 px-2 py-1 hover:bg-gray-200 rounded text-sm font-medium min-w-[100px] justify-between"
                    onClick={() => setShowStyleMenu(!showStyleMenu)}
                >
                    {getCurrentStyleName()} <ChevronDown size={12} />
                </button>
                {showStyleMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-48 py-1 max-h-60 overflow-y-auto">
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('paragraph')}>Normal text</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xl font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 1)}>Heading 1</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-lg font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 2)}>Heading 2</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 3)}>Heading 3</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-base font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 4)}>Heading 4</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 5)}>Heading 5</div>
                        <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => setStyle('heading', 6)}>Heading 6</div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <div className="relative font-menu-container">
                    <button
                        className="flex items-center border border-gray-300 rounded bg-white h-7 px-2 hover:bg-gray-50 min-w-[120px] justify-between"
                        onClick={() => setShowFontMenu(!showFontMenu)}
                    >
                        <span className="text-sm truncate max-w-[100px]">{getCurrentFont()}</span>
                        <ChevronDown size={12} className="ml-1 text-gray-500" />
                    </button>
                    {showFontMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-48 py-1 max-h-60 overflow-y-auto">
                            {fonts.map((font) => (
                                <div
                                    key={font}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between"
                                    style={{ fontFamily: font }}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setFont(font)}
                                >
                                    <span>{font}</span>
                                    {getCurrentFont() === font && <Check size={14} className="text-blue-600" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center border border-gray-300 rounded bg-white h-7">
                    <button
                        className="px-1.5 hover:bg-gray-100 border-r border-gray-300 h-full flex items-center justify-center"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            let currentSize = parseInt(editor.getAttributes('textStyle').fontSize);
                            if (!currentSize) {
                                if (editor.isActive('heading', { level: 1 })) currentSize = 40;
                                else if (editor.isActive('heading', { level: 2 })) currentSize = 36;
                                else if (editor.isActive('heading', { level: 3 })) currentSize = 32;
                                else if (editor.isActive('heading', { level: 4 })) currentSize = 28;
                                else if (editor.isActive('heading', { level: 5 })) currentSize = 24;
                                else if (editor.isActive('heading', { level: 6 })) currentSize = 20;
                                else currentSize = 16;
                            }
                            const newSize = Math.max(1, currentSize - 1);
                            editor.chain().focus().setDocumentFontSize(`${newSize}px`).run();
                        }}
                    >
                        <Minus size={12} />
                    </button>
                    <div className="relative font-size-menu-container">
                        <input
                            type="text"
                            value={(() => {
                                const size = parseInt(editor.getAttributes('textStyle').fontSize);
                                if (size) return size;
                                if (editor.isActive('heading', { level: 1 })) return 40;
                                if (editor.isActive('heading', { level: 2 })) return 36;
                                if (editor.isActive('heading', { level: 3 })) return 32;
                                if (editor.isActive('heading', { level: 4 })) return 28;
                                if (editor.isActive('heading', { level: 5 })) return 24;
                                if (editor.isActive('heading', { level: 6 })) return 20;
                                return 16;
                            })()}
                            className="w-10 text-center text-sm outline-none h-full cursor-text hover:bg-gray-50"
                            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
                            readOnly
                        />
                         {showFontSizeMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 w-16 py-1 max-h-60 overflow-y-auto">
                                {fontSizes.map((size) => (
                                    <div
                                        key={size}
                                        className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm text-center"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => {
                                            editor.chain().focus().setDocumentFontSize(`${size}px`).run();
                                            setShowFontSizeMenu(false);
                                        }}
                                    >
                                        {size}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        className="px-1.5 hover:bg-gray-100 border-l border-gray-300 h-full flex items-center justify-center"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            let currentSize = parseInt(editor.getAttributes('textStyle').fontSize);
                            if (!currentSize) {
                                if (editor.isActive('heading', { level: 1 })) currentSize = 40;
                                else if (editor.isActive('heading', { level: 2 })) currentSize = 36;
                                else if (editor.isActive('heading', { level: 3 })) currentSize = 32;
                                else if (editor.isActive('heading', { level: 4 })) currentSize = 28;
                                else if (editor.isActive('heading', { level: 5 })) currentSize = 24;
                                else if (editor.isActive('heading', { level: 6 })) currentSize = 20;
                                else currentSize = 16;
                            }
                            const newSize = Math.min(96, currentSize + 1);
                            editor.chain().focus().setDocumentFontSize(`${newSize}px`).run();
                        }}
                    >
                        <Plus size={12} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleUnderline} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
                    <Underline size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleStrike} isActive={editor.isActive('strike')} title="Strikethrough (Alt+Shift+5)">
                    <Strikethrough size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleSuperscript} isActive={editor.isActive('superscript')} title="Superscript (Ctrl+.)">
                    <Superscript size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={toggleSubscript} isActive={editor.isActive('subscript')} title="Subscript (Ctrl+,)">
                    <Subscript size={16} />
                </ToolbarButton>

                {/* Text Color */}
                <div className="relative">
                    <ToolbarButton onClick={() => setShowTextColor(!showTextColor)} title="Text color">
                        <Type size={16} className="text-red-500" />
                    </ToolbarButton>
                    {showTextColor && (
                        <ColorPicker onSelect={setTextColor} onClose={() => setShowTextColor(false)} />
                    )}
                </div>

                {/* Highlight Color */}
                <div className="relative">
                    <ToolbarButton onClick={() => setShowHighlight(!showHighlight)} title="Highlight color">
                        <Highlighter size={16} />
                    </ToolbarButton>
                    {showHighlight && (
                        <ColorPicker onSelect={setHighlightColor} onClose={() => setShowHighlight(false)} />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton onClick={() => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, ' ');
                    setSelectedLinkText(text);
                    setShowLinkModal(true);
                }} isActive={editor.isActive('link')} title="Insert link">
                    <LinkIcon size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => setShowImageModal(true)} title="Insert image">
                    <ImageIcon size={16} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton onClick={() => setTextAlign('left')} isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
                    <AlignLeft size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => setTextAlign('center')} isActive={editor.isActive({ textAlign: 'center' })} title="Align center">
                    <AlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => setTextAlign('right')} isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
                    <AlignRight size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => setTextAlign('justify')} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
                    <AlignJustify size={16} />
                </ToolbarButton>
            </div>

            <div className="flex items-center gap-0.5 border-r border-gray-300 pr-2 mr-1">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet list">
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered list">
                    <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist">
                    <CheckSquare size={16} />
                </ToolbarButton>
            </div>

            {showImageModal && (
                <InsertImageModal
                    onClose={() => setShowImageModal(false)}
                    onInsert={handleInsertImage}
                />
            )}
            {showLinkModal && (
                <InsertLinkModal
                    onClose={() => setShowLinkModal(false)}
                    onInsert={handleInsertLink}
                    selectedText={selectedLinkText}
                />
            )}
        </div>
    );
};

const ToolbarButton = ({ children, onClick, isActive, disabled, title }: { children: React.ReactNode, onClick?: () => void, isActive?: boolean, disabled?: boolean, title?: string }) => (
    <button
        className={`p-1 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        disabled={disabled}
        title={title}
    >
        {children}
    </button>
);

const ColorPicker = ({ onSelect, onClose }: { onSelect: (color: string) => void, onClose: () => void }) => {
    const colors = [
        '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF',
        '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF',
    ];

    return (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-2 w-56">
            <div className="grid grid-cols-10 gap-1">
                {colors.map(color => (
                    <div
                        key={color}
                        className="w-4 h-4 cursor-pointer border border-gray-300 hover:scale-110 transition-transform rounded-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => onSelect(color)}
                    />
                ))}
            </div>
            <button
                onClick={onClose}
                className="mt-2 w-full text-xs text-gray-600 hover:text-gray-800 text-center"
            >
                Close
            </button>
        </div>
    );
};
