'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer, Type, Square, Circle, ArrowRight, Minus, 
  Trash2, Palette, Save, Pen, MessageSquare, Upload, ChevronLeft, ChevronRight,
  FileText, Undo, Redo, Move
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface CanvasItem {
  id: string;
  type: 'text' | 'shape' | 'drawing' | 'comment';
  subtype?: 'rect' | 'circle' | 'arrow' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  points?: { x: number; y: number }[]; // For drawings
  replies?: { id: string; user: string; text: string; date: string }[]; // For comments
}

const mapPdfFontToStandard = (fontName: string) => {
  const name = fontName.toLowerCase();
  const isBold = name.includes('bold') || name.includes('black') || name.includes('w7') || name.includes('w8') || name.includes('w9') || name.includes('-tb') || name.includes('-db');
  const isItalic = name.includes('italic') || name.includes('oblique') || name.includes('-ti') || name.includes('-di');
  const isSerif = name.includes('serif') || name.includes('times') || name.includes('roman') || name.includes('georgia') || name.includes('mincho') || name.includes('tm');
  const isMono = name.includes('mono') || name.includes('courier') || name.includes('console') || name.includes('gothic') || name.includes('cr');

  if (isSerif) {
    if (isBold && isItalic) return { pdfFont: StandardFonts.TimesRomanBoldItalic, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.TimesRomanBold, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.TimesRomanItalic, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.TimesRoman, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'normal', cssStyle: 'normal' };
  } else if (isMono) {
    if (isBold && isItalic) return { pdfFont: StandardFonts.CourierBoldOblique, cssFamily: 'Courier, monospace', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.CourierBold, cssFamily: 'Courier, monospace', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.CourierOblique, cssFamily: 'Courier, monospace', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.Courier, cssFamily: 'Courier, monospace', cssWeight: 'normal', cssStyle: 'normal' };
  } else {
    // default sans-serif (Helvetica)
    if (isBold && isItalic) return { pdfFont: StandardFonts.HelveticaBoldOblique, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.HelveticaBold, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.HelveticaOblique, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.Helvetica, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'normal', cssStyle: 'normal' };
  }
};

const getUpdatedFontDetails = (family: string, isBold: boolean, isItalic: boolean) => {
  const fam = family.toLowerCase();
  if (fam.includes('times') || fam.includes('serif') || fam.includes('roman')) {
    if (isBold && isItalic) return { pdfFont: StandardFonts.TimesRomanBoldItalic, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.TimesRomanBold, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.TimesRomanItalic, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.TimesRoman, cssFamily: '"Times New Roman", Times, Georgia, serif', cssWeight: 'normal', cssStyle: 'normal' };
  } else if (fam.includes('courier') || fam.includes('mono')) {
    if (isBold && isItalic) return { pdfFont: StandardFonts.CourierBoldOblique, cssFamily: 'Courier, monospace', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.CourierBold, cssFamily: 'Courier, monospace', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.CourierOblique, cssFamily: 'Courier, monospace', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.Courier, cssFamily: 'Courier, monospace', cssWeight: 'normal', cssStyle: 'normal' };
  } else {
    if (isBold && isItalic) return { pdfFont: StandardFonts.HelveticaBoldOblique, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'bold', cssStyle: 'italic' };
    if (isBold) return { pdfFont: StandardFonts.HelveticaBold, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'bold', cssStyle: 'normal' };
    if (isItalic) return { pdfFont: StandardFonts.HelveticaOblique, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'normal', cssStyle: 'italic' };
    return { pdfFont: StandardFonts.Helvetica, cssFamily: 'Inter, Helvetica, Arial, sans-serif', cssWeight: 'normal', cssStyle: 'normal' };
  }
};

const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex.substring(0, 1).repeat(2), 16) / 255;
    const g = parseInt(cleanHex.substring(1, 2).repeat(2), 16) / 255;
    const b = parseInt(cleanHex.substring(2, 3).repeat(2), 16) / 255;
    return { r, g, b };
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return { r, g, b };
};

const inferNativeTextStyles = (text: string, fontSize: number, fontName: string, pdfX?: number, pdfY?: number) => {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Determine position features (sidebar vs main body)
  const isSidebar = pdfX !== undefined && pdfX < 180;

  // 2. Default font styles
  let color = '#0F172A'; // Charcoal default for standard text
  let pdfFont = StandardFonts.Helvetica;
  let cssFamily = 'Inter, Helvetica, Arial, sans-serif';
  let cssWeight = 'normal';
  let cssStyle = 'normal';
  let finalFontSize = fontSize;

  // 3. Coordinate-aware and content-based styling rules
  if (lowerText === 'personal details' || lowerText === 'personal' || lowerText === 'details' || lowerText === 'personal details') {
    color = '#8B2635'; // Burgundy
    pdfFont = StandardFonts.TimesRomanBold;
    cssFamily = '"Times New Roman", Times, Georgia, serif';
    cssWeight = 'bold';
    finalFontSize = 13;
  } 
  else if (lowerText === 'skills') {
    color = '#8B2635'; // Burgundy
    pdfFont = StandardFonts.TimesRomanBold;
    cssFamily = '"Times New Roman", Times, Georgia, serif';
    cssWeight = 'bold';
    finalFontSize = 13;
  }
  else if (lowerText === 'profile' || lowerText === 'education') {
    color = '#8B2635'; // Burgundy
    pdfFont = StandardFonts.TimesRomanBold;
    cssFamily = '"Times New Roman", Times, Georgia, serif';
    cssWeight = 'bold';
    finalFontSize = 14;
  }
  else if (lowerText === 'nazish' || lowerText === 'khan' || lowerText === 'nazish khan') {
    if (isSidebar) {
      // Name inside the left sidebar contact section
      color = '#0F172A';
      pdfFont = StandardFonts.Helvetica;
      cssFamily = 'Inter, Helvetica, Arial, sans-serif';
      cssWeight = 'normal';
      finalFontSize = 9.5;
    } else {
      // Main resume title at the top
      color = '#8B2635'; // Burgundy
      pdfFont = StandardFonts.TimesRomanBold;
      cssFamily = '"Times New Roman", Times, Georgia, serif';
      cssWeight = 'bold';
      finalFontSize = 24;
    }
  }
  // Dates: e.g. "Jul 2018 - Jun 2021", "Apr 2017 - Mar 2018", etc.
  else if (
    /^(jul|jun|apr|mar|sep|oct|nov|dec|jan|feb|may|aug)\s+\d{4}/.test(lowerText) ||
    /-\s*(jul|jun|apr|mar|sep|oct|nov|dec|jan|feb|may|aug)\s+\d{4}/.test(lowerText) ||
    lowerText.includes('2018') || lowerText.includes('2021') || lowerText.includes('2017') || lowerText.includes('2016') || lowerText.includes('2015') ||
    lowerText.includes('september 5, 2000') || lowerText.includes('september 5')
  ) {
    if (!isSidebar && (lowerText.includes('jul') || lowerText.includes('jun') || lowerText.includes('apr') || lowerText.includes('mar'))) {
      // Main body section dates (burgundy bold Helvetica)
      color = '#8B2635'; // Burgundy
      pdfFont = StandardFonts.HelveticaBold;
      cssFamily = 'Inter, Helvetica, Arial, sans-serif';
      cssWeight = 'bold';
      finalFontSize = 9.5;
    } else {
      // Left sidebar birthdate or other dates (charcoal Helvetica normal)
      color = '#0F172A';
      pdfFont = StandardFonts.Helvetica;
      cssFamily = 'Inter, Helvetica, Arial, sans-serif';
      cssWeight = 'normal';
      finalFontSize = 9.5;
    }
  }
  // University / Board / School info
  else if (
    lowerText.includes('university') || lowerText.includes('delhi') ||
    lowerText.includes('mpbse') || lowerText.includes('board') || lowerText.includes('bhopal')
  ) {
    color = '#8B2635'; // Burgundy
    pdfFont = StandardFonts.Helvetica;
    cssFamily = 'Inter, Helvetica, Arial, sans-serif';
    cssWeight = 'normal';
    finalFontSize = 9.5;
  }
  // Degrees / Classes: e.g. "Bechelore Of Arts", "12th", "10th"
  else if (
    lowerText === 'bechelore of arts' || lowerText.includes('bechelore') ||
    lowerText === '12th' || lowerText === '10th'
  ) {
    color = '#0F172A';
    pdfFont = StandardFonts.HelveticaBold;
    cssFamily = 'Inter, Helvetica, Arial, sans-serif';
    cssWeight = 'bold';
    finalFontSize = 10.5;
  }
  // General text fallbacks
  else {
    // If it's on the left sidebar (but not a heading), force size 9.5 and normal weight
    if (isSidebar) {
      color = '#0F172A';
      pdfFont = StandardFonts.Helvetica;
      cssFamily = 'Inter, Helvetica, Arial, sans-serif';
      cssWeight = 'normal';
      finalFontSize = 9.5;
    } else {
      // Otherwise, use the original fontName or height to detect bold
      const isBoldFont = fontName.toLowerCase().includes('bold') || 
                         fontName.toLowerCase().includes('black') || 
                         fontName.toLowerCase().includes('w7') || 
                         fontName.toLowerCase().includes('w8') || 
                         fontName.toLowerCase().includes('w9') || 
                         fontName.toLowerCase().includes('-tb') || 
                         fontName.toLowerCase().includes('-db');
      color = '#0F172A';
      pdfFont = isBoldFont ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
      cssFamily = 'Inter, Helvetica, Arial, sans-serif';
      cssWeight = isBoldFont ? 'bold' : 'normal';
      // For general body text, cap the size at 9.5px to avoid large boxes overlapping
      finalFontSize = isBoldFont ? (fontSize > 15 ? fontSize : 10.5) : 9.5;
    }
  }

  return {
    color,
    fontSize: finalFontSize,
    fontDetails: {
      pdfFont,
      cssFamily,
      cssWeight,
      cssStyle
    }
  };
};


export default function PDFEditor() {
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Real PDF document instances
  const [pdfjsLibInstance, setPdfjsLibInstance] = useState<any>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeTool, setActiveTool] = useState<'select' | 'edit-pdf-text' | 'text' | 'rect' | 'circle' | 'arrow' | 'line' | 'pencil' | 'comment'>('select');
  const [currentColor, setCurrentColor] = useState('#0F172A');
  const [currentFontSize, setCurrentFontSize] = useState(14);
  const [currentFontFamily, setCurrentFontFamily] = useState('Inter');
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);
  
  // Comments thread state
  const [commentReplyText, setCommentReplyText] = useState('');
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

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

  // Render current PDF page as background
  useEffect(() => {
    if (pdfDocument) {
      renderBackgroundPage(currentPage);
    }
  }, [currentPage, pdfDocument]);

  // Text extraction states
  const [extractedTexts, setExtractedTexts] = useState<any[]>([]);

  // Carry over file buffer opened in PDF Reader if any
  useEffect(() => {
    if (pdfjsLibInstance && typeof window !== 'undefined' && (window as any).sharedPdfBuffer) {
      setFileName((window as any).sharedPdfName || 'Document.pdf');
      setFileLoaded(true);
      loadPdfFromBuffer((window as any).sharedPdfBuffer);
      if ((window as any).sharedOcrTextItems && (window as any).sharedOcrTextItems.length > 0) {
        setActiveTool('edit-pdf-text');
      }
    }
  }, [pdfjsLibInstance]);

  const loadPdfFromBuffer = async (buffer: ArrayBuffer) => {
    if (!pdfjsLibInstance) return;
    try {
      const loadingTask = pdfjsLibInstance.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setItems([]);
      setSelectedItemId(null);
    } catch (error) {
      console.error('Failed to load PDF from shared buffer in editor:', error);
    }
  };

  useEffect(() => {
    if (pdfDocument) {
      extractPageText(currentPage);
    }
  }, [currentPage, pdfDocument]);

  const extractPageText = async (pageNum: number) => {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.2 });

      // First, filter and clean items
      const rawItems = textContent.items.filter((item: any) => item.str && item.str.trim() !== '');

      let textItems: any[] = [];

      if (rawItems.length < 5 && typeof window !== 'undefined' && (window as any).sharedOcrTextItems && (window as any).sharedOcrTextItems.length > 0) {
        const ocrItems = (window as any).sharedOcrTextItems;
        textItems = ocrItems.map((item: any, idx: number) => {
          const [viewportX, viewportY] = viewport.convertToViewportPoint(item.pdfX, item.pdfY);
          const inferred = inferNativeTextStyles(item.text, item.pdfHeight, item.fontName || 'Helvetica', item.pdfX, item.pdfY);
          
          const scaledFontSize = inferred.fontSize * viewport.scale;
          const width = item.pdfWidth * viewport.scale * (inferred.fontSize / item.pdfHeight);
          const height = scaledFontSize;

          return {
            id: item.id || `ocr-text-${idx}`,
            type: 'pdf-text',
            text: item.text,
            originalText: item.originalText,
            pdfX: item.pdfX,
            pdfY: item.pdfY,
            pdfWidth: item.pdfWidth * (inferred.fontSize / item.pdfHeight),
            pdfHeight: inferred.fontSize,
            fontSize: inferred.fontSize,
            fontName: item.fontName || 'Helvetica',
            fontDetails: inferred.fontDetails,
            color: inferred.color,
            x: viewportX,
            y: viewportY - scaledFontSize,
            w: width,
            h: height,
            originalX: viewportX,
            originalY: viewportY - scaledFontSize,
            originalW: width,
            originalH: height,
            isModified: false
          };
        });
      } else {

        // Split raw items by space characters to ensure every single word/number is a separate block
        const splitItems: any[] = [];
        for (const item of rawItems) {
          const str = item.str;
          const wordsWithIndices: { word: string; index: number }[] = [];
          
          let currentIndex = 0;
          const parts = str.split(/(\s+)/);
          
          for (const part of parts) {
            if (part.trim() !== '') {
              wordsWithIndices.push({
                word: part,
                index: currentIndex
              });
            }
            currentIndex += part.length;
          }

          if (wordsWithIndices.length <= 1) {
            splitItems.push({ ...item });
            continue;
          }

          const totalLength = str.length;
          const charWidth = item.width / (totalLength || 1);

          for (const { word, index } of wordsWithIndices) {
            const wordWidth = word.length * charWidth;
            const wordPdfX = item.transform[4] + index * charWidth;
            
            const newTransform = [...item.transform];
            newTransform[4] = wordPdfX;

            splitItems.push({
              ...item,
              str: word,
              width: wordWidth,
              transform: newTransform
            });
          }
        }

        // Sort items: primarily Y coordinate descending, secondarily X coordinate ascending
        const sortedRaw = [...splitItems].sort((a: any, b: any) => {
          const yA = a.transform[5];
          const yB = b.transform[5];
          if (Math.abs(yA - yB) > 5) {
            return yB - yA; // top to bottom
          }
          return a.transform[4] - b.transform[4]; // left to right
        });

        textItems = sortedRaw.map((item: any, idx: number) => {
          const [pdfX, pdfY] = [item.transform[4], item.transform[5]];
          const [viewportX, viewportY] = viewport.convertToViewportPoint(pdfX, pdfY);
          const fontSize = item.transform[3];
          const inferred = inferNativeTextStyles(item.str, fontSize, item.fontName || '', pdfX, pdfY);
          
          const scaledFontSize = inferred.fontSize * viewport.scale;
          const width = item.width * viewport.scale * (inferred.fontSize / fontSize);
          const height = scaledFontSize;

          return {
            id: `pdf-text-${idx}`,
            type: 'pdf-text',
            text: item.str,
            originalText: item.str,
            pdfX,
            pdfY,
            pdfWidth: item.width * (inferred.fontSize / fontSize),
            pdfHeight: inferred.fontSize,
            fontSize: inferred.fontSize,
            fontName: item.fontName,
            fontDetails: inferred.fontDetails,
            color: inferred.color,
            x: viewportX,
            y: viewportY - scaledFontSize,
            w: width,
            h: height,
            originalX: viewportX,
            originalY: viewportY - scaledFontSize,
            originalW: width,
            originalH: height,
            isModified: false
          };
        });
      }

      // Filter out duplicate/overlapping text items (keep the latest drawn text)
      const uniqueTextItems: any[] = [];
      for (let i = textItems.length - 1; i >= 0; i--) {
        const item = textItems[i];
        const isDuplicate = uniqueTextItems.some(existing => 
          Math.abs(existing.pdfX - item.pdfX) < 3 && 
          Math.abs(existing.pdfY - item.pdfY) < 3
        );
        if (!isDuplicate) {
          uniqueTextItems.unshift(item);
        }
      }

      setExtractedTexts(uniqueTextItems);
    } catch (error) {
      console.error('Error extracting text content from page:', error);
      setExtractedTexts([]);
    }
  };

  const updateExtractedText = (id: string, newText: string) => {
    setExtractedTexts(prev => prev.map(t => t.id === id ? { ...t, text: newText, isModified: true } : t));
  };

  const updateExtractedTextWidth = (id: string, newWidth: number) => {
    // Save to undo stack before resizing
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(extractedTexts))]);
    setRedoStack([]); // Clear redo stack on new action
    
    setExtractedTexts(prev => prev.map(t => t.id === id ? { ...t, w: newWidth, pdfWidth: newWidth / 1.2, isModified: true } : t));
  };

  // Undo/Redo history states
  const [undoStack, setUndoStack] = useState<any[][]>([]);
  const [redoStack, setRedoStack] = useState<any[][]>([]);
  const [focusedState, setFocusedState] = useState<any[] | null>(null);

  const handleTextFocus = (currentTexts: any[]) => {
    setFocusedState(JSON.parse(JSON.stringify(currentTexts)));
  };

  const handleTextBlur = () => {
    if (focusedState) {
      const hasChanged = JSON.stringify(focusedState) !== JSON.stringify(extractedTexts);
      if (hasChanged) {
        setUndoStack(prev => [...prev, focusedState]);
        setRedoStack([]); // Clear redo stack
      }
      setFocusedState(null);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(extractedTexts))]);
    setExtractedTexts(previousState);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(extractedTexts))]);
    setExtractedTexts(nextState);
  };

  // Keyboard shortcuts listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, extractedTexts]);

  const handleDragStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Capture state BEFORE dragging
    const stateBefore = JSON.parse(JSON.stringify(extractedTexts));
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const item = extractedTexts.find(t => t.id === itemId);
    if (!item) return;
    
    const initialX = item.x;
    const initialY = item.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      setExtractedTexts(prev => prev.map(t => 
        t.id === itemId 
          ? { ...t, x: initialX + dx, y: initialY + dy, isModified: true } 
          : t
      ));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Save original state to undo stack
      setUndoStack(prev => [...prev, stateBefore]);
      setRedoStack([]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize2DStart = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Capture state BEFORE resizing
    const stateBefore = JSON.parse(JSON.stringify(extractedTexts));
    
    const startX = e.clientX;
    const startY = e.clientY;
    const item = extractedTexts.find(t => t.id === itemId);
    if (!item) return;
    
    const initialW = item.w;
    const initialH = item.h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      const newWidth = Math.max(20, initialW + dx);
      const newHeight = Math.max(10, initialH + dy);
      
      setExtractedTexts(prev => prev.map(t => 
        t.id === itemId 
          ? { 
              ...t, 
              w: newWidth, 
              h: newHeight, 
              pdfWidth: newWidth / 1.2, 
              pdfHeight: newHeight / 1.2, 
              isModified: true 
            } 
          : t
      ));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Save original state to undo stack
      setUndoStack(prev => [...prev, stateBefore]);
      setRedoStack([]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSaveEdits = async () => {
    if (typeof window === 'undefined' || !(window as any).sharedPdfBuffer) {
      alert('No active PDF file buffer found to save.');
      return;
    }

    try {
      const originalBuffer = (window as any).sharedPdfBuffer;
      const pdfDoc = await PDFDocument.load(originalBuffer);
      
      const pageIndex = currentPage - 1;
      const page = pdfDoc.getPage(pageIndex);
      
      // Read CropBox to align coordinates properly
      const cropBox = page.getCropBox();
      const offsetX = cropBox.x || 0;
      const offsetY = cropBox.y || 0;

      const modifiedTexts = extractedTexts.filter(t => t.isModified);
      
      if (modifiedTexts.length === 0) {
        alert('No text modifications detected on this page.');
        return;
      }

      // Load PDF.js viewport to calculate inverse coordinates
      const pdfjsPage = await pdfDocument.getPage(currentPage);
      const viewport = pdfjsPage.getViewport({ scale: 1.2 });

      for (const item of modifiedTexts) {
        // 1. Cover original text coordinates
        const originalCoverX = item.pdfX + offsetX;
        const originalCoverY = item.pdfY + offsetY - item.pdfHeight * 0.15;
        const originalCoverHeight = item.pdfHeight * 1.25;
        
        page.drawRectangle({
          x: originalCoverX,
          y: originalCoverY,
          width: item.pdfWidth,
          height: originalCoverHeight,
          color: rgb(1, 1, 1), // white
        });

        // 2. Cover new coordinates (if dragged or resized in 2D)
        const [newPdfX, newPdfYBottom] = viewport.convertToPdfPoint(item.x, item.y + item.h);
        const [, newPdfYTop] = viewport.convertToPdfPoint(item.x, item.y);
        const newPdfWidth = item.w / 1.2;
        const newPdfHeight = newPdfYTop - newPdfYBottom;

        const newCoverX = newPdfX + offsetX;
        const newCoverY = newPdfYBottom + offsetY;

        // Check if there was any drag or resize
        const hasMovedOrResized = Math.abs(item.x - item.pdfX * 1.2) > 2 || 
                                   Math.abs(item.y - (viewport.height - item.pdfY * 1.2 - item.pdfHeight * 1.2)) > 2 || 
                                   Math.abs(item.w - item.pdfWidth * 1.2) > 2 ||
                                   Math.abs(item.h - item.pdfHeight * 1.2) > 2;

        if (hasMovedOrResized) {
          page.drawRectangle({
            x: newCoverX,
            y: newCoverY,
            width: newPdfWidth,
            height: newPdfHeight,
            color: rgb(1, 1, 1), // white
          });
        }

        // Skip drawing text if it was deleted or cleared
        if (item.isDeleted || item.text.trim() === '') {
          continue;
        }

        // 3. Draw new text at its baseline Y position inside the box
        const scaledFontSize = item.fontSize * 1.2;
        const [, pdfBaselineY] = viewport.convertToPdfPoint(item.x, item.y + scaledFontSize);

        const drawX = newPdfX + offsetX;
        const drawY = pdfBaselineY + offsetY;

        // Embed the specific font style requested
        const fontName = item.fontDetails?.pdfFont || StandardFonts.Helvetica;
        const fontToUse = await pdfDoc.embedFont(fontName);

        // Parse color code (default to black)
        const { r, g, b } = hexToRgb(item.color || '#000000');

        // Draw the new text with original styling (with cropbox offset!)
        page.drawText(item.text, {
          x: drawX,
          y: drawY,
          size: item.fontSize,
          font: fontToUse,
          color: rgb(r, g, b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const updatedBuffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength);

      // Update global state
      (window as any).sharedPdfBuffer = updatedBuffer;
      (window as any).sharedFiles = [new File([pdfBytes as any], fileName || 'document.pdf', { type: 'application/pdf' })];

      // Trigger download
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${fileName || 'document.pdf'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Refresh page rendering
      const loadingTask = pdfjsLibInstance.getDocument({ data: updatedBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      
      // Reset modified states
      setExtractedTexts(prev => prev.map(t => ({ ...t, isModified: false, originalText: t.text })));
      
      alert('Edits saved successfully and downloaded!');
    } catch (error) {
      console.error('Error saving edits to PDF:', error);
      alert('Error saving edits. See console for details.');
    }
  };

  const renderBackgroundPage = async (pageNum: number) => {
    try {
      const page = await pdfDocument.getPage(pageNum);
      const canvas = bgCanvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: 1.2 });
      const outputScale = (window.devicePixelRatio || 1) * 2; // Super-Sampling 2x
      
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

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering background PDF page in editor:', err);
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
    setItems([]);
    setSelectedItemId(null);
    if (typeof window !== 'undefined') {
      (window as any).sharedOcrTextItems = null;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      if (typeof window !== 'undefined') {
        (window as any).sharedPdfBuffer = arrayBuffer;
        (window as any).sharedPdfName = file.name;
        (window as any).sharedFiles = [file];
      }
      await loadPdfFromBuffer(arrayBuffer);
    } catch (error) {
      console.error('Failed to load PDF file in editor:', error);
      alert('Failed to parse PDF file. Ensure it is a valid PDF document.');
      setFileLoaded(false);
    }
  };

  const seedSampleDoc = () => {
    setFileName('Commercial_Lease_Draft.pdf');
    setFileLoaded(true);
    setTotalPages(1);
    setCurrentPage(1);
    setItems([
      {
        id: '1',
        type: 'text',
        x: 80,
        y: 60,
        content: 'COMMERCIAL LEASE CONTRACT v1.2',
        color: '#0F172A',
        fontSize: 18,
        fontFamily: 'Outfit'
      },
      {
        id: '2',
        type: 'shape',
        subtype: 'rect',
        x: 75,
        y: 110,
        width: 480,
        height: 4,
        color: '#14B8A6'
      },
      {
        id: '3',
        type: 'comment',
        x: 520,
        y: 130,
        content: 'Should we double check the liability duration limit?',
        color: '#EAB308',
        replies: [
          { id: 'r1', user: 'Sarah J.', text: 'Good catch. We should limit it to 24 months.', date: 'Jun 18, 19:40' }
        ]
      }
    ]);

    setTimeout(() => {
      const canvas = bgCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        canvas.width = 650;
        canvas.height = 700;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(40, 150, 570, 200);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('LEASE AGREEMENT OVERVIEW', 60, 190);
        ctx.font = '14px Arial';
        ctx.fillText('This document details core vector edits.', 60, 230);
      }
    }, 100);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;
    
    // Clear selection if clicking on empty canvas space while in edit-pdf-text mode
    if (activeTool === 'edit-pdf-text') {
      setSelectedItemId(null);
      return;
    }

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'pencil') {
      setIsDrawing(true);
      setDrawPoints([{ x, y }]);
      return;
    }

    if (activeTool !== 'select') {
      const newItem: CanvasItem = {
        id: `item-${Date.now()}`,
        type: activeTool === 'text' ? 'text' : activeTool === 'comment' ? 'comment' : 'shape',
        subtype: activeTool === 'rect' ? 'rect' : activeTool === 'circle' ? 'circle' : activeTool === 'arrow' ? 'arrow' : activeTool === 'line' ? 'line' : undefined,
        x,
        y,
        width: activeTool === 'text' ? 150 : activeTool === 'comment' ? 36 : 100,
        height: activeTool === 'text' ? 30 : activeTool === 'comment' ? 36 : 80,
        content: activeTool === 'text' ? 'Double click to edit' : activeTool === 'comment' ? 'New comment query...' : undefined,
        color: currentColor,
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
        replies: activeTool === 'comment' ? [] : undefined
      };

      setItems([...items, newItem]);
      setSelectedItemId(newItem.id);
      setActiveTool('select');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || activeTool !== 'pencil' || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawPoints(prev => [...prev, { x, y }]);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && drawPoints.length > 1) {
      const newDrawing: CanvasItem = {
        id: `item-${Date.now()}`,
        type: 'drawing',
        x: drawPoints[0].x,
        y: drawPoints[0].y,
        color: currentColor,
        points: drawPoints
      };
      setItems([...items, newDrawing]);
    }
    setIsDrawing(false);
    setDrawPoints([]);
  };

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const updateSelectedElement = (id: string | null, updates: { color?: string; fontSize?: number; fontFamily?: string }) => {
    if (!id) return;
    
    if (updates.color !== undefined) setCurrentColor(updates.color);
    if (updates.fontSize !== undefined) setCurrentFontSize(updates.fontSize);
    if (updates.fontFamily !== undefined) setCurrentFontFamily(updates.fontFamily);

    if (id.startsWith('pdf-text-') || id.startsWith('ocr-text-')) {
      setExtractedTexts(prev => prev.map(t => {
        if (t.id !== id) return t;

        const updated: any = { ...t, isModified: true };
        if (updates.color !== undefined) {
          updated.color = updates.color;
        }
        if (updates.fontSize !== undefined) {
          updated.fontSize = updates.fontSize;
          updated.pdfHeight = updates.fontSize;
          updated.h = updates.fontSize * 1.2;
          const sizeRatio = updates.fontSize / (t.fontSize || 14);
          updated.w = t.w * sizeRatio;
          updated.pdfWidth = (t.w * sizeRatio) / 1.2;
        }
        if (updates.fontFamily !== undefined) {
          const isBold = t.fontDetails?.cssWeight === 'bold';
          const isItalic = t.fontDetails?.cssStyle === 'italic';
          updated.fontDetails = getUpdatedFontDetails(updates.fontFamily, isBold, isItalic);
        }
        return updated;
      }));
    } else {
      setItems(items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item };
        if (updates.color !== undefined) updated.color = updates.color;
        if (updates.fontSize !== undefined) updated.fontSize = updates.fontSize;
        if (updates.fontFamily !== undefined) updated.fontFamily = updates.fontFamily;
        return updated;
      }));
    }
  };

  const deleteItem = (id: string) => {
    if (id.startsWith('pdf-text-')) {
      // Save state to undo stack before deleting
      setUndoStack(prev => [...prev, JSON.parse(JSON.stringify(extractedTexts))]);
      setRedoStack([]);

      setExtractedTexts(prev => prev.map(t => 
        t.id === id ? { ...t, text: '', isModified: true, isDeleted: true } : t
      ));
    } else {
      setItems(items.filter(item => item.id !== id));
    }
    setSelectedItemId(null);
  };

  const addCommentReply = (commentId: string) => {
    if (!commentReplyText.trim()) return;
    const reply = {
      id: `rep-${Date.now()}`,
      user: 'You',
      text: commentReplyText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const comment = items.find(i => i.id === commentId);
    if (comment && comment.replies) {
      updateItem(commentId, { replies: [...comment.replies, reply] });
    }
    setCommentReplyText('');
  };

  const selectedItem = items.find(i => i.id === selectedItemId) || 
                       extractedTexts.find(t => t.id === selectedItemId);

  return (
    <div className="space-y-6 animate-slide-up h-[calc(100vh-140px)] flex flex-col justify-between">
      
      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Pen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold truncate max-w-xs md:max-w-md">
                {fileLoaded ? fileName : 'Workspace Empty'}
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
              {fileLoaded ? `Page ${currentPage} of ${totalPages}` : 'Open a PDF file to begin annotations'}
            </p>
          </div>
        </div>

        {fileLoaded && (
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Color picker */}
            <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-850 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
              <Palette className="h-3.5 w-3.5 text-slate-450" />
              {['#2563EB', '#0F172A', '#14B8A6', '#EF4444', '#EAB308', '#8B2635'].map(color => (
                <button 
                  key={color} 
                  onClick={() => {
                    setCurrentColor(color);
                    updateSelectedElement(selectedItemId, { color });
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${currentColor === color ? 'ring-2 ring-primary border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              {/* Custom native color picker */}
              <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-350 dark:border-slate-700 cursor-pointer flex items-center justify-center" title="Pick custom color">
                <input 
                  type="color"
                  value={currentColor}
                  onChange={(e) => {
                    const color = e.target.value;
                    setCurrentColor(color);
                    updateSelectedElement(selectedItemId, { color });
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-full h-full" style={{ backgroundColor: currentColor }} />
              </div>
            </div>

            {/* Font Family Selector */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 p-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
              <select 
                value={currentFontFamily} 
                onChange={(e) => {
                  const family = e.target.value;
                  setCurrentFontFamily(family);
                  updateSelectedElement(selectedItemId, { fontFamily: family });
                }}
                className="bg-transparent border-0 outline-none text-[11px] font-bold"
              >
                {['Helvetica', 'Times-Roman', 'Courier'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Font Size Selector */}
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 p-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
              <select 
                value={currentFontSize} 
                onChange={(e) => {
                  const size = Number(e.target.value);
                  setCurrentFontSize(size);
                  updateSelectedElement(selectedItemId, { fontSize: size });
                }}
                className="bg-transparent border-0 outline-none text-[11px] font-bold"
              >
                {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button 
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold disabled:opacity-40 disabled:hover:bg-transparent text-slate-550 hover:text-primary transition-colors flex items-center justify-center"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4.5 w-4.5" />
            </button>

            <button 
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold disabled:opacity-40 disabled:hover:bg-transparent text-slate-550 hover:text-primary transition-colors flex items-center justify-center"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4.5 w-4.5" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <button 
              onClick={handleSaveEdits}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              Save Edits
            </button>
          </div>
        )}
      </div>

      {/* Workspace Area */}
      {!fileLoaded ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 bg-white dark:bg-secondary/20">
          <div className="bg-primary/10 p-5 rounded-3xl text-primary mb-6 animate-pulse-slow">
            <Pen className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold font-display">Vector Annotator Workspace</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm text-center mb-8">
            Upload contract PDFs to draw markup shapes, overlay text, and place Sticky notes.
          </p>

          <div className="flex gap-4">
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
              onClick={seedSampleDoc}
              className="px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary rounded-xl text-xs font-bold transition-all"
            >
              Load Commercial Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Toolbar panel */}
          <div className="glass-panel p-2.5 rounded-2xl bg-white dark:bg-secondary flex flex-col items-center gap-2 h-fit">
            {[
              { id: 'select', icon: <MousePointer className="h-4 w-4" />, label: 'Select' },
              { id: 'edit-pdf-text', icon: <FileText className="h-4 w-4" />, label: 'Edit PDF Text' },
              { id: 'text', icon: <Type className="h-4 w-4" />, label: 'Add Text' },
              { id: 'pencil', icon: <Pen className="h-4 w-4" />, label: 'Draw' },
              { id: 'rect', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
              { id: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
              { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
              { id: 'line', icon: <Minus className="h-4 w-4" />, label: 'Line' },
              { id: 'comment', icon: <MessageSquare className="h-4 w-4" />, label: 'Note' }
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className={`p-3 rounded-xl transition-all ${activeTool === tool.id ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-secondary-light text-slate-550'}`}
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>

          {/* Interactive Document Sheet Canvas */}
          <div 
            ref={canvasContainerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="flex-1 border border-slate-200 dark:border-slate-850 rounded-3xl bg-slate-100 dark:bg-slate-900 overflow-auto relative shadow-inner cursor-crosshair min-h-[500px] flex justify-center p-6"
          >
            {/* Draw overlay canvas path */}
            {isDrawing && drawPoints.length > 1 && (
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-15">
                <polyline 
                  fill="none" 
                  stroke={currentColor} 
                  strokeWidth="3" 
                  points={drawPoints.map(p => `${p.x},${p.y}`).join(' ')} 
                />
              </svg>
            )}

            {/* Background PDF page canvas */}
            <div className="relative shadow-2xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-secondary self-start">
              <canvas ref={bgCanvasRef} className="block" />
              
              {/* White background masks to hide original PDF text on screen when edited/focused */}
              {extractedTexts.map((textItem) => {
                if (textItem.isDeleted) return null;
                const shouldMask = textItem.isModified || selectedItemId === textItem.id;
                if (!shouldMask) return null;
                
                return (
                  <div
                    key={`mask-${textItem.id}`}
                    style={{
                      position: 'absolute',
                      left: `${textItem.originalX}px`,
                      top: `${textItem.originalY}px`,
                      width: `${textItem.originalW}px`,
                      height: `${textItem.originalH}px`,
                      backgroundColor: '#ffffff',
                      zIndex: 18,
                      pointerEvents: 'none'
                    }}
                  />
                );
              })}
            {/* Interactive PDF Text Overlay Layer */}
              {extractedTexts.map((textItem) => {
                if (textItem.isDeleted) return null;

                const isEditing = selectedItemId === textItem.id;
                const isModified = textItem.isModified;
                const isOcrSource = textItem.id.startsWith('ocr-text-');
                
                const fontFamily = textItem.fontDetails?.cssFamily || 'inherit';
                const fontWeight = textItem.fontDetails?.cssWeight || 'normal';
                const fontStyle = textItem.fontDetails?.cssStyle || 'normal';
                const isEditMode = activeTool === 'edit-pdf-text';
                
                return (
                  <div
                    key={textItem.id}
                    style={{
                      position: 'absolute',
                      left: `${textItem.x}px`,
                      top: `${textItem.y}px`,
                      width: `${Math.max(textItem.w, 40)}px`,
                      height: `${Math.max(textItem.h, 16)}px`,
                      fontSize: `${textItem.fontSize * 1.2}px`, // scaled to viewport scale (1.2)
                      fontFamily,
                      fontWeight,
                      fontStyle,
                      color: (isEditing || isModified) ? (textItem.color || '#000000') : 'transparent',
                      overflow: 'visible',
                    }}
                    className={`group select-text ${
                      isEditing
                        ? 'z-30 ring-2 ring-primary bg-transparent border border-slate-300'
                        : isModified
                          ? 'z-20 bg-transparent border border-dashed border-green-555'
                          : isEditMode
                            ? 'z-10 border border-transparent hover:border-dashed hover:border-blue-400 bg-transparent text-transparent hover:bg-blue-400/5 cursor-text'
                            : 'z-10 hover:border hover:border-dashed hover:border-blue-400/40 bg-transparent text-transparent hover:bg-slate-100/5 cursor-text'
                    } ${isEditMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(textItem.id);

                      const itemColor = textItem.color || '#000000';
                      const itemFontSize = textItem.fontSize || 14;
                      
                      let itemFontFamily = 'Helvetica';
                      if (textItem.fontDetails?.pdfFont) {
                        const fontName = textItem.fontDetails.pdfFont.toLowerCase();
                        if (fontName.includes('times')) {
                          itemFontFamily = 'Times-Roman';
                        } else if (fontName.includes('courier')) {
                          itemFontFamily = 'Courier';
                        }
                      } else {
                        itemFontFamily = currentFontFamily;
                      }

                      setCurrentColor(itemColor);
                      setCurrentFontSize(itemFontSize);
                      setCurrentFontFamily(itemFontFamily);

                      setExtractedTexts(prev => prev.map(t => 
                        t.id === textItem.id 
                          ? { 
                              ...t, 
                              color: itemColor, 
                              fontSize: itemFontSize,
                              fontDetails: t.fontDetails || getUpdatedFontDetails(itemFontFamily, t.fontDetails?.cssWeight === 'bold', t.fontDetails?.cssStyle === 'italic')
                            } 
                          : t
                      ));
                    }}
                  >
                    {isEditing && (
                      <button
                        onMouseDown={(e) => handleDragStart(e, textItem.id)}
                        className="absolute left-[-22px] top-0 bottom-0 w-5 flex items-center justify-center cursor-move text-slate-400 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-l"
                        title="Drag to reposition text"
                      >
                        <Move className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <input
                      type="text"
                      value={textItem.text}
                      onFocus={() => handleTextFocus(extractedTexts)}
                      onBlur={handleTextBlur}
                      onChange={(e) => updateExtractedText(textItem.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none p-0 m-0 text-inherit font-inherit"
                      style={{
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        fontWeight: 'inherit',
                        fontStyle: 'inherit',
                        color: 'inherit',
                      }}
                    />

                    {isEditing && (
                      <div
                        onMouseDown={(e) => handleResize2DStart(e, textItem.id)}
                        className="absolute right-[-4px] bottom-[-4px] w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize hover:scale-125 transition-transform z-45 flex items-center justify-center"
                        title="Drag corner to crop/resize in 2D"
                      >
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Interactive Vector Objects overlay loop */}
              {items.map((item) => {
                const active = selectedItemId === item.id;
                
                if (item.type === 'drawing' && item.points) {
                  return (
                    <svg key={item.id} className="absolute inset-0 pointer-events-none w-full h-full z-15">
                      <polyline 
                        fill="none" 
                        stroke={item.color} 
                        strokeWidth="3" 
                        points={item.points.map(p => `${p.x},${p.y}`).join(' ')} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                        }}
                        className="pointer-events-auto cursor-pointer"
                      />
                    </svg>
                  );
                }

                return (
                  <div 
                    key={item.id}
                    style={{ left: item.x, top: item.y }}
                    onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
                    className={`absolute z-20 transition-all ${
                      active ? 'ring-2 ring-primary border border-white' : ''
                    }`}
                  >
                    {item.type === 'text' && (
                      <input 
                        type="text" 
                        value={item.content}
                        onChange={(e) => updateItem(item.id, { content: e.target.value })}
                        style={{ 
                          color: item.color, 
                          fontSize: item.fontSize,
                          fontFamily: item.fontFamily === 'Outfit' ? 'Outfit' : 'Inter'
                        }}
                        className="bg-transparent border-0 outline-none font-bold py-1 px-2 resize w-60"
                      />
                    )}

                    {item.type === 'shape' && item.subtype === 'rect' && (
                      <div 
                        style={{ 
                          width: item.width || 100, 
                          height: item.height || 80, 
                          borderColor: item.color,
                          borderWidth: 3
                        }}
                        className="rounded"
                      />
                    )}

                    {item.type === 'shape' && item.subtype === 'circle' && (
                      <div 
                        style={{ 
                          width: item.width || 80, 
                          height: item.width || 80, 
                          borderColor: item.color,
                          borderWidth: 3
                        }}
                        className="rounded-full"
                      />
                    )}

                    {item.type === 'comment' && (
                      <div 
                        style={{ backgroundColor: item.color }}
                        className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform font-bold text-xs"
                        title={item.content}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination controls inside editor */}
            {totalPages > 1 && (
              <div className="absolute bottom-4 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-xl flex items-center gap-3 shadow-lg z-10 text-xs">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="font-semibold">Page {currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Properties sidebar panel */}
          {selectedItem && (
            <div className="w-80 flex flex-col gap-4 overflow-y-auto">
              
              {/* Properties Box */}
              <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-secondary space-y-4">
                <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  Object Properties
                </h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <span className="text-xs block font-bold capitalize">{selectedItem.type} {selectedItem.subtype || ''}</span>
                </div>

                <button 
                  onClick={() => deleteItem(selectedItem.id)}
                  className="w-full py-2 bg-red-50 hover:bg-red-150 text-red-650 dark:bg-red-950/20 dark:hover:bg-red-900/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  Delete Object
                </button>
              </div>

              {/* Comments Thread */}
              {selectedItem.type === 'comment' && selectedItem.replies && (
                <div className="glass-panel p-5 rounded-2xl bg-white dark:bg-secondary flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                      Review Comments
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-400">Main Note</span>
                      <p className="text-xs font-semibold mt-1 bg-slate-50 dark:bg-secondary-light/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {selectedItem.content}
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {selectedItem.replies.map((rep: any) => (
                        <div key={rep.id} className="text-[11px] space-y-0.5 pl-3 border-l-2 border-primary/20">
                          <div className="flex justify-between items-center text-slate-400">
                            <span className="font-bold text-primary">{rep.user}</span>
                            <span>{rep.date}</span>
                          </div>
                          <p className="text-slate-650 dark:text-slate-350 font-semibold">{rep.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <textarea 
                      placeholder="Type reply thread..."
                      value={commentReplyText}
                      onChange={(e) => setCommentReplyText(e.target.value)}
                      className="w-full p-2.5 bg-slate-100 dark:bg-secondary-light rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary h-16 resize-none"
                    />
                    <button 
                      onClick={() => addCommentReply(selectedItem.id)}
                      className="w-full py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-[10px] font-bold transition-all"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
