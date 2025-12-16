import { useState, useEffect } from 'react';

import mammoth from 'mammoth';
import html2canvas from 'html2canvas';

import {
  EditorHeader,
  EditorToolbar,
  EditorRuler,
  VerticalRuler,
  EditorCanvas,
  EditorFooter,
  ContextMenu,
  PhotoViewer,
  FloatingImageToolbar,
  TableToolbar,
  TextBoxToolbar,
  ShapeToolbar,
  LinterTooltip
} from '../lib/components';
import { useAdvancedEditor } from '../lib/hooks/useAdvancedEditor';
import { FindReplaceModal } from './modals/FindReplaceModal';
import { PageSetupModal } from './modals/PageSetupModal';
import { InsertLinkModal } from './modals/InsertLinkModal';
import { SaveModal } from './modals/SaveModal';

import { InsertImageModal } from './modals/InsertImageModal';
import { InsertTableModal } from './modals/InsertTableModal';
import { NewDocumentModal } from './modals/NewDocumentModal';
import { OpenDocumentModal } from './modals/OpenDocumentModal';
import { HeaderFooterModal } from './modals/HeaderFooterModal';
import { PageNumberModal } from './modals/PageNumberModal';
import { CloseDocumentModal } from './modals/CloseDocumentModal';
import { useEditorStore } from '../store/editorStore';

import { ImageCropModal } from './modals/ImageCropModal';
import { ReplaceImageModal } from './modals/ReplaceImageModal';
import { InsertShapeModal } from './modals/InsertShapeModal';
import { InsertChartModal } from './modals/InsertChartModal';
import { AdvancedFormulaModal } from './modals/AdvancedFormulaModal';
import { scanTable, evaluateAdvancedFormula, adjustFormulaReferences } from '../lib/utils/SmartTableEngine';

import { exportToDocx } from '../lib/utils/docxExport';
import { exportToPdf, generatePdfBlob } from '../lib/utils/pdfExport';

interface DocumentEditorProps {
  file: File | null;
  onClose: () => void;
  onSave?: (html: string) => void;
  createNew?: boolean;
}

// Document Editor Component
export const DocumentEditor = ({ file, onClose, onSave, createNew }: DocumentEditorProps) => {
  const [fileName, setFileName] = useState(file?.name || 'Untitled Document');
  const { ruler, setWordCount, toggleRuler, setPageState, setRulerState, page, setCurrentPage, pageMargins, headerFooter } = useEditorStore();
  const [activeModal, setActiveModal] = useState<'findReplace' | 'pageSetup' | 'insertLink' | 'save' | 'insertTable' | 'newDocument' | 'open' | 'insertImage' | 'headerFooter' | 'pageNumber' | 'insertTextBox' | 'insertShape' | 'closeDocument' | 'insertFormula' | 'insertChart' | null>(null);
  const [selectedLinkText, setSelectedLinkText] = useState('');
  const [pendingAction, setPendingAction] = useState<'close' | null>(null);

  // Image Editing State
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [isInsertingShapeImage, setIsInsertingShapeImage] = useState(false);

  // Use the advanced editor hook for core logic
  const {
    editor,
    selectedShapeNode,
    selectedTextBoxNode,
    selectedImageNode,
    isInTable,
    contextMenu,
    setContextMenu
  } = useAdvancedEditor({
    onUpdate: () => {
      // Custom onUpdate logic if needed
    }
  });

  // Sync active editor with store (handled in hook but ensuring focus sync)
  useEffect(() => {
    if (editor) {
      const handleFocus = () => {
        useEditorStore.getState().setActiveEditor(editor);
      };
      editor.on('focus', handleFocus);
      return () => {
        editor.off('focus', handleFocus);
      };
    }
  }, [editor]);
  // File Loading Logic
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

  // Trigger pagination update when ruler or page settings change
  useEffect(() => {
    if (editor) {
      // Use a timeout to debounce rapid changes from dragging
      const timeoutId = setTimeout(() => {
        editor.view.dispatch(editor.view.state.tr.setMeta('layoutChange', true));
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [editor, ruler, page, pageMargins]);

  const handleSaveDocument = async (name: string, type: 'pdf' | 'docx') => {
    const html = editor?.getHTML() || '';

    if (type === 'docx') {
      if (editor) {
        // Capture charts
        const chartImages: string[] = [];
        const chartElements = document.querySelectorAll('.chart-node-view');

        // We need to capture them in document order. querySelectorAll returns them in document order.
        // However, we must ensure they are fully rendered.

        for (let i = 0; i < chartElements.length; i++) {
          const el = chartElements[i] as HTMLElement;
          try {
            const canvas = await html2canvas(el, {
              scale: 2, // Higher quality
              useCORS: true,
              backgroundColor: '#ffffff'
            });
            chartImages.push(canvas.toDataURL('image/png'));
          } catch (e) {
            console.error("Failed to capture chart", e);
            chartImages.push(""); // Push empty to keep alignment with node traversal
          }
        }

        await exportToDocx(editor, name, chartImages, headerFooter);
      }
    } else {
      // PDF Export logic
      const currentZoom = useEditorStore.getState().zoom;
      useEditorStore.getState().setZoom(100);

      await new Promise(resolve => setTimeout(resolve, 100));

      const element = document.getElementById('editor-scroll-container');
      if (element && element.firstElementChild) {
        await exportToPdf(element.firstElementChild as HTMLElement, name);
      } else if (element) {
        await exportToPdf(element, name);
      }

      useEditorStore.getState().setZoom(currentZoom);
    }

    onSave?.(html);

    if (pendingAction === 'close') {
      onClose();
    }
  };

  const handleCloseRequest = () => {
    setActiveModal('closeDocument');
  };

  const handleCloseConfirm = (saveFirst: boolean) => {
    if (saveFirst) {
      setPendingAction('close');
      setActiveModal('save');
    } else {
      setPendingAction(null);
      setActiveModal(null);
      onClose();
    }
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
      case 'printPreview': {
        // Reset zoom to 100% for accurate print preview
        const currentZoom = useEditorStore.getState().zoom;
        useEditorStore.getState().setZoom(100);

        // Give browser time to re-render at 100% zoom
        setTimeout(async () => {
          try {
            // Get only the actual editor content
            const editorContent = document.querySelector('.ProseMirror');
            if (editorContent) {
              // Create a clean wrapper for PDF generation (no UI elements)
              const cleanWrapper = document.createElement('div');
              cleanWrapper.style.width = '794px';
              cleanWrapper.style.background = 'white';
              cleanWrapper.style.padding = '20px';

              // Clone only the content (not UI elements)
              const contentClone = editorContent.cloneNode(true) as HTMLElement;
              cleanWrapper.appendChild(contentClone);

              // Temporarily add to DOM (needed for html2canvas)
              cleanWrapper.style.position = 'absolute';
              cleanWrapper.style.left = '-9999px';
              document.body.appendChild(cleanWrapper);

              // Generate PDF from clean wrapper
              const pdfBlobUrl = await generatePdfBlob(cleanWrapper);

              // Remove temporary element
              document.body.removeChild(cleanWrapper);

              const printWindow = window.open(pdfBlobUrl, '_blank');
              if (printWindow) {
                printWindow.onload = () => { printWindow.print(); };
                setTimeout(() => { URL.revokeObjectURL(pdfBlobUrl); }, 2000);
              } else {
                URL.revokeObjectURL(pdfBlobUrl);
                alert('Please allow popups for print preview.');
              }
            }
          } catch (error) {
            console.error('Print preview failed:', error);
            alert('Failed to generate print preview. Please try again.');
          } finally {
            useEditorStore.getState().setZoom(currentZoom);
          }
        }, 100);
        break;
      }
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
      case 'insertTextBox':
        editor?.chain().focus().insertTextBox().run();
        break;
      case 'insertShape':
        setActiveModal('insertShape');
        break;
      case 'insertFormula':
        setActiveModal('insertFormula');
        break;
      case 'insertChart':
        setActiveModal('insertChart');
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

  // State for Advanced Formula Modal
  const [tableDataForModal, setTableDataForModal] = useState<string[][]>([]);
  const [currentCellForModal, setCurrentCellForModal] = useState<{ row: number, col: number }>({ row: 0, col: 0 });


  const prepareTableForFormula = () => {
    if (!editor) return;
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    let tableNode: any = null;
    let tableDepth = -1;

    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name === 'table') {
        tableNode = node;
        tableDepth = d;
        break;
      }
    }

    if (!tableNode) {
      alert('Please place cursor inside a table cell');
      return;
    }

    // Get current position
    const rowIndex = $from.index(tableDepth + 1);
    const colIndex = $from.index(tableDepth + 2);

    // Extract data
    const data: string[][] = [];
    tableNode.content.forEach((row: any) => {
      if (row.type.name === 'tableRow') {
        const rowData: string[] = [];
        row.content.forEach((cell: any) => {
          rowData.push(cell.textContent);
        });
        data.push(rowData);
      }
    });

    setTableDataForModal(data);
    setCurrentCellForModal({ row: rowIndex, col: colIndex });
    setActiveModal('insertFormula');
  };

  const handleInsertFormula = (_result: string | number, formula?: string) => {
    if (!editor || !formula) return;
    const { state, view } = editor;
    const { selection } = state;
    const { $from } = selection;

    // Find the table node and depth
    let tableNode: any = null;
    let tableDepth = -1;

    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name === 'table') {
        tableNode = node;
        tableDepth = d;
        break;
      }
    }

    if (!tableNode || tableDepth === -1) return;

    // Scan table data for evaluation
    const data: string[][] = [];
    tableNode.content.forEach((row: any) => {
      const rowData: string[] = [];
      row.content.forEach((cell: any) => rowData.push(cell.textContent));
      data.push(rowData);
    });
    const grid = scanTable(data);

    let tr = state.tr;

    // Map cell positions
    // calculate tableStart based on the depth found
    const tableStart = $from.start(tableDepth);
    let currentPos = tableStart;

    let cellPosMap: Record<number, { r: number, c: number }> = {};

    tableNode.content.forEach((row: any, r: number) => {
      currentPos += 1; // Start of row
      row.content.forEach((cell: any, c: number) => {
        cellPosMap[currentPos] = { r, c };
        currentPos += cell.nodeSize;
      });
      currentPos += 1; // End of row
    });

    // Capture Source Info
    let sourceRow = -1;
    let sourceCol = -1;
    let isFirst = true;

    // We must collect updates first because applying them might shift positions if content length changes?
    // Actually, setNodeAttribute doesn't change length. replaceWith DOES.
    // If we replace A1 content, A2 position shifts.
    // So we should collect updates and apply in reverse order OR use mapping.
    // Reverse order is safest and easiest.

    const updates: { pos: number, size: number, formula: string, result: string }[] = [];

    state.doc.nodesBetween(selection.from, selection.to, (node, nodePos) => {
      if (node.type.name === 'tableCell') {
        const coords = cellPosMap[nodePos];
        if (coords) {
          let targetFormula = formula;

          if (isFirst) {
            sourceRow = coords.r;
            sourceCol = coords.c;
            isFirst = false;
          } else if (sourceRow > -1) {
            const rowOff = coords.r - sourceRow;
            const colOff = coords.c - sourceCol;
            targetFormula = adjustFormulaReferences(formula, rowOff, colOff);
          }

          const res = evaluateAdvancedFormula(targetFormula, { row: coords.r, col: coords.c }, grid);

          updates.push({
            pos: nodePos,
            size: node.nodeSize,
            formula: targetFormula,
            result: String(res.result)
          });
        }
      }
    });

    // Apply updates in reverse order so position shifts don't affect previous nodes
    updates.reverse().forEach(update => {
      tr = tr.setNodeAttribute(update.pos, 'data-formula', update.formula);
      const contentStart = update.pos + 1;
      const contentEnd = update.pos + update.size - 1;
      tr = tr.replaceWith(contentStart, contentEnd, state.schema.text(update.result));
    });

    view.dispatch(tr);
    setActiveModal(null);
  };



  const handleInsertImage = (url: string) => {
    if (isInsertingShapeImage && selectedShapeNode) {
      handleUpdateShape({ imageUrl: url });
      setIsInsertingShapeImage(false);
    } else {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleInsertChart = (config: any) => {
    editor?.chain().focus().insertChart(config).run();
  };



  const handleUpdateTextBox = (attrs: Record<string, any>) => {
    if (!selectedTextBoxNode || !editor) return;
    editor.chain().setNodeSelection(selectedTextBoxNode.pos).updateAttributes('textBox', attrs).run();
  };

  const handleInsertShape = (type: 'line' | 'rectangle' | 'circle') => {
    editor?.chain().focus().insertShape({ type }).run();
  };

  const handleUpdateShape = (attrs: Record<string, any>) => {
    if (!editor) return;

    // Ensure we have a valid selection context
    if (selectedShapeNode) {
      editor.chain()
        .focus()
        .setNodeSelection(selectedShapeNode.pos)
        .updateAttributes('shape', attrs)
        .run();
    } else {
      // Fallback to active selection if state is somehow desynced
      editor.chain().focus().updateAttributes('shape', attrs).run();
    }
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
    editor.chain().setNodeSelection(selectedImageNode.pos).updateAttributes('image', {
      position,
      x: 0,
      y: 0
    }).run();
  };

  useEffect(() => {
    const handleImageDoubleClick = () => {
      // Ensure we have an editor
      if (editor) {
        setShowImageToolbar(true);
      }
    };
    window.addEventListener('image-double-click', handleImageDoubleClick);
    return () => window.removeEventListener('image-double-click', handleImageDoubleClick);
  }, [editor]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const GAP_SIZE = 20;
    const pageTotalHeight = page.height + GAP_SIZE;
    const pageIndex = Math.floor((scrollTop + page.height * 0.3) / pageTotalHeight) + 1;
    setCurrentPage(pageIndex);
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
    <div className="document-editor-root fixed inset-0 bg-[#F9FBFD] z-50 flex flex-col">
      <div className="sticky top-0 z-50 flex flex-col bg-[#F9FBFD]">
        <EditorHeader
          fileName={fileName}
          setFileName={setFileName}
          onClose={onClose}
          onCloseRequest={handleCloseRequest}
          onSave={() => setActiveModal('save')}
          onMenuAction={handleMenuAction}
          editor={editor}
        />
        <EditorToolbar />
        {ruler.showRuler && <EditorRuler />}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            actions={contextMenu.actions}
            onClose={() => setContextMenu(null)}
          />
        )}
      </div>

      <div className="flex-1 flex overflow-y-auto overflow-x-hidden relative bg-[#F9FBFD] no-scrollbar z-0" onScroll={handleScroll}>
        {ruler.showRuler && (
          <div className="flex-shrink-0">
            <VerticalRuler />
          </div>
        )}

        <div className="flex-1 flex flex-col relative">
          <EditorCanvas editor={editor} />

          {selectedImageNode && editor && (
            <>
              <div className="absolute" style={{
                top: editor.view.coordsAtPos(selectedImageNode.pos).top - 60,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50
              }}>
                {/* This div is replaced by FloatingImageToolbar logic but we keep the structure if needed or just replace content.*/}
                {/* Actually we should replace the whole div block with FloatingImageToolbar as it handles its own positioning */}
              </div>
              {selectedImageNode && showImageToolbar && (
                <FloatingImageToolbar
                  editor={editor}
                  selectedImageNode={selectedImageNode}
                  onCrop={() => setShowCropModal(true)}

                  onEdit={handleImageEdit}
                  onPosition={handlePosition}
                  onReplace={() => setShowReplaceModal(true)}
                />
              )}

              {/* Resize overlay and drag overlay handled by ImageNodeView now */}
            </>
          )}
        </div>
      </div>

      <EditorFooter />

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
        activeModal === 'insertFormula' && (
          <AdvancedFormulaModal
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertFormula}
            tableData={tableDataForModal}
            currentPosition={currentCellForModal}
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
        activeModal === 'insertShape' && (
          <InsertShapeModal
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertShape}
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

      {
        activeModal === 'insertChart' && (
          <InsertChartModal
            editor={editor}
            onClose={() => setActiveModal(null)}
            onInsert={handleInsertChart}
          />
        )
      }


      {
        activeModal === 'closeDocument' && (
          <CloseDocumentModal
            onClose={() => setActiveModal(null)}
            onConfirm={handleCloseConfirm}
          />
        )
      }


      {
        showCropModal && selectedImageNode && (
          <ImageCropModal
            imageUrl={selectedImageNode.node.attrs.src}
            onClose={() => setShowCropModal(false)}
            onCrop={handleCrop}
          />
        )
      }

      {
        showReplaceModal && (
          <ReplaceImageModal
            onClose={() => setShowReplaceModal(false)}
            onReplace={handleReplace}
          />
        )
      }

      {
        showPhotoViewer && selectedImageFile && (
          <PhotoViewer file={selectedImageFile} onClose={() => setShowPhotoViewer(false)} onSave={handlePhotoViewerSave} />
        )
      }

      {
        selectedTextBoxNode && (
          <TextBoxToolbar
            editor={editor}
            onUpdateTextBox={handleUpdateTextBox}
            textBoxAttrs={selectedTextBoxNode.node.attrs}
          />
        )
      }

      {
        selectedShapeNode && (
          <ShapeToolbar
            onUpdateShape={handleUpdateShape}
            shapeAttrs={selectedShapeNode.node.attrs}
            onInsertImage={() => {
              setIsInsertingShapeImage(true);
              setActiveModal('insertImage');
            }}
          />
        )
      }

      {
        isInTable && editor && (
          <TableToolbar
            editor={editor}
            onInsertFormula={() => prepareTableForFormula()}
          />
        )
      }

      {editor && <LinterTooltip editor={editor} />}
    </div >
  );
};
