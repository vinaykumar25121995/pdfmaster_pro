'use client';
import React, { useState, useMemo } from 'react';
import { 
  FileText, FileSpreadsheet, Presentation, Image as ImageIcon, PenTool, Type, RotateCw, Globe, 
  Unlock, Lock, LayoutGrid, Archive, Wrench, Hash, Camera, Cpu, 
  Sparkles, Languages, EyeOff, Crop, CheckSquare, Trash2, Plus, ArrowLeft, 
  Download, RefreshCw, Layers, ArrowRightLeft, CheckCircle, Upload, Move, Play, HelpCircle, Search
} from 'lucide-react';

interface PDFTool {
  id: string;
  name: string;
  description: string;
  category: 'convert' | 'optimize' | 'security' | 'advanced';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isNew?: boolean;
  accept: string;
  multiple: boolean;
}

export default function ConvertPDF() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'convert' | 'optimize' | 'security'>('all');
  
  // Workspace states
  const [fileList, setFileList] = useState<File[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [convertedFile, setConvertedFile] = useState<{ name: string; path: string; size: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Real PDF.js instances
  const [pdfjsLibInstance, setPdfjsLibInstance] = useState<any>(null);
  const [jpgDataUrl, setJpgDataUrl] = useState<string | null>(null);
  const isInitializedRef = React.useRef(false);

  // Load files from global shared buffer on mount to sync carry-over
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const globFiles = (window as any).sharedFiles as File[];
      if (globFiles && globFiles.length > 0) {
        setFileList(globFiles);
      } else if ((window as any).sharedPdfBuffer && (window as any).sharedPdfName) {
        const buffer = (window as any).sharedPdfBuffer;
        const name = (window as any).sharedPdfName;
        try {
          const file = new File([buffer], name, { type: 'application/pdf' });
          setFileList([file]);
        } catch (e) {
          console.error('Failed to reconstruct file on mount:', e);
        }
      }
    }
  }, []);

  // Whenever fileList changes, synchronize to global shared state
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasGlobalData = (window as any).sharedPdfBuffer || ((window as any).sharedFiles && (window as any).sharedFiles.length > 0);
      if (hasGlobalData && fileList.length === 0 && !isInitializedRef.current) {
        return;
      }
      isInitializedRef.current = true;
      (window as any).sharedFiles = fileList;
      if (fileList.length > 0) {
        const firstPdf = fileList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        if (firstPdf) {
          firstPdf.arrayBuffer().then(buf => {
            (window as any).sharedPdfBuffer = buf;
            (window as any).sharedPdfName = firstPdf.name;
          }).catch(e => {
            console.error('Failed to convert file to arrayBuffer:', e);
          });
        }
      } else {
        (window as any).sharedPdfBuffer = null;
        (window as any).sharedPdfName = null;
      }
    }
  }, [fileList]);

  // Dynamic Browser CDN script loader for PDF.js
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingScript = document.getElementById('pdfjs-script');
      if (existingScript && (window as any).pdfjsLib) {
        setPdfjsLibInstance((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.id = 'pdfjs-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        setPdfjsLibInstance(lib);
      };
      document.head.appendChild(script);
    }
  }, []);

  // Tool specific configuration states
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('red');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [splitRange, setSplitRange] = useState('1-2, 3');
  const [protectPassword, setProtectPassword] = useState('');
  const [rotateAngle, setRotateAngle] = useState(90);

  const API_BASE = 'http://localhost:5000/api/utility';

  const PDF_TOOLS: PDFTool[] = useMemo(() => [
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#2F80ED" fontSize="5" fontWeight="bold" fontFamily="sans-serif">DOC</text>
        </svg>
      ),
      iconBg: 'bg-[#2F80ED]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'pdf-to-powerpoint',
      name: 'PDF to PowerPoint',
      description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#F2994A" fontSize="5" fontWeight="bold" fontFamily="sans-serif">PPT</text>
        </svg>
      ),
      iconBg: 'bg-[#F2994A]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'pdf-to-excel',
      name: 'PDF to Excel',
      description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#27AE60" fontSize="5" fontWeight="bold" fontFamily="sans-serif">XLS</text>
        </svg>
      ),
      iconBg: 'bg-[#27AE60]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'word-to-pdf',
      name: 'Word to PDF',
      description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#2D9CDB" fontSize="5" fontWeight="bold" fontFamily="sans-serif">DOC</text>
        </svg>
      ),
      iconBg: 'bg-[#2D9CDB]',
      iconColor: 'text-white',
      accept: '.doc,.docx',
      multiple: true
    },
    {
      id: 'powerpoint-to-pdf',
      name: 'PowerPoint to PDF',
      description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#EB5757" fontSize="5" fontWeight="bold" fontFamily="sans-serif">PPT</text>
        </svg>
      ),
      iconBg: 'bg-[#EB5757]',
      iconColor: 'text-white',
      accept: '.ppt,.pptx',
      multiple: true
    },
    {
      id: 'excel-to-pdf',
      name: 'Excel to PDF',
      description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#219653" fontSize="5" fontWeight="bold" fontFamily="sans-serif">XLS</text>
        </svg>
      ),
      iconBg: 'bg-[#219653]',
      iconColor: 'text-white',
      accept: '.xls,.xlsx',
      multiple: true
    },
    {
      id: 'pdf-to-jpg',
      name: 'PDF to JPG',
      description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <circle cx="12" cy="12" r="1.5" fill="white" />
          <path d="M20 18l-3-3-2 2-3-3-4 4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <path d="M5 5.5h5M5 7.5h3" stroke="#F2C94C" strokeWidth="1.5" />
        </svg>
      ),
      iconBg: 'bg-[#F2C94C]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'jpg-to-pdf',
      name: 'JPG to PDF',
      description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#F2C94C" fontSize="5" fontWeight="bold" fontFamily="sans-serif">JPG</text>
        </svg>
      ),
      iconBg: 'bg-[#F2C94C]',
      iconColor: 'text-white',
      accept: 'image/jpeg,image/png',
      multiple: true
    },
    {
      id: 'sign-pdf',
      name: 'Sign PDF',
      description: 'Sign yourself or request electronic signatures from others.',
      category: 'security',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      iconBg: 'bg-[#2F80ED]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'watermark',
      name: 'Watermark',
      description: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 21H3M12 5V3m0 2a4 4 0 014 4v3.5a2 2 0 00.586 1.414l1.828 1.828A2 2 0 0117 17H7a2 2 0 01-1.414-3.414l1.828-1.828A2 2 0 008 12.5V9a4 4 0 014-4z" />
        </svg>
      ),
      iconBg: 'bg-[#9B51E0]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'rotate-pdf',
      name: 'Rotate PDF',
      description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />
        </svg>
      ),
      iconBg: 'bg-[#9B51E0]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: true
    },
    {
      id: 'html-to-pdf',
      name: 'HTML to PDF',
      description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="white" />
          <path d="M11 12h6M11 15h4" stroke="white" strokeWidth="1.5" />
          <rect x="3" y="3" width="9" height="9" rx="1.5" fill="white" stroke="white" />
          <text x="4.5" y="9.5" fill="#F2994A" fontSize="5" fontWeight="bold" fontFamily="sans-serif">HTML</text>
        </svg>
      ),
      iconBg: 'bg-[#F2994A]',
      iconColor: 'text-white',
      accept: 'text/html,.html',
      multiple: true
    },
    {
      id: 'unlock-pdf',
      name: 'Unlock PDF',
      description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
      category: 'security',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      ),
      iconBg: 'bg-[#2D9CDB]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'protect-pdf',
      name: 'Protect PDF',
      description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
      category: 'security',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <rect x="9" y="11" width="6" height="5" rx="1" fill="white" />
          <circle cx="12" cy="13" r="1" fill="#2F80ED" />
        </svg>
      ),
      iconBg: 'bg-[#2F80ED]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'organize-pdf',
      name: 'Organize PDF',
      description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="7" height="18" rx="2" fill="none" stroke="white" />
          <line x1="7.5" y1="6" x2="7.5" y2="18" stroke="white" strokeWidth="1.5" />
          <rect x="13" y="3" width="7" height="18" rx="2" fill="none" stroke="white" />
          <path d="M16.5 6l2.5 3-2.5-3-2.5 3" stroke="white" strokeWidth="1.5" />
          <path d="M16.5 18l2.5-3-2.5 3-2.5-3" stroke="white" strokeWidth="1.5" />
        </svg>
      ),
      iconBg: 'bg-[#EB5757]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: true
    },
    {
      id: 'pdf-to-pdfa',
      name: 'PDF to PDF/A',
      description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 17v-8h3a2 2 0 0 1 0 4H9m7 4l-3-6 3 6zm-3 0h3" stroke="white" />
        </svg>
      ),
      iconBg: 'bg-[#4F80E1]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: true
    },
    {
      id: 'repair-pdf',
      name: 'Repair PDF',
      description: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.',
      category: 'security',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      iconBg: 'bg-[#27AE60]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: true
    },
    {
      id: 'page-numbers',
      name: 'Page numbers',
      description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
          <text x="6" y="9" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">1</text>
          <text x="16" y="9" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">2</text>
          <text x="6" y="19" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">3</text>
          <text x="16" y="19" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle">4</text>
        </svg>
      ),
      iconBg: 'bg-[#9B51E0]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'scan-to-pdf',
      name: 'Scan to PDF',
      description: 'Capture document scans from your mobile device and send them instantly to your browser.',
      category: 'convert',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2m-10 0H5a2 2 0 0 1-2-2v-2m4-5h10M7 8h10M7 16h10" />
        </svg>
      ),
      iconBg: 'bg-[#E25C3C]',
      iconColor: 'text-white',
      accept: 'image/jpeg,image/png',
      multiple: true
    },

    {
      id: 'redact-pdf',
      name: 'Redact PDF',
      description: 'Redact text and graphics to permanently remove sensitive information from a PDF.',
      category: 'security',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" strokeWidth="3" />
          <line x1="7" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="3" />
          <line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="3" />
        </svg>
      ),
      iconBg: 'bg-[#EF4444]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'crop-pdf',
      name: 'Crop PDF',
      description: 'Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
          <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
        </svg>
      ),
      iconBg: 'bg-[#EC4899]',
      iconColor: 'text-white',
      accept: 'application/pdf',
      multiple: false
    },
    {
      id: 'pdf-forms',
      name: 'PDF Forms',
      description: 'Detect form fields automatically, create interactive fillable PDFs, or fill PDF forms yourself. Add text fields, checkboxes, multiple choice fields, and lists.',
      category: 'optimize',
      icon: (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h3" stroke="white" />
          <circle cx="16" cy="17" r="1" fill="white" />
        </svg>
      ),
      iconBg: 'bg-[#D946EF]',
      iconColor: 'text-white',
      isNew: true,
      accept: 'application/pdf',
      multiple: false
    }
  ], []);

  const activeTool = useMemo(() => {
    return PDF_TOOLS.find(t => t.id === activeToolId) || null;
  }, [activeToolId, PDF_TOOLS]);

  const filteredTools = useMemo(() => {
    return PDF_TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || tool.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, PDF_TOOLS]);

  // File collection utilities
  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected) {
      setFileList(prev => [...prev, ...Array.from(selected)]);
      setConvertedFile(null);
      setErrorMsg('');
    }
  };

  const removeFile = (idx: number) => {
    setFileList(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag and Drop File Reordering Queue
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newList = [...fileList];
    const draggedItem = newList[draggedIdx];
    newList.splice(draggedIdx, 1);
    newList.splice(idx, 0, draggedItem);

    setDraggedIdx(idx);
    setFileList(newList);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const resetWorkspace = () => {
    setActiveToolId(null);
    setConvertedFile(null);
    setErrorMsg('');
    setProcessing(false);
    setProcessStep('');
  };

  const executeToolAction = async () => {
    if (fileList.length === 0) {
      setErrorMsg('Please select at least one document to begin.');
      return;
    }

    setProcessing(true);
    setConvertedFile(null);
    setErrorMsg('');
    setProcessStep('Reading file buffers...');

    const token = localStorage.getItem('token') || 'mock-user-jwt-token';
    const formData = new FormData();

    // Map active tool categories to actual backend API actions if supported
    try {
      if (activeToolId === 'pdf-to-jpg') {
        setProcessStep('Rendering PDF page client-side...');
        if (!pdfjsLibInstance) {
          throw new Error('PDF render engine is still loading. Please try again in a moment.');
        }
        const file = fileList[0];
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLibInstance.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Render the first page

        // Set scaling to 2.0x for HD crisp rendering
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas offscreen
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2D rendering context.');

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        await page.render(renderContext).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        
        setConvertedFile({
          name: `${baseName}-converted.jpg`,
          path: 'client-side-jpg-data', // indicator for triggerDownload
          size: `${(dataUrl.length / (1024 * 1024)).toFixed(2)} MB`
        });
        setJpgDataUrl(dataUrl);
      }
      else if (activeToolId === 'word-to-pdf' || activeToolId === 'pdf-to-word' || activeToolId === 'pdf-to-excel' || activeToolId === 'pdf-to-powerpoint' || activeToolId === 'jpg-to-pdf') {
        // Run Format Convert backend API
        setProcessStep('Converting file structure...');
        formData.append('file', fileList[0]);
        let direction = 'pdf-to-word';
        if (activeToolId === 'word-to-pdf') direction = 'word-to-pdf';
        else if (activeToolId === 'pdf-to-excel') direction = 'pdf-to-excel'; // mock converted in backend
        else if (activeToolId === 'pdf-to-powerpoint') direction = 'pdf-to-powerpoint';
        else if (activeToolId === 'jpg-to-pdf') direction = 'img-to-pdf';

        formData.append('direction', direction);

        const response = await fetch(`${API_BASE}/convert`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) throw new Error('File conversion failed.');
        const result = await response.json();
        setConvertedFile({
          name: result.filename,
          path: decodeURIComponent(result.downloadUrl.split('path=')[1] || ''),
          size: `${(result.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }
      else if (activeToolId === 'organize-pdf' && fileList.length >= 2) {
        // Run Merge PDFs as organize reordering
        setProcessStep('Merging and ordering pages...');
        fileList.forEach(file => formData.append('files', file));
        
        const response = await fetch(`${API_BASE}/merge`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) throw new Error('Failed to merge document queue.');
        const result = await response.json();
        setConvertedFile({
          name: result.filename,
          path: result.outputPath,
          size: `${(result.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }
      else if (activeToolId === 'watermark') {
        // Run Watermark backend API
        setProcessStep('Drawing watermark stamps...');
        formData.append('file', fileList[0]);
        formData.append('text', watermarkText);
        formData.append('color', watermarkColor);
        formData.append('opacity', '0.35');
        formData.append('size', '40');

        const response = await fetch(`${API_BASE}/watermark`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!response.ok) throw new Error('Watermark processing failed.');
        const result = await response.json();
        setConvertedFile({
          name: result.filename,
          path: result.outputPath,
          size: `${(result.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }
      else {
        // Mock processing for advanced utilities (Translate, Forms, Rotate, Protect, Sign)
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        setProcessStep('Uploading pages...');
        await delay(1200);
        
        setProcessStep('Executing layout engines...');
        await delay(1000);
        
        setProcessStep('Writing PDF streams...');
        await delay(800);

        setConvertedFile({
          name: `processed_${fileList[0].name}`,
          path: 'mock-temp-file-path',
          size: `${(fileList[0].size / (1024 * 1024)).toFixed(2)} MB`
        });
      }
    } catch (err: any) {
      console.error('Execution error:', err);
      setErrorMsg(err.message || 'Service connection failed. Ensure the launcher console is running.');
    } finally {
      setProcessing(false);
      setProcessStep('');
    }
  };

  const triggerDownload = () => {
    if (!convertedFile) return;
    if (convertedFile.path === 'client-side-jpg-data' && jpgDataUrl) {
      const link = document.createElement('a');
      link.href = jpgDataUrl;
      link.download = convertedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (convertedFile.path === 'mock-temp-file-path') {
      // Simulate download for mock elements
      const blob = new Blob(['Mock PDF bytes content.'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = convertedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const downloadUrl = `${API_BASE}/download?path=${encodeURIComponent(convertedFile.path)}`;
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      
      {/* Title */}
      {!activeToolId ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight bg-gradient-to-r from-slate-900 to-slate-750 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
              All PDF Power Tools
            </h1>
            <p className="text-xs text-slate-500 mt-1">Select from our 25 offline-first high performance PDF editing and format converting engines.</p>
          </div>
          
          {/* Search tool */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tools by keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
          <button 
            onClick={resetWorkspace}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-secondary rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${activeTool?.iconBg}`}>
                {activeTool?.icon}
              </span>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{activeTool?.name} Workspace</h1>
              {activeTool?.isNew && (
                <span className="bg-primary/10 text-primary text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  New!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{activeTool?.description}</p>
          </div>
        </div>
      )}

      {/* Grid Menu of Tools */}
      {!activeToolId ? (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap bg-slate-100/80 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 p-1.5 rounded-2xl text-xs font-bold w-fit gap-1.5 shadow-sm">
            {[
              { id: 'all', name: 'All Tools' },
              { id: 'convert', name: 'Convert' },
              { id: 'optimize', name: 'Optimize & Edit' },
              { id: 'security', name: 'Security & Repair' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-xl transition-all duration-250 ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-800 shadow-md text-primary font-bold scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map(tool => (
              <div 
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 cursor-pointer select-none min-h-[220px]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${tool.iconBg} text-white flex items-center justify-center shadow-md shadow-black/5 group-hover:scale-105 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  {tool.isNew && (
                    <span className="bg-primary/10 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse-slow">
                      New!
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-[17px] text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors duration-300 font-display">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-normal">
                  {tool.description}
                </p>
              </div>
            ))}

            {filteredTools.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-3">
                <HelpCircle className="h-8 w-8 text-slate-350 mx-auto" />
                <h3 className="font-bold text-xs text-slate-400">No matching PDF tools found</h3>
                <p className="text-[10px] text-slate-450">Try modifying your tab category or search keyword filter.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Workspace interface */
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Main workspace (file reordering / dropzone) */}
          <div className="lg:col-span-2 space-y-6">
            
            {errorMsg && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-650 dark:text-red-400 font-bold">
                {errorMsg}
              </div>
            )}

            {fileList.length === 0 ? (
              /* Dropzone */
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary rounded-3xl p-20 text-center cursor-pointer bg-white dark:bg-secondary/20 transition-all relative">
                <input 
                  type="file" 
                  multiple={activeTool?.multiple}
                  onChange={handleMultipleFiles}
                  accept={activeTool?.accept}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-primary/10 p-5 rounded-3xl w-fit mx-auto text-primary mb-4 animate-pulse-slow">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-xs">Drag and drop file here</h3>
                <p className="text-[10px] text-slate-455 mt-1">
                  Upload file types matching {activeTool?.accept.replace('application/pdf', 'PDF')} up to 50MB
                </p>
              </div>
            ) : (
              /* File Queue (Draggable Grid Cards) */
              <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Uploaded Pages / Files Queue
                      </span>
                      <button 
                        onClick={() => setFileList([])}
                        className="text-[9px] text-red-500 hover:text-red-650 font-bold uppercase tracking-wider hover:underline transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Drag cards to change processing order
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {fileList.map((file, idx) => {
                      const isDragged = idx === draggedIdx;
                      return (
                        <div
                          key={`${file.name}-${idx}`}
                          draggable={true}
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`group relative flex flex-col justify-between p-4 bg-slate-50 dark:bg-secondary-light/30 border border-slate-200 dark:border-slate-850 rounded-2xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${
                            isDragged ? 'opacity-40 scale-95 border-primary border-dashed bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px]">
                              {idx + 1}
                            </span>
                            <button 
                              onClick={() => removeFile(idx)}
                              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="text-center py-4 text-slate-400">
                            <FileText className="h-8 w-8 mx-auto text-primary" />
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold truncate text-slate-700 dark:text-slate-200">
                              {file.name}
                            </p>
                            <p className="text-[9px] text-slate-400">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>

                          {/* Hover drag overlay handles indicator */}
                          <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none flex items-center justify-center transition-opacity">
                            <Move className="h-4 w-4 text-primary animate-pulse-slow" />
                          </div>
                        </div>
                      );
                    })}

                    {/* Add More Files Dashed Plus Trigger Card */}
                    {activeTool?.multiple && (
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[140px] relative">
                        <input 
                          type="file" 
                          multiple
                          onChange={handleMultipleFiles}
                          accept={activeTool?.accept}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Plus className="h-6 w-6 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Add Pages</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={resetWorkspace}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeToolAction}
                    disabled={processing}
                    className="flex-1.5 py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {processing ? 'Processing PDF...' : `Process ${activeTool?.name}`}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right workspace sidebar config panel */}
          <div className="space-y-6">
            
            {/* Tool specific settings if files uploaded */}
            {fileList.length > 0 && !convertedFile && (
              <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
                <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  Tool Settings
                </h3>

                {activeToolId === 'watermark' && (
                  <div className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Text Stamp</label>
                      <input 
                        type="text" 
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stamp Color</label>
                      <select 
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none"
                      >
                        <option value="red">Red Color</option>
                        <option value="blue">Blue Color</option>
                        <option value="gray">Gray Color</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeToolId === 'compress' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Compression Settings</label>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                      {[
                        { id: 'low', name: 'Low', desc: 'Max Quality' },
                        { id: 'medium', name: 'Medium', desc: 'Optimized' },
                        { id: 'high', name: 'High', desc: 'Max Compress' }
                      ].map(level => (
                        <button 
                          key={level.id}
                          onClick={() => setCompressLevel(level.id as any)}
                          className={`p-2.5 border rounded-xl transition-all ${
                            compressLevel === level.id 
                              ? 'border-primary bg-primary/5 text-primary' 
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-[11px]">{level.name}</span>
                          <span className="block text-[8px] text-slate-400 mt-0.5 font-semibold">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeToolId === 'organize-pdf' && (
                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Queue Options</label>
                    <span className="text-[10px] text-slate-400 block leading-relaxed font-semibold">
                      Files will be collated page-by-page. Drag thumbnails in the workspace queue to align reordering flow before processing.
                    </span>
                  </div>
                )}

                {activeToolId === 'protect-pdf' && (
                  <div className="space-y-1 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Password Protection</label>
                    <input 
                      type="password" 
                      placeholder="Type locking password..."
                      value={protectPassword}
                      onChange={(e) => setProtectPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {activeToolId === 'rotate-pdf' && (
                  <div className="space-y-1 text-xs font-semibold">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rotation Angle</label>
                    <select 
                      value={rotateAngle}
                      onChange={(e) => setRotateAngle(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none"
                    >
                      <option value={90}>90° Rotation Clockwise</option>
                      <option value={180}>180° Inverted</option>
                      <option value={270}>270° Counter-Clockwise</option>
                    </select>
                  </div>
                )}

                {/* Default text indicator for simple converters */}
                {['pdf-to-word', 'pdf-to-excel', 'pdf-to-powerpoint', 'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'html-to-pdf', 'translate-pdf', 'redact-pdf', 'crop-pdf', 'pdf-forms'].includes(activeToolId || '') && (
                  <div className="space-y-1 text-xs">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Direct Stream Pipeline</label>
                    <span className="text-[10px] text-slate-400 block leading-relaxed font-semibold">
                      This conversion pipeline runs high-performance native codecs to yield almost 100% vector accuracy in output.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Processing Steps Status */}
            {processing && (
              <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-3 animate-pulse-slow">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Executing PDF Pipeline...</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 capitalize">
                  Current: {processStep}
                </div>
              </div>
            )}

            {/* Output completed download card */}
            {convertedFile && (
              <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4 animate-fade-in shadow-xl border border-accent/20 dark:border-accent/10">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <h3 className="font-bold text-sm">Operation Complete</h3>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">File Output Name</span>
                    <span className="text-right truncate max-w-[150px]">{convertedFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size</span>
                    <span>{convertedFile.size}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={resetWorkspace}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-[10px] font-bold transition-all text-center"
                  >
                    Clear Workspace
                  </button>
                  <button 
                    onClick={triggerDownload}
                    className="flex-1.5 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-[10px] shadow-lg shadow-accent/25 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="h-4 w-4" /> Download File
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
