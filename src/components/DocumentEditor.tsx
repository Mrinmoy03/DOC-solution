import { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import { Node } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CharacterCount from '@tiptap/extension-character-count';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { EditorHeader } from './editor/EditorHeader';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorRuler } from './editor/EditorRuler';
import { VerticalRuler } from './editor/VerticalRuler';
import { EditorCanvas } from './editor/EditorCanvas';
import { EditorFooter } from './editor/EditorFooter';
import { FindReplaceModal } from './modals/FindReplaceModal';
import { PageSetupModal } from './modals/PageSetupModal';
import { InsertLinkModal } from './modals/InsertLinkModal';
import { SaveModal } from './modals/SaveModal';
import Link from '@tiptap/extension-link';
import { InsertImageModal } from './modals/InsertImageModal';
import { InsertTableModal } from './modals/InsertTableModal';
import { NewDocumentModal } from './modals/NewDocumentModal';
import { OpenDocumentModal } from './modals/OpenDocumentModal';
import { HeaderFooterModal } from './modals/HeaderFooterModal';
import { PageNumberModal } from './modals/PageNumberModal';
import { useEditorStore } from '../store/editorStore';
import { SearchAndReplace } from '../extensions/SearchAndReplace';
import { FontSize } from '../extensions/FontSize';
import { LineSpacing } from '../extensions/LineSpacing';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { ImageExtension } from '../extensions/ImageExtension';
import { ImageToolbar } from './editor/ImageToolbar';
import { PhotoViewer } from './PhotoViewer';
import { ImageCropModal } from './modals/ImageCropModal';
import { ReplaceImageModal } from './modals/ReplaceImageModal';
import { ImageResizeOverlay } from './editor/ImageResizeOverlay';
import { ImageDragOverlay } from './editor/ImageDragOverlay';

interface DocumentEditorProps {
  file: File | null;
  onClose: () => void;
  onSave?: (html: string) => void;
  createNew?: boolean;
}

// Document Editor Component
export const DocumentEditor = ({ file, onClose, onSave, createNew }: DocumentEditorProps) => {
  const [fileName, setFileName] = useState(file?.name || 'Untitled Document');
  const { ruler, setWordCount, toggleRuler, setPageState, setRulerState } = useEditorStore();
  const [activeModal, setActiveModal] = useState<'findReplace' | 'pageSetup' | 'insertLink' | 'save' | 'insertTable' | 'newDocument' | 'open' | 'insertImage' | 'headerFooter' | 'pageNumber' | null>(null);
  const [selectedLinkText, setSelectedLinkText] = useState('');
  
  // Image Editing State
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageNode, setSelectedImageNode] = useState<{ node: Node, pos: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false, // Exclude default Link extension
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExtension.configure({
        allowBase64: true,
        inline: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      SearchAndReplace,
      Link.extend({
        inclusive: false,
      }).configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Subscript,
      Superscript,
      FontSize,
      LineSpacing,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[1056px]',
      },
    },
    onUpdate: ({ editor }) => {
      setWordCount(editor.storage.characterCount.words());
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      // Use type assertion to avoid TS error if types are missing
      const node = (selection as unknown as { node: Node }).node;
      if (node && node.type.name === 'image') {
        setSelectedImageNode({ node: node, pos: selection.from });
      } else {
        setSelectedImageNode(null);
      }
    },
  });

  useEffect(() => {
    if (editor) {
      useEditorStore.getState().setActiveEditor(editor);

      const handleFocus = () => {
        useEditorStore.getState().setActiveEditor(editor);
      };

      editor.on('focus', handleFocus);

      return () => {
        editor.off('focus', handleFocus);
        useEditorStore.getState().setActiveEditor(null);
      };
    }
  }, [editor]);

  useEffect(() => {
    if (editor && file) {
      const loadFile = async () => {
        setFileName(file.name);
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') {
          // Handle PDF
        } else if (extension === 'docx' || extension === 'doc') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          editor?.commands.setContent(result.value);
          if (editor) {
            setWordCount(editor.storage.characterCount.words());
          }
        }
      };

      loadFile();
    } else if (editor && !file) {
      if (createNew) {
        editor?.commands.setContent('');
      } else {
        editor?.commands.setContent('');
      }
    }
  }, [file, createNew, editor, setWordCount]);

  const handleSaveDocument = async (name: string, type: 'pdf' | 'docx') => {
    const html = editor?.getHTML() || '';

    if (type === 'docx') {
      const textOnly = editor?.getText() || '';
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [new Paragraph({ children: [new TextRun(textOnly)] })],
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${name}.docx`);
    } else {
      // PDF Export using html2canvas and jspdf
      const element = document.querySelector('.ProseMirror');
      if (element) {
        const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${name}.pdf`);
      }
    }

    onSave?.(html);
  };

  const handleNewDocument = (saveFirst: boolean) => {
    if (saveFirst) {
      setActiveModal('save');
    } else {
      editor?.commands.setContent('');
      setFileName('Untitled Document');
      setActiveModal(null);
    }
  };

  const handleOpenFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'docx' || extension === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands.setContent(result.value);
      setFileName(file.name);
      setActiveModal(null);
    } else if (extension === 'pdf') {
      // PDF handling placeholder or implementation
      alert('PDF editing is experimental. Converting to text...');
      // Basic text extraction or just load name
      setFileName(file.name);
      setActiveModal(null);
    }
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'new':
        setActiveModal('newDocument');
        break;
      case 'open':
        setActiveModal('open');
        break;
      case 'save':
        setActiveModal('save');
        break;
      case 'undo':
        editor?.chain().focus().undo().run();
        break;
      case 'redo':
        editor?.chain().focus().redo().run();
        break;
      case 'findReplace':
        setActiveModal('findReplace');
        break;
      case 'pageSetup':
        setActiveModal('pageSetup');
        break;
      case 'headerFooter':
        setActiveModal('headerFooter');
        break;
      case 'pageNumber':
        setActiveModal('pageNumber');
        break;
      case 'insertLink':
        if (editor) {
          const { from, to } = editor.state.selection;
          const text = editor.state.doc.textBetween(from, to, ' ');
          setSelectedLinkText(text);
          setActiveModal('insertLink');
        }
        break;
      case 'insertImage':
        setActiveModal('insertImage');
        break;
      case 'insertTable':
        setActiveModal('insertTable');
        break;
      case 'toggleRuler':
        toggleRuler();
        break;
      case 'zoom': {
        const zoomLevels = [50, 75, 100, 125, 150, 200];
        const currentZoomIndex = zoomLevels.indexOf(useEditorStore.getState().zoom);
        const nextZoom = zoomLevels[(currentZoomIndex + 1) % zoomLevels.length];
        useEditorStore.getState().setZoom(nextZoom);
        break;
      }
      case 'fullscreen':
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
        break;
      case 'selectAll':
        editor?.commands.selectAll();
        break;
      default:
        console.log('Menu action:', action);
    }
  };

  const handleInsertLink = (url: string, text?: string) => {
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = 'https://' + url;
    }

    if (text) {
      if (editor?.state.selection.empty) {
        editor?.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
      } else {
        editor?.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
        if (selectedLinkText && text !== selectedLinkText) {
          editor?.chain().focus().insertContent(`<a href="${finalUrl}">${text}</a>`).run();
        } else {
          editor?.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
        }
      }
    } else {
      editor?.chain().focus().setLink({ href: finalUrl }).run();
    }
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const handleInsertImage = (url: string) => {
    editor?.chain().focus().setImage({ src: url }).run();
  };

  const handlePageSetupApply = (settings: { size: string, orientation: 'portrait' | 'landscape', margins: { top: number, bottom: number, left: number, right: number } }) => {
    const dpi = 96;
    let width = 816;
    let height = 1056;

    if (settings.size === 'a4') {
      width = 794; // 210mm
      height = 1123; // 297mm
    } else if (settings.size === 'legal') {
      width = 816;
      height = 1344;
    }

    if (settings.orientation === 'landscape') {
      const temp = width;
      width = height;
      height = temp;
    }

    setPageState({
      width,
      height,
      orientation: settings.orientation
    });

    setRulerState({
      topMargin: settings.margins.top * dpi,
      bottomMargin: settings.margins.bottom * dpi,
      leftMargin: settings.margins.left * dpi,
      rightMargin: settings.margins.right * dpi,
    });
  };

  const handleImageEdit = async () => {
    if (!selectedImageNode) return;
    const src = selectedImageNode.node.attrs.src;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], "image.png", { type: blob.type });
      setSelectedImageFile(file);
      setShowPhotoViewer(true);
    } catch (error) {
      console.error("Error loading image for editing:", error);
    }
  };

  const handlePhotoViewerSave = (file: File) => {
    if (!selectedImageNode || !editor) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
    };
    reader.readAsDataURL(file);
    setShowPhotoViewer(false);
    setSelectedImageFile(null);
  };

  const handleCrop = (croppedImageUrl: string) => {
      if (!selectedImageNode || !editor) return;
      editor.chain().setNodeSelection(selectedImageNode.pos).updateAttributes('image', { src: croppedImageUrl }).run();
      setShowCropModal(false);
  };

  const handleReplace = (url: string) => {
      if (!selectedImageNode || !editor) return;
      editor.chain().setNodeSelection(selectedImageNode.pos).updateAttributes('image', { src: url }).run();
      setShowReplaceModal(false);
  };

  const handlePosition = (position: string) => {
      if (!selectedImageNode || !editor) return;
      editor.chain().setNodeSelection(selectedImageNode.pos).updateAttributes('image', { position }).run();
  };

  if (!editor) {
    return (
      <div className="flex flex-col h-screen bg-[#F9FBFD] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F9FBFD] z-50 flex flex-col">
      <EditorHeader
        fileName={fileName}
        setFileName={setFileName}
        onClose={onClose}
        onSave={() => setActiveModal('save')}
        onMenuAction={handleMenuAction}
        editor={editor}
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 relative">
          <EditorToolbar />
          
          <div className="flex-1 flex overflow-y-auto custom-scrollbar relative bg-[#F9FBFD]">
            {ruler.showRuler && (
              <div className="flex-shrink-0 min-h-full">
                <VerticalRuler />
              </div>
            )}

            <div className="flex-1 flex flex-col relative">
              {ruler.showRuler && <EditorRuler />}
              <EditorCanvas editor={editor} />

              {selectedImageNode && editor && (
                <>
                    <div className="absolute" style={{ 
                      top: editor.view.coordsAtPos(selectedImageNode.pos).top - 60, 
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 50
                    }}>
                      <ImageToolbar 
                        onCrop={() => setShowCropModal(true)}
                        onResize={() => {}}
                        onEdit={handleImageEdit}
                        onPosition={handlePosition}
                        onReplace={() => setShowReplaceModal(true)}
                        currentPosition={selectedImageNode.node.attrs.position || 'inline'}
                      />
                    </div>
                    
                    {/* Resize overlay for all positions except behind/front */}
                    {selectedImageNode.node.attrs.position !== 'behind' && selectedImageNode.node.attrs.position !== 'front' && (
                      <ImageResizeOverlay 
                          editor={editor} 
                          selectedImageNode={selectedImageNode}
                          onResizeEnd={() => {}}
                      />
                    )}
                    
                    {/* Drag overlay for behind/front positioned images */}
                    {(selectedImageNode.node.attrs.position === 'behind' || selectedImageNode.node.attrs.position === 'front') && (
                      <ImageDragOverlay 
                          editor={editor} 
                          selectedImageNode={selectedImageNode}
                      />
                    )}
                </>
              )}
            </div>
          </div>
          
          <EditorFooter />
        </div>
      </div>

      {/* Modals */}
      {
        activeModal === 'findReplace' && (
          <FindReplaceModal
            editor={editor}
            onClose={() => {
              setActiveModal(null);
              editor?.commands.clearSearch();
            }}
          />
        )
      }
      {
        activeModal === 'pageSetup' && (
          <PageSetupModal
            onClose={() => setActiveModal(null)}
            onApply={handlePageSetupApply}
          />
        )
      }
      {
        activeModal === 'insertLink' && (
          <InsertLinkModal
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertLink}
            selectedText={selectedLinkText}
          />
        )
      }
      {
        activeModal === 'save' && (
          <SaveModal
            onClose={() => setActiveModal(null)}
            onSave={handleSaveDocument}
            currentFileName={fileName}
          />
        )
      }
      {
        activeModal === 'insertTable' && (
          <InsertTableModal
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertTable}
          />
        )
      }
      {
        activeModal === 'insertImage' && (
          <InsertImageModal
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertImage}
          />
        )
      }
      {
        activeModal === 'open' && (
          <OpenDocumentModal
            onClose={() => setActiveModal(null)}
            onFileSelect={handleOpenFile}
          />
        )
      }
      {
        activeModal === 'newDocument' && (
          <NewDocumentModal
            onClose={() => setActiveModal(null)}
            onConfirm={handleNewDocument}
          />
        )
      }
      {
        activeModal === 'headerFooter' && (
          <HeaderFooterModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
          />
        )
      }
      {
        activeModal === 'pageNumber' && (
          <PageNumberModal
            isOpen={true}
            onClose={() => setActiveModal(null)}
          />
        )
      }

      {showCropModal && selectedImageNode && (
          <ImageCropModal 
            imageUrl={selectedImageNode.node.attrs.src} 
            onClose={() => setShowCropModal(false)} 
            onCrop={handleCrop}
          />
      )}

      {showReplaceModal && (
          <ReplaceImageModal 
            onClose={() => setShowReplaceModal(false)}
            onReplace={handleReplace}
          />
      )}

      {showPhotoViewer && selectedImageFile && (
        <PhotoViewer file={selectedImageFile} onClose={() => setShowPhotoViewer(false)} onSave={handlePhotoViewerSave} />
      )}
    </div>
  );
};



