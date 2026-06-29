'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { 
  Folder, File as FileIcon, Plus, Search, Star, Trash2, Tag, Upload, 
  ChevronRight, MoreVertical, LayoutGrid, List, Check,
  FolderOpen, Calendar, ArrowLeft, RefreshCw
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  folderId: string | null;
  isFavorite: boolean;
  isTrash: boolean;
  tags: string[];
  createdAt: string;
}

interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
}

export default function DocumentLibrary() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showTrashOnly, setShowTrashOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    // Seed default mock assets for immediate offline loading
    const seedFolders: FolderItem[] = [
      { id: 'f1', name: 'Legal Contracts', parentFolderId: null },
      { id: 'f2', name: 'Invoices & Billing', parentFolderId: null },
      { id: 'f3', name: 'Tax Submissions 2026', parentFolderId: null }
    ];

    const seedDocs: Document[] = [
      {
        id: 'doc-1',
        filename: 'Employment_Agreement_2026.pdf',
        fileSize: 1250000,
        mimeType: 'application/pdf',
        folderId: 'f1',
        isFavorite: true,
        isTrash: false,
        tags: ['legal', 'hr'],
        createdAt: '2026-06-10T10:00:00.000Z'
      },
      {
        id: 'doc-2',
        filename: 'Rent_Receipt_June.jpg',
        fileSize: 450000,
        mimeType: 'image/jpeg',
        folderId: 'f2',
        isFavorite: false,
        isTrash: false,
        tags: ['rent', 'receipt'],
        createdAt: '2026-06-15T12:30:00.000Z'
      },
      {
        id: 'doc-3',
        filename: 'Scanned_Invoice_982.png',
        fileSize: 890000,
        mimeType: 'image/png',
        folderId: 'f2',
        isFavorite: false,
        isTrash: false,
        tags: ['invoice', 'raw'],
        createdAt: '2026-06-16T14:45:00.000Z'
      },
      {
        id: 'doc-4',
        filename: 'Annual_Tax_Draft.pdf',
        fileSize: 3200000,
        mimeType: 'application/pdf',
        folderId: 'f3',
        isFavorite: true,
        isTrash: false,
        tags: ['tax', '2026'],
        createdAt: '2026-06-17T09:15:00.000Z'
      }
    ];

    const cachedFolders = localStorage.getItem('library_folders');
    const cachedDocs = localStorage.getItem('library_docs');

    if (cachedFolders) setFolders(JSON.parse(cachedFolders));
    else {
      setFolders(seedFolders);
      localStorage.setItem('library_folders', JSON.stringify(seedFolders));
    }

    let docs = cachedDocs ? JSON.parse(cachedDocs) : seedDocs;

    // Sync file upload state from other views (Reader, Editor, OCR Scanner)
    if (typeof window !== 'undefined') {
      const globFiles = (window as any).sharedFiles as File[];
      if (globFiles && globFiles.length > 0) {
        globFiles.forEach((file, idx) => {
          const docIdx = docs.findIndex((d: Document) => d.filename === file.name);
          if (docIdx === -1) {
            docs.push({
              id: `doc-sync-${Date.now()}-${idx}`,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type || 'application/pdf',
              folderId: null,
              isFavorite: false,
              isTrash: false,
              tags: ['synced'],
              createdAt: new Date().toISOString()
            });
          } else {
            // Update the size if it has changed
            if (docs[docIdx].fileSize !== file.size) {
              docs[docIdx].fileSize = file.size;
            }
          }
        });
      } else if ((window as any).sharedPdfBuffer && (window as any).sharedPdfName) {
        const name = (window as any).sharedPdfName;
        const buffer = (window as any).sharedPdfBuffer;
        const size = buffer.byteLength || 500000;
        const docIdx = docs.findIndex((d: Document) => d.filename === name);
        if (docIdx === -1) {
          docs.push({
            id: `doc-sync-${Date.now()}`,
            filename: name,
            fileSize: size,
            mimeType: 'application/pdf',
            folderId: null,
            isFavorite: false,
            isTrash: false,
            tags: ['synced'],
            createdAt: new Date().toISOString()
          });
        } else {
          // Update the size if it has changed
          if (docs[docIdx].fileSize !== size) {
            docs[docIdx].fileSize = size;
          }
        }
      }
    }

    setDocuments(docs);
    localStorage.setItem('library_docs', JSON.stringify(docs));
  }, []);

  const handleOpenDocument = async (doc: Document) => {
    if (doc.mimeType !== 'application/pdf') {
      // If it is an image, redirect to the OCR Scanner
      if (typeof window !== 'undefined') {
        const dummyBuffer = new ArrayBuffer(8);
        const f = new File([dummyBuffer], doc.filename, { type: doc.mimeType });
        (window as any).sharedFiles = [f];
        (window as any).sharedPdfBuffer = null;
        (window as any).sharedPdfName = null;
      }
      router.push('/dashboard/ocr');
      return;
    }

    // If PDF, check if it's already active in cache
    if (typeof window !== 'undefined' && (window as any).sharedPdfName === doc.filename && (window as any).sharedPdfBuffer) {
      router.push('/dashboard/reader');
      return;
    }

    // Generate a standard, compliant PDF dynamically using pdf-lib
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      page.drawText(`Document: ${doc.filename}`, { x: 50, y: 720, size: 32, font });
      page.drawText(`Created: ${new Date(doc.createdAt).toLocaleDateString()}`, { x: 50, y: 660, size: 18, font });
      page.drawText(`Size: ${formatSize(doc.fileSize)}`, { x: 50, y: 620, size: 18, font });
      page.drawText(`This is a compliant vector document container synced from library.`, { x: 50, y: 530, size: 18, font });
      
      const pdfBytes = await pdfDoc.save();
      const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

      if (typeof window !== 'undefined') {
        (window as any).sharedPdfBuffer = buffer;
        (window as any).sharedPdfName = doc.filename;
        (window as any).sharedFiles = [new File([pdfBytes as any], doc.filename, { type: 'application/pdf' })];
      }
      router.push('/dashboard/reader');
    } catch (e) {
      console.error('Failed to generate dynamic PDF:', e);
    }
  };

  const saveToStorage = (updatedFolders: FolderItem[], updatedDocs: Document[]) => {
    setFolders(updatedFolders);
    setDocuments(updatedDocs);
    localStorage.setItem('library_folders', JSON.stringify(updatedFolders));
    localStorage.setItem('library_docs', JSON.stringify(updatedDocs));
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentFolderId: currentFolderId
    };

    const updated = [...folders, newFolder];
    saveToStorage(updated, documents);
    setNewFolderName('');
    setShowFolderModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if (e.type === 'change') {
      files = (e.target as HTMLInputElement).files;
    } else {
      e.preventDefault();
      files = (e as React.DragEvent).dataTransfer.files;
    }

    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedDocs: Document[] = [];

    const filesList = Array.from(files);
    // Sync newly uploaded files directly to global window carry-over states
    if (typeof window !== 'undefined') {
      (window as any).sharedFiles = filesList;
      const firstPdf = filesList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (firstPdf) {
        firstPdf.arrayBuffer().then(buf => {
          (window as any).sharedPdfBuffer = buf;
          (window as any).sharedPdfName = firstPdf.name;
        }).catch(err => console.error(err));
      }
    }

    filesList.forEach((file, index) => {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${index}`,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        folderId: currentFolderId,
        isFavorite: false,
        isTrash: false,
        tags: [],
        createdAt: new Date().toISOString()
      };
      uploadedDocs.push(newDoc);
    });

    setTimeout(() => {
      const updated = [...documents, ...uploadedDocs];
      saveToStorage(folders, updated);
      setUploading(false);
      setDragActive(false);
    }, 1200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = documents.map(doc => 
      doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    saveToStorage(folders, updated);
  };

  const toggleTrash = (id: string) => {
    const updated = documents.map(doc => 
      doc.id === id ? { ...doc, isTrash: !doc.isTrash } : doc
    );
    saveToStorage(folders, updated);
  };

  const deletePermanently = (id: string) => {
    const updated = documents.filter(doc => doc.id !== id);
    saveToStorage(folders, updated);
  };

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const crumbs = [];
    let currentId = currentFolderId;
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (folder) {
        crumbs.unshift(folder);
        currentId = folder.parentFolderId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  // Filter Logic
  const filteredFolders = folders.filter(f => f.parentFolderId === currentFolderId && !showTrashOnly && !showFavoritesOnly);
  
  const filteredDocuments = documents.filter(doc => {
    // Folder match
    if (!showTrashOnly && !showFavoritesOnly && doc.folderId !== currentFolderId) return false;
    
    // Trash match
    if (showTrashOnly && !doc.isTrash) return false;
    if (!showTrashOnly && doc.isTrash) return false;

    // Favorites match
    if (showFavoritesOnly && !doc.isFavorite) return false;

    // Search query match
    if (searchQuery) {
      const matchName = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchName && !matchTag) return false;
    }

    // Selected Tag match
    if (selectedTag && !doc.tags.includes(selectedTag)) return false;

    return true;
  });

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Search and Main actions bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Document Library</h1>
          <p className="text-xs text-slate-500">Organize folders, apply search tags, and secure files.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search file names..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary w-full md:w-60" 
            />
          </div>

          <button 
            onClick={() => setShowFolderModal(true)}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-secondary-light/40 p-1 rounded-xl text-xs">
          <button 
            onClick={() => { setShowTrashOnly(false); setShowFavoritesOnly(false); setCurrentFolderId(null); }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${!showTrashOnly && !showFavoritesOnly ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
          >
            All Files
          </button>
          <button 
            onClick={() => { setShowFavoritesOnly(true); setShowTrashOnly(false); }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${showFavoritesOnly ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Favorites
          </button>
          <button 
            onClick={() => { setShowTrashOnly(true); setShowFavoritesOnly(false); }}
            className={`px-3 py-1.5 font-bold rounded-lg transition-all ${showTrashOnly ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Trash Bin
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-1 bg-white dark:bg-secondary">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'text-slate-400'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'text-slate-400'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Breadcrumbs */}
      {!showTrashOnly && !showFavoritesOnly && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <button 
            onClick={() => setCurrentFolderId(null)}
            className="hover:text-primary transition-colors"
          >
            Root
          </button>
          {getBreadcrumbs().map((crumb) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="h-3.5 w-3.5" />
              <button 
                onClick={() => setCurrentFolderId(crumb.id)}
                className="hover:text-primary transition-colors last:text-slate-900 last:dark:text-slate-200 last:font-bold"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Tags Quickfilter list */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mr-2">
            <Tag className="h-3.5 w-3.5" /> Tags filter:
          </span>
          <button 
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${!selectedTag ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button 
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${tag === selectedTag ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Drag & Drop File Upload Panel */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleFileUpload}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <input 
          type="file" 
          multiple
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-2xl w-fit mx-auto text-primary">
            {uploading ? <RefreshCw className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {uploading ? 'Uploading your files...' : 'Drag & drop documents here'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDFs, JPEGs, PNGs, and TIFF files up to 50MB.
            </p>
          </div>
        </div>
      </div>

      {/* Library Grid View */}
      {filteredFolders.length === 0 && filteredDocuments.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl">
          <FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-sm">No items found</h3>
          <p className="text-xs text-slate-400 mt-1">
            This directory or filter state is empty. Upload a file to get started.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Folders Loop */}
          {filteredFolders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setCurrentFolderId(folder.id)}
              className="glass-panel p-5 rounded-2xl glow-card cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-950/20 p-2.5 rounded-xl text-yellow-500">
                  <Folder className="h-5 w-5 fill-current" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = folders.filter(f => f.id !== folder.id);
                    saveToStorage(updated, documents);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-sm truncate">{folder.name}</h3>
            </div>
          ))}

          {/* Documents Loop */}
          {filteredDocuments.map(doc => (
            <div 
              key={doc.id}
              onClick={() => handleOpenDocument(doc)}
              className="glass-panel p-5 rounded-2xl glow-card flex flex-col justify-between relative group cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${doc.mimeType.includes('pdf') ? 'bg-red-100 dark:bg-red-950/20 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <FileIcon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                      className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${doc.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                    >
                      <Star className={`h-4 w-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    {doc.isTrash ? (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleTrash(doc.id); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-accent transition-all"
                          title="Restore"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePermanently(doc.id); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTrash(doc.id); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Move to trash"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm truncate mb-1" title={doc.filename}>{doc.filename}</h3>
                <span className="text-[10px] text-slate-400 font-semibold block">{formatSize(doc.fileSize)}</span>
              </div>

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {doc.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-3xl overflow-hidden bg-white dark:bg-secondary/40 border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-secondary/80 font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Name</th>
                <th className="p-4">Size</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {filteredFolders.map(folder => (
                <tr 
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="hover:bg-slate-50 dark:hover:bg-secondary-light/20 cursor-pointer transition-colors"
                >
                  <td className="p-4 flex items-center gap-3">
                    <Folder className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold">{folder.name}</span>
                  </td>
                  <td className="p-4 text-slate-400">--</td>
                  <td className="p-4">--</td>
                  <td className="p-4 text-slate-400">--</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        const updated = folders.filter(f => f.id !== folder.id);
                        saveToStorage(updated, documents);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDocuments.map(doc => (
                <tr 
                  key={doc.id} 
                  onClick={() => handleOpenDocument(doc)}
                  className="hover:bg-slate-50 dark:hover:bg-secondary-light/20 transition-colors cursor-pointer"
                >
                  <td className="p-4 flex items-center gap-3">
                    <FileIcon className={`h-4 w-4 ${doc.mimeType.includes('pdf') ? 'text-red-500' : 'text-primary'}`} />
                    <span className="truncate max-w-xs">{doc.filename}</span>
                  </td>
                  <td className="p-4 text-slate-500">{formatSize(doc.fileSize)}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {doc.tags.map(t => (
                        <span key={t} className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">#{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(doc.id); }}
                        className={`p-1.5 rounded transition-all ${doc.isFavorite ? 'text-amber-500' : 'text-slate-400'}`}
                      >
                        <Star className={`h-4 w-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTrash(doc.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal Dialog */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-panel p-6 rounded-3xl bg-white dark:bg-secondary">
            <h3 className="text-lg font-bold font-display mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input 
                type="text" 
                placeholder="Folder name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none" 
                required
                autoFocus
              />
              <div className="flex justify-end gap-3 text-xs font-bold">
                <button 
                  type="button" 
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
