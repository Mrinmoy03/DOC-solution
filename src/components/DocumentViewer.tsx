import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import gsap from 'gsap';
import { DocumentEditor } from './DocumentEditor';
import { TextToSpeech } from './TextToSpeech';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  file: File | null;
  onClose: () => void;
}

export const DocumentViewer = ({ file, onClose }: DocumentViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [docContent, setDocContent] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'pptx' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const { listening, command, startListening, stopListening } = useVoiceCommands();
  const [showTTS, setShowTTS] = useState(false);
  const [fullText, setFullText] = useState('');
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);

  useEffect(() => {
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') {
      setFileType('pdf');
      setLoading(true);
      setError(null);
    } else if (extension === 'docx' || extension === 'doc') {
      setFileType('docx');
      loadWordDocument(file);
    } else if (extension === 'pptx' || extension === 'ppt') {
      setFileType('pptx');
      loadPPT(file);
    }
  }, [file]);

  useEffect(() => {
    if (command === 'next-page') {
      handleNextPage();
    } else if (command === 'previous-page') {
      handlePrevPage();
    } else if (command === 'zoom-in') {
      setScale((s) => Math.min(s + 0.2, 3));
    } else if (command === 'zoom-out') {
      setScale((s) => Math.max(s - 0.2, 0.5));
    } else if (command === 'scroll-up') {
      viewerRef.current?.scrollBy({ top: -100, behavior: 'smooth' });
    } else if (command === 'scroll-down') {
      viewerRef.current?.scrollBy({ top: 100, behavior: 'smooth' });
    }
  }, [command]);

  const loadWordDocument = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocContent(result.value);
      setLoading(false);
    } catch (err) {
      setError('Failed to load Word document');
      setLoading(false);
    }
  };

  const loadPPT = async (file: File) => {
    setDocContent('<div class="text-center p-8"><p class="text-xl font-semibold">PPT/PPTX viewing is available. File loaded: ' + file.name + '</p></div>');
    setLoading(false);
  };

  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
    setLoading(false);
    setError(null);
    gsap.fromTo(viewerRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.5 }
    );
  };

  const handleTTSClick = async () => {
    if (showTTS) {
      setShowTTS(false);
      return;
    }

    setIsExtractingText(true);
    try {
      if (fileType === 'pdf' && pdfDocument) {
        let text = '';
        // Limit to first 50 pages to avoid freezing for large docs, or just do it all?
        // Let's do all but maybe in chunks? For now, simple loop.
        for (let i = 1; i <= pdfDocument.numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          text += pageText + '\n\n';
        }
        setFullText(text);
      } else if (fileType === 'docx' || fileType === 'pptx') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = docContent;
        setFullText(tempDiv.innerText || tempDiv.textContent || '');
      }
      setShowTTS(true);
    } catch (error) {
      console.error('Failed to extract text:', error);
    } finally {
      setIsExtractingText(false);
    }
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF document. Please try another file.');
    setLoading(false);
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col border border-slate-200/50 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{file.name}</h2>
              {fileType === 'pdf' && <p className="text-xs text-slate-500 font-medium">PDF Document • {numPages} pages</p>}
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={handleTTSClick}
              disabled={isExtractingText}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${showTTS
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400 shadow-purple-500/50'
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              title="Read Aloud"
            >
              {isExtractingText ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                if (listening) stopListening();
                else startListening();
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border ${listening
                ? 'bg-gradient-to-r from-red-500 to-rose-500  border-red-400 animate-pulse shadow-red-500/50'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500  border-emerald-400 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/50'
                }`}
            >
              <span className="flex items-center gap-2">
                {listening ? (
                  <>
                    <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Listening...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Voice
                  </>
                )}
              </span>
            </button>
            <div className="flex gap-2 items-center bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-slate-200 shadow-sm">
              <button
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-bold text-slate-700"
              >
                −
              </button>
              <span className="px-4 py-1 text-sm font-bold text-slate-700 min-w-[70px] text-center bg-slate-50 rounded-lg">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-bold text-slate-700"
              >
                +
              </button>
            </div>
            {fileType === 'pdf' && (
              <div className="flex gap-2 items-center bg-white/80 backdrop-blur-sm rounded-xl px-2 py-2 border border-slate-200 shadow-sm">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-700 text-sm disabled:hover:from-slate-100 disabled:hover:to-slate-200"
                >
                  ←
                </button>
                <span className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-50 rounded-lg min-w-[100px] text-center">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-700 text-sm disabled:hover:from-slate-100 disabled:hover:to-slate-200"
                >
                  →
                </button>
              </div>
            )}
            {(fileType === 'docx' || fileType === 'pdf') && (
              <button
                onClick={() => setShowEditor(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl hover:from-blue-300 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/50 font-semibold border border-blue-400 text-dark"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500  rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/50 font-semibold border border-red-400"
            >
              Close
            </button>
          </div>
        </div>
        <div ref={viewerRef} className="flex-1 overflow-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading document...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-semibold text-lg">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && fileType === 'pdf' && (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-2xl p-4">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            </div>
          )}
          {!loading && !error && fileType === 'docx' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-slate-200">
              <div
                className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-700"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                dangerouslySetInnerHTML={{ __html: docContent }}
              />
            </div>
          )}
          {showEditor && (
            <DocumentEditor
              file={file}
              onClose={() => setShowEditor(false)}
              onSave={(html) => setDocContent(html)}
            />
          )}
          {!loading && !error && fileType === 'pptx' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-slate-200">
              <div
                className="p-8 text-slate-700"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                dangerouslySetInnerHTML={{ __html: docContent }}
              />
            </div>
          )}
        </div>
      </div>
      {showTTS && (
        <TextToSpeech
          text={fullText}
          onClose={() => setShowTTS(false)}
        />
      )}
    </div>

  );
};
