'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, Moon, Sun, Bookmark, Search,
  ChevronLeft, ChevronRight, Maximize2, Sidebar,
  Upload, FileText, Check, Play, BookmarkCheck
} from 'lucide-react';

interface BookmarkItem {
  page: number;
  label: string;
}

export default function PDFReader() {
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  
  // Real PDF document instances
  const [pdfjsLibInstance, setPdfjsLibInstance] = useState<any>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageTexts, setPageTexts] = useState<string[]>([]);
  
  // Search & Bookmark states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bookmarkTitle, setBookmarkTitle] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Dynamic Browser CDN script loader for PDF.js to prevent webpack SSR crashes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadPdfjs = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          setPdfjsLibInstance(lib);
          return true;
        }
        return false;
      };

      if (loadPdfjs()) {
        return;
      }

      const existingScript = document.getElementById('pdfjs-script') as HTMLScriptElement;
      if (existingScript) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (loadPdfjs()) {
            clearInterval(interval);
          } else if (attempts > 50) {
            clearInterval(interval);
            existingScript.remove();
            createScript();
          }
        }, 100);

        existingScript.addEventListener('load', () => {
          clearInterval(interval);
          loadPdfjs();
        });
        return;
      }

      const createScript = () => {
        const script = document.createElement('script');
        script.id = 'pdfjs-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = () => {
          loadPdfjs();
        };
        document.head.appendChild(script);
      };

      createScript();
    }
  }, []);

  // Carry over file buffer opened in PDF Editor if any
  useEffect(() => {
    if (pdfjsLibInstance && typeof window !== 'undefined' && (window as any).sharedPdfBuffer) {
      setFileName((window as any).sharedPdfName || 'Document.pdf');
      setFileLoaded(true);
      loadPdfFromBuffer((window as any).sharedPdfBuffer);
    }
  }, [pdfjsLibInstance]);

  // Render PDF page when page, zoom, or rotation changes
  useEffect(() => {
    if (pdfDocument) {
      renderPage(currentPage);
    }
  }, [currentPage, zoom, rotation, pdfDocument, isNightMode]);

  const loadPdfFromBuffer = async (buffer: ArrayBuffer) => {
    if (!pdfjsLibInstance) return;
    try {
      const loadingTask = pdfjsLibInstance.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);

      // Extract text content for searches
      const texts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        texts.push(pageText);
      }
      setPageTexts(texts);
    } catch (error) {
      console.error('Failed to load PDF from shared buffer:', error);
    }
  };

  const renderPage = async (pageNum: number) => {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Cancel ongoing render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const scale = zoom / 100;
      const viewport = page.getViewport({ scale, rotation });
      
      // Super-Sampling: Render at 2x devicePixelRatio for ultra-sharp vectors
      const outputScale = (window.devicePixelRatio || 1) * 2;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : null;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;

      // Apply Night Mode filter overlay
      if (isNightMode) {
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];       // Red
          data[i+1] = 255 - data[i+1];   // Green
          data[i+2] = 255 - data[i+2];   // Blue
        }
        context.putImageData(imgData, 0, 0);
      }
    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error('Error rendering PDF page:', err);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!pdfjsLibInstance) {
      alert('PDF.js renderer is still loading. Please try again in 2 seconds.');
      return;
    }

    setFileName(file.name);
    setFileLoaded(true);
    setPdfDocument(null);
    setPageTexts([]);
    setSearchMatches([]);
    setBookmarks([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Save to global state so it carries over to the Editor
      if (typeof window !== 'undefined') {
        (window as any).sharedPdfBuffer = arrayBuffer;
        (window as any).sharedPdfName = file.name;
        (window as any).sharedFiles = [file];
      }

      await loadPdfFromBuffer(arrayBuffer);
    } catch (error) {
      console.error('Failed to load PDF file:', error);
      alert('Failed to parse PDF file. Ensure it is a valid PDF document.');
      setFileLoaded(false);
    }
  };

  const loadMockDocument = () => {
    if (!pdfjsLibInstance) {
      alert('Renderer is loading...');
      return;
    }
    setFileName('Sample_Lease_Contract.pdf');
    setFileLoaded(true);
    setTotalPages(3);
    setCurrentPage(1);

    const mockTexts = [
      "PDFMASTER PRO SERVICE CONTRACT. This contract governs terms of use for software subscription systems and digital signatures.",
      "BILLING POLICIES. Under our subscription tiers, the Free plan supports up to 10 document saves per day, whereas Pro plans allow unlimited editing.",
      "LIABILITY EXCLUSIONS. PDFMaster Pro retains all rights to client-side WebAssembly OCR engines and local heuristic AI summarizers."
    ];
    setPageTexts(mockTexts);

    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        canvas.width = 500;
        canvas.height = 650;
        ctx.fillStyle = isNightMode ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = isNightMode ? '#ffffff' : '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(mockTexts[currentPage - 1], 40, 80);
      }
    }, 100);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(250, prev + 20));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 20));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handleFullscreen = () => {
    const elem = document.getElementById('pdf-viewport-pane');
    if (!elem) return;

    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      return;
    }

    const matches: number[] = [];
    pageTexts.forEach((text, index) => {
      if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
        matches.push(index + 1);
      }
    });

    setSearchMatches(matches);
    setCurrentMatchIdx(0);
    if (matches.length > 0) {
      setCurrentPage(matches[0]);
    }
  };

  const nextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(nextIdx);
    setCurrentPage(searchMatches[nextIdx]);
  };

  const prevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(prevIdx);
    setCurrentPage(searchMatches[prevIdx]);
  };

  const addBookmark = () => {
    const label = bookmarkTitle.trim() || `Page ${currentPage} Bookmark`;
    if (bookmarks.some(b => b.page === currentPage)) return;
    setBookmarks([...bookmarks, { page: currentPage, label }]);
    setBookmarkTitle('');
  };

  const removeBookmark = (page: number) => {
    setBookmarks(bookmarks.filter(b => b.page !== page));
  };

  return (
    <div className="space-y-6 animate-slide-up h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-xl text-red-500">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold truncate max-w-xs md:max-w-md">
                {fileLoaded ? fileName : 'No Document Opened'}
              </h1>
              {fileLoaded && (
                <div className="relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <button className="px-2 py-0.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded text-[9px] font-bold text-slate-500 hover:text-primary transition-all">
                    Change File
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {fileLoaded ? `Page ${currentPage} of ${totalPages}` : 'Upload a PDF file to begin rendering'}
            </p>
          </div>
        </div>

        {fileLoaded && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <button 
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800 ${showThumbnails ? 'bg-primary/10 border-primary/20 text-primary' : 'border-slate-200 dark:border-slate-800'}`}
              title="Toggle Sidebar"
            >
              <Sidebar className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button onClick={handleZoomOut} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50" title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono px-1">{zoom}%</span>
            <button onClick={handleZoomIn} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50" title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button onClick={handleRotate} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50" title="Rotate Page">
              <RotateCw className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setIsNightMode(!isNightMode)} 
              className={`p-2 rounded-lg border hover:bg-slate-50 ${isNightMode ? 'bg-primary/10 border-primary/20 text-primary' : 'border-slate-200 dark:border-slate-800'}`}
              title="Toggle Night Mode"
            >
              {isNightMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            <button onClick={handleFullscreen} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50" title="Toggle Fullscreen">
              <Maximize2 className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setIsPresentationMode(!isPresentationMode)} 
              className={`p-2 rounded-lg border hover:bg-slate-50 ${isPresentationMode ? 'bg-accent/10 border-accent/20 text-accent' : 'border-slate-200 dark:border-slate-800'}`}
              title="Presentation Mode"
            >
              <Play className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main workspace */}
      {!fileLoaded ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 bg-white dark:bg-secondary/20">
          <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-3xl text-red-500 mb-6">
            <FileText className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold font-display">Open PDF Document</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm text-center mb-8">
            Select any local PDF file from your device to render, view thumbnails, search text, or apply night mode filter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload PDF File
              </button>
            </div>
            <button 
              onClick={loadMockDocument}
              className="px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary rounded-xl text-xs font-bold transition-all"
            >
              Load Sample Document
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Thumbnails & Search panel */}
          {showThumbnails && !isPresentationMode && (
            <div className="w-64 flex flex-col gap-4 overflow-y-auto pr-1">
              
              {/* Keyword Search */}
              <div className="glass-panel p-4 rounded-2xl bg-white dark:bg-secondary">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Search Document</h4>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Find keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button type="submit" className="p-2 bg-primary text-white rounded-lg">
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </form>
                {searchMatches.length > 0 && (
                  <div className="flex items-center justify-between text-[10px] mt-2 font-bold text-slate-500">
                    <span>
                      {currentMatchIdx + 1} of {searchMatches.length} pages
                    </span>
                    <div className="flex gap-1">
                      <button onClick={prevMatch} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button onClick={nextMatch} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              <div className="glass-panel p-4 rounded-2xl bg-white dark:bg-secondary flex-1">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Page List</h4>
                <div className="space-y-4">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <div 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                          currentPage === pageNum 
                            ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div className="bg-slate-100 dark:bg-secondary-light h-16 rounded-lg flex items-center justify-center text-[10px] text-slate-400 mb-1">
                          Page {pageNum}
                        </div>
                        <span className="text-[9px]">Page {pageNum}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bookmarks */}
              <div className="glass-panel p-4 rounded-2xl bg-white dark:bg-secondary">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bookmarks</h4>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Bookmark name..."
                    value={bookmarkTitle}
                    onChange={(e) => setBookmarkTitle(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-lg text-xs outline-none"
                  />
                  <input type="hidden" onClick={addBookmark} />
                  <button onClick={addBookmark} className="p-2 bg-accent text-white rounded-lg">
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <ul className="space-y-2 text-[11px] font-bold text-slate-550">
                  {bookmarks.map((bm, i) => (
                    <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-secondary-light/20 p-2 rounded-lg">
                      <button onClick={() => setCurrentPage(bm.page)} className="text-left truncate hover:text-primary flex items-center gap-1.5">
                        <BookmarkCheck className="h-3.5 w-3.5 text-accent" />
                        Page {bm.page}: {bm.label}
                      </button>
                      <button 
                        onClick={() => removeBookmark(bm.page)}
                        className="text-slate-400 hover:text-red-500 font-bold"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          {/* Canvas Render Panel */}
          <div 
            id="pdf-viewport-pane"
            className={`flex-1 flex flex-col items-center p-6 rounded-3xl overflow-auto relative ${
              isNightMode ? 'bg-slate-950' : 'bg-slate-200 dark:bg-slate-900'
            }`}
          >
            {isPresentationMode && (
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold z-20">
                Presentation Mode Active
              </div>
            )}

            <div className="flex-1 flex items-center justify-center py-6 w-full">
              {/* HTML5 Canvas for real rendering */}
              <div className="shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="sticky bottom-0 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg z-10">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-xs font-semibold">
                Page {currentPage} / {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
