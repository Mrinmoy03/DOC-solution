import { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { ChevronRight, Check } from 'lucide-react';

interface EditorHeaderProps {
    fileName: string;
    setFileName: (name: string) => void;
    onClose: () => void;
    onSave?: () => void;
    onMenuAction?: (action: string) => void;
    editor: Editor | null;
}

type MenuType = 'file' | 'edit' | 'view' | 'insert' | 'format' | null;

export const EditorHeader = ({ fileName, setFileName, onClose, onSave, onMenuAction, editor }: EditorHeaderProps) => {
    const [activeMenu, setActiveMenu] = useState<MenuType>(null);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
                setActiveSubMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (menu: MenuType) => {
        setActiveMenu(activeMenu === menu ? null : menu);
        setActiveSubMenu(null);
    };

    const handleAction = (action: string) => {
        setActiveMenu(null);
        setActiveSubMenu(null);
        if (onMenuAction) {
            onMenuAction(action);
        }
    };

    const toggleFormat = (format: string) => {
        if (!editor) return;

        switch (format) {
            case 'bold': editor.chain().focus().toggleBold().run(); break;
            case 'italic': editor.chain().focus().toggleItalic().run(); break;
            case 'underline': editor.chain().focus().toggleUnderline().run(); break;
            case 'strike': editor.chain().focus().toggleStrike().run(); break;
            case 'superscript': editor.chain().focus().toggleSuperscript().run(); break;
            case 'subscript': editor.chain().focus().toggleSubscript().run(); break;
        }
        setActiveMenu(null);
        setActiveSubMenu(null);
    };

    const setStyle = (level: number | 'paragraph' | 'title' | 'subtitle') => {
        if (!editor) return;

        if (level === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else if (typeof level === 'number') {
            editor.chain().focus().toggleHeading({ level: level as any }).run();
        }
        // Title and Subtitle logic would go here if extensions were available, 
        // for now mapping to H1/H2 or custom logic if needed.
        // Assuming standard heading levels for now based on typical Tiptap usage.

        setActiveMenu(null);
        setActiveSubMenu(null);
    };

    return (
        <div className="bg-white px-4 py-1.5 flex items-center justify-between border-b border-gray-200">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4285F4] rounded flex items-center justify-center cursor-pointer hover:bg-[#3367D6] transition-colors" onClick={onClose}>
                    <FileTextIcon />
                </div>

                <div>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="text-base font-medium text-gray-800 hover:border-gray-300 border border-transparent px-1 rounded focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] outline-none h-6 w-48"
                    />
                    <div className="flex items-center gap-1 text-sm text-gray-700 relative mt-0.5" ref={menuRef}>
                        {/* File Menu */}
                        <div className="relative">
                            <MenuButton label="File" active={activeMenu === 'file'} onClick={() => toggleMenu('file')} />
                            {activeMenu === 'file' && (
                                <DropdownMenu>
                                    <MenuItem onClick={() => handleAction('new')}>New</MenuItem>
                                    <MenuItem onClick={() => handleAction('open')}>Open</MenuItem>
                                    <MenuItem onClick={() => { onSave?.(); setActiveMenu(null); }}>Save</MenuItem>

                                    <MenuDivider />
                                    <MenuItem onClick={() => { window.print(); setActiveMenu(null); }}>Print</MenuItem>
                                    <MenuItem onClick={() => handleAction('pageSetup')}>Page setup</MenuItem>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Edit Menu */}
                        <div className="relative">
                            <MenuButton label="Edit" active={activeMenu === 'edit'} onClick={() => toggleMenu('edit')} />
                            {activeMenu === 'edit' && (
                                <DropdownMenu>
                                    <MenuItem onClick={() => handleAction('undo')} shortcut="Ctrl+Z">Undo</MenuItem>
                                    <MenuItem onClick={() => handleAction('redo')} shortcut="Ctrl+Y">Redo</MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={() => handleAction('cut')} shortcut="Ctrl+X">Cut</MenuItem>
                                    <MenuItem onClick={() => handleAction('copy')} shortcut="Ctrl+C">Copy</MenuItem>
                                    <MenuItem onClick={() => handleAction('paste')} shortcut="Ctrl+V">Paste</MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={() => handleAction('selectAll')} shortcut="Ctrl+A">Select all</MenuItem>
                                    <MenuItem onClick={() => handleAction('findReplace')} shortcut="Ctrl+F">Find and replace</MenuItem>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* View Menu */}
                        <div className="relative">
                            <MenuButton label="View" active={activeMenu === 'view'} onClick={() => toggleMenu('view')} />
                            {activeMenu === 'view' && (
                                <DropdownMenu>
                                    <MenuItem onClick={() => handleAction('toggleRuler')}>Show ruler</MenuItem>
                                    <MenuItem onClick={() => handleAction('zoom')}>Zoom</MenuItem>
                                    <MenuItem onClick={() => handleAction('fullscreen')}>Full screen</MenuItem>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Insert Menu */}
                        <div className="relative">
                            <MenuButton label="Insert" active={activeMenu === 'insert'} onClick={() => toggleMenu('insert')} />
                            {activeMenu === 'insert' && (
                                <DropdownMenu>
                                    <MenuItem onClick={() => handleAction('insertImage')}>Image</MenuItem>
                                    <MenuItem onClick={() => handleAction('insertTable')}>Table</MenuItem>
                                    <MenuItem onClick={() => handleAction('insertLink')}>Link</MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={() => handleAction('insertTextBox')}>Text Box</MenuItem>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Format Menu */}
                        <div className="relative">
                            <MenuButton label="Format" active={activeMenu === 'format'} onClick={() => toggleMenu('format')} />
                            {activeMenu === 'format' && (
                                <DropdownMenu>
                                    <MenuItem
                                        hasSubmenu
                                        onMouseEnter={() => setActiveSubMenu('text')}
                                        active={activeSubMenu === 'text'}
                                    >
                                        Text
                                    </MenuItem>
                                    {activeSubMenu === 'text' && (
                                        <SubMenu>
                                            <MenuItem onClick={() => toggleFormat('bold')} shortcut="Ctrl+B" checked={editor?.isActive('bold')}>Bold</MenuItem>
                                            <MenuItem onClick={() => toggleFormat('italic')} shortcut="Ctrl+I" checked={editor?.isActive('italic')}>Italic</MenuItem>
                                            <MenuItem onClick={() => toggleFormat('underline')} shortcut="Ctrl+U" checked={editor?.isActive('underline')}>Underline</MenuItem>
                                            <MenuItem onClick={() => toggleFormat('strike')} shortcut="Alt+Shift+5" checked={editor?.isActive('strike')}>Strikethrough</MenuItem>
                                            <MenuItem onClick={() => toggleFormat('superscript')} shortcut="Ctrl+." checked={editor?.isActive('superscript')}>Superscript</MenuItem>
                                            <MenuItem onClick={() => toggleFormat('subscript')} shortcut="Ctrl+," checked={editor?.isActive('subscript')}>Subscript</MenuItem>
                                        </SubMenu>
                                    )}

                                    <MenuItem
                                        hasSubmenu
                                        onMouseEnter={() => setActiveSubMenu('paragraph')}
                                        active={activeSubMenu === 'paragraph'}
                                    >
                                        Paragraph styles
                                    </MenuItem>
                                    {activeSubMenu === 'paragraph' && (
                                        <SubMenu>
                                            <MenuItem onClick={() => setStyle('paragraph')} checked={editor?.isActive('paragraph')}>Normal Text</MenuItem>
                                            <MenuDivider />
                                            <MenuItem onClick={() => setStyle(1)} checked={editor?.isActive('heading', { level: 1 })}>Heading 1</MenuItem>
                                            <MenuItem onClick={() => setStyle(2)} checked={editor?.isActive('heading', { level: 2 })}>Heading 2</MenuItem>
                                            <MenuItem onClick={() => setStyle(3)} checked={editor?.isActive('heading', { level: 3 })}>Heading 3</MenuItem>
                                            <MenuItem onClick={() => setStyle(4)} checked={editor?.isActive('heading', { level: 4 })}>Heading 4</MenuItem>
                                            <MenuItem onClick={() => setStyle(5)} checked={editor?.isActive('heading', { level: 5 })}>Heading 5</MenuItem>
                                            <MenuItem onClick={() => setStyle(6)} checked={editor?.isActive('heading', { level: 6 })}>Heading 6</MenuItem>
                                        </SubMenu>
                                    )}

                                    <MenuDivider />
                                    <MenuItem
                                        hasSubmenu
                                        onMouseEnter={() => setActiveSubMenu('align')}
                                        active={activeSubMenu === 'align'}
                                    >
                                        Align & indent
                                    </MenuItem>
                                    {activeSubMenu === 'align' && (
                                        <SubMenu>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setTextAlign('left').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                shortcut="Ctrl+Shift+L"
                                                checked={editor?.isActive({ textAlign: 'left' })}
                                            >
                                                Left
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setTextAlign('center').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                shortcut="Ctrl+Shift+E"
                                                checked={editor?.isActive({ textAlign: 'center' })}
                                            >
                                                Center
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setTextAlign('right').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                shortcut="Ctrl+Shift+R"
                                                checked={editor?.isActive({ textAlign: 'right' })}
                                            >
                                                Right
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setTextAlign('justify').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                shortcut="Ctrl+Shift+J"
                                                checked={editor?.isActive({ textAlign: 'justify' })}
                                            >
                                                Justify
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    <MenuItem
                                        hasSubmenu
                                        onMouseEnter={() => setActiveSubMenu('spacing')}
                                        active={activeSubMenu === 'spacing'}
                                    >
                                        Line & paragraph spacing
                                    </MenuItem>
                                    {activeSubMenu === 'spacing' && (
                                        <SubMenu>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setLineHeight('1').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                checked={editor?.getAttributes('paragraph').lineHeight === '1'}
                                            >
                                                Single
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setLineHeight('1.15').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                checked={editor?.getAttributes('paragraph').lineHeight === '1.15'}
                                            >
                                                1.15
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setLineHeight('1.5').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                checked={editor?.getAttributes('paragraph').lineHeight === '1.5'}
                                            >
                                                1.5
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => { editor?.chain().focus().setLineHeight('2').run(); setActiveMenu(null); setActiveSubMenu(null); }}
                                                checked={editor?.getAttributes('paragraph').lineHeight === '2'}
                                            >
                                                Double
                                            </MenuItem>
                                        </SubMenu>
                                    )}

                                    <MenuDivider />
                                    <MenuItem onClick={() => { editor?.chain().focus().toggleBulletList().run(); setActiveMenu(null); }} checked={editor?.isActive('bulletList')}>Bulleted list</MenuItem>
                                    <MenuItem onClick={() => { editor?.chain().focus().toggleOrderedList().run(); setActiveMenu(null); }} checked={editor?.isActive('orderedList')}>Numbered list</MenuItem>
                                    <MenuItem onClick={() => { editor?.chain().focus().toggleAlphabeticalList().run(); setActiveMenu(null); }} checked={editor?.isActive('alphabeticalList')}>Alphabetical list</MenuItem>
                                    <MenuItem onClick={() => { editor?.chain().focus().toggleRomanList().run(); setActiveMenu(null); }} checked={editor?.isActive('romanList')}>Roman list</MenuItem>
                                    <MenuItem onClick={() => { editor?.chain().focus().toggleTaskList().run(); setActiveMenu(null); }} checked={editor?.isActive('taskList')}>Checklist</MenuItem>

                                    <MenuDivider />
                                    <MenuItem onClick={() => handleAction('headerFooter')}>Headers & footers</MenuItem>
                                    <MenuItem onClick={() => handleAction('pageNumber')}>Page numbers</MenuItem>
                                </DropdownMenu>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
        className={`hover:bg-gray-100 px-2 py-0.5 rounded text-xs ${active ? 'bg-gray-100' : ''}`}
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
    >
        {label}
    </button>
);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[240px] py-1">
        {children}
    </div>
);

const SubMenu = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute top-0 left-full ml-0 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[240px] py-1 -mt-1">
        {children}
    </div>
);

interface MenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    shortcut?: string;
    hasSubmenu?: boolean;
    onMouseEnter?: () => void;
    active?: boolean;
    checked?: boolean;
}

const MenuItem = ({ children, onClick, shortcut, hasSubmenu, onMouseEnter, active, checked }: MenuItemProps) => (
    <div
        className={`px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between text-sm relative ${active ? 'bg-gray-100' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseDown={(e) => e.preventDefault()}
    >
        <div className="flex items-center gap-2">
            <div className="w-4 flex items-center justify-center">
                {checked && <Check size={14} />}
            </div>
            <span>{children}</span>
        </div>
        <div className="flex items-center gap-2">
            {shortcut && <span className="text-xs text-gray-500">{shortcut}</span>}
            {hasSubmenu && <ChevronRight size={14} className="text-gray-500" />}
        </div>
    </div>
);

const MenuDivider = () => <div className="border-t border-gray-200 my-1" />;

const FileTextIcon = () => (
    <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
        <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 9V3.5L18.5 9H13Z" />
    </svg>
);
