import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DocumentViewer } from './DocumentViewer';
import { DocumentEditor } from './DocumentEditor';
import { PhotoViewer } from '../lib/components';
import gsap from 'gsap';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewerMode, setViewerMode] = useState<'view' | 'edit' | 'photo' | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Conversion State
  const [convertStep, setConvertStep] = useState<'select' | 'name'>('select');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [targetFileName, setTargetFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      gsap.fromTo(dashboardRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 }
      );
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only set the selected file on upload. Do not automatically open
    // the viewer — this keeps the dashboard tiles and selected-file UI
    // visible so the user can choose View/Edit manually.
    setSelectedFile(file);
    setViewerMode(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isImage = (file: File) => {
    return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  };

  const handleView = () => {
    if (selectedFile) {
      setViewerMode(isImage(selectedFile) ? 'photo' : 'view');
    }
  };

  const handleEdit = () => {
    if (selectedFile) {
      setViewerMode(isImage(selectedFile) ? 'photo' : 'edit');
    }
  };

  const handleFormatSelect = (format: string) => {
    if (!selectedFile) return;
    setSelectedFormat(format);
    // Default to original name without extension
    const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
    setTargetFileName(nameWithoutExt);
    setConvertStep('name');
  };

  const handleDownload = () => {
    if (!selectedFile || !selectedFormat || !targetFileName) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const url = URL.createObjectURL(selectedFile);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const mimeType = selectedFormat === 'jpg' ? 'image/jpeg' : `image/${selectedFormat}`;
      const newUrl = canvas.toDataURL(mimeType, 0.9);

      const link = document.createElement('a');
      const extension = selectedFormat === 'jpeg' ? 'jpg' : selectedFormat;
      link.download = `${targetFileName}.${extension}`;
      link.href = newUrl;
      link.click();

      URL.revokeObjectURL(url);

      // Reset and close
      setShowConvertModal(false);
      setConvertStep('select');
      setSelectedFormat('');
      setTargetFileName('');
    };
    img.src = url;
  };

  const closeViewer = () => {
    setViewerMode(null);
    setSelectedFile(null);
  };

  return (
    <div ref={dashboardRef} className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsMTYzLDE4NCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      <nav className="relative bg-white/90 backdrop-blur-2xl shadow-xl border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Document Hub
                </h1>
                <p className="text-xs text-slate-500 font-medium">Professional Document Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Welcome back</p>
                <p className="text-xs text-slate-500 font-medium text-center">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-linear-to-r from-red-500 to-rose-500  rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 font-semibold border border-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-slate-800 mb-3">Your Workspace</h2>
          <p className="text-slate-600 text-lg font-medium">Manage, view, edit and convert your documents seamlessly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div
            className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-100 overflow-hidden"
            onClick={openFileDialog}
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                Upload Document
              </h3>
              <p className="text-slate-600 text-sm font-medium">PDF, Word, PPT, Images</p>
            </div>
          </div>

          <div
            className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-100 overflow-hidden"
            onClick={() => { setSelectedFile(null); setViewerMode('edit'); }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/0 via-sky-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:via-sky-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="w-16 h-16  bg-linear-to-br from-blue-500 via-blue-700 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                Create Document
              </h3>
              <p className="text-slate-600 text-sm font-medium">Start a blank Word document</p>
            </div>
          </div>

          {selectedFile && (
            <>
              {!isImage(selectedFile) && (
                <div
                  className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-100 overflow-hidden"
                  onClick={handleView}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/0 via-teal-500/0 to-teal-600/0 group-hover:from-emerald-500/10 group-hover:via-teal-500/10 group-hover:to-teal-600/10 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-linear-to-br from-emerald-500 via-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                      View Document
                    </h3>
                    <p className="text-slate-600 text-sm font-medium">Open viewer</p>
                  </div>
                </div>
              )}

              <div
                className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-100 overflow-hidden"
                onClick={handleEdit}
              >
                <div className="absolute inset-0 bg-linear-to-br from-amber-400/0 via-yellow-300/0 to-yellow-400/0 group-hover:from-amber-400/10 group-hover:via-yellow-300/10 group-hover:to-yellow-400/10 transition-all duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-linear-to-br from-amber-400 via-yellow-300 to-yellow-400 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                    {isImage(selectedFile) ? 'Edit Photo' : 'Edit Document'}
                  </h3>
                  <p className="text-slate-600 text-sm font-medium"> {isImage(selectedFile) ? 'Personalize Your Photo' : 'Personalize Your Document '}</p>
                </div>
              </div>

              {isImage(selectedFile) && (
                <div
                  className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-100 overflow-hidden"
                  onClick={() => {
                    setConvertStep('select');
                    setShowConvertModal(true);
                  }}
                >
                  <div className="absolute inset-0 bg-linear-to-br from-rose-500/0 via-orange-500/0 to-red-500/0 group-hover:from-rose-500/10 group-hover:via-orange-500/10 group-hover:to-red-500/10 transition-all duration-300"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-linear-to-br from-rose-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-rose-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-rose-600 transition-colors">
                      Convert Image
                    </h3>
                    <p className="text-slate-600 text-sm font-medium">Convert to PNG, JPG, WEBP</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedFile && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border-2 border-slate-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Selected File</h3>
                  <p className="text-slate-700 font-semibold">{selectedFile.name}</p>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setViewerMode(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-semibold border border-slate-200 whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 border-2 border-slate-100">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📖', text: 'Read PDF, Word, PPT documents', color: 'from-blue-500 to-cyan-500' },
              { icon: '🎤', text: 'Voice commands (next page, zoom, scroll)', color: 'from-emerald-500 to-teal-500' },
              { icon: '✏️', text: 'Edit PDF and Word files', color: 'from-amber-500 to-orange-500' },

              { icon: '🖼️', text: 'View and edit photos', color: 'from-pink-500 to-rose-500' },
              { icon: '📐', text: 'Resize images', color: 'from-indigo-500 to-purple-500' },
            ].map((feature, idx) => (
              <div key={idx} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-linear-to-br hover:from-slate-50 hover:to-blue-50 transition-all duration-300 border-2 border-transparent hover:border-slate-200 cursor-default">
                <div className={`w-12 h-12 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <span className="text-slate-700 font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFileSelect}
      />

      {
        viewerMode === 'view' && (
          <DocumentViewer file={selectedFile} onClose={closeViewer} />
        )
      }
      {
        viewerMode === 'edit' && (
          <DocumentEditor file={selectedFile} createNew={!selectedFile} onClose={closeViewer} />
        )
      }

      {
        viewerMode === 'photo' && (
          <PhotoViewer file={selectedFile} onClose={closeViewer} />

        )
      }

      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              {convertStep === 'select' ? 'Convert Image' : 'Save As'}
            </h3>

            {convertStep === 'select' ? (
              <div className="grid grid-cols-1 gap-4">
                {['png', 'jpeg', 'webp'].map((format) => (
                  <button
                    key={format}
                    onClick={() => handleFormatSelect(format)}
                    className="w-full py-4 px-6 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 rounded-xl flex items-center justify-between group transition-all duration-200"
                  >
                    <span className="text-lg font-bold text-slate-700 uppercase">{format}</span>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">File Name</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={targetFileName}
                      onChange={(e) => setTargetFileName(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-l-xl focus:outline-none focus:border-rose-500 transition-colors"
                      placeholder="Enter file name"
                      autoFocus
                    />
                    <div className="px-4 py-3 bg-slate-100 border-2 border-l-0 border-slate-200 rounded-r-xl text-slate-500 font-semibold">
                      .{selectedFormat === 'jpeg' ? 'jpg' : selectedFormat}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-linear-to-r from-rose-500 to-orange-500 text-dark font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  Convert
                </button>

                <button
                  onClick={() => setConvertStep('select')}
                  className="w-full py-2 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                >
                  Back
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowConvertModal(false);
                setConvertStep('select');
              }}
              className="mt-6 w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors border-t border-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div >
  );
};
