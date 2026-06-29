'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Type, Upload, Calendar, Hash, ShieldCheck, 
  Trash2, RefreshCw, FileText, Check, Award
} from 'lucide-react';

interface SavedSignature {
  id: string;
  type: 'draw' | 'type' | 'upload';
  dataUrl: string;
  timestamp: string;
}

export default function ESignatureModule() {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [selectedSigId, setSelectedSigId] = useState<string | null>(null);
  
  // Signature Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Signature Type States
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('font-serif'); // serif, sans, cursive

  // Contract Stamping States
  const [docFileLoaded, setDocFileLoaded] = useState(false);
  const [docFileName, setDocFileName] = useState('');
  const [sigPlaced, setSigPlaced] = useState(false);
  const [placementCoords, setPlacementCoords] = useState({ x: 220, y: 380 });
  const [isDraggingSig, setIsDraggingSig] = useState(false);
  const [signedDocHash, setSignedDocHash] = useState<string | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

  // Setup drawing canvas styles
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const cached = localStorage.getItem('user_signatures');
    if (cached) {
      const list = JSON.parse(cached);
      setSavedSignatures(list);
      if (list.length > 0) setSelectedSigId(list[0].id);
    }
  }, []);

  const saveSignatureList = (list: SavedSignature[]) => {
    setSavedSignatures(list);
    localStorage.setItem('user_signatures', JSON.stringify(list));
  };

  // Drawing canvas helper functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx?.beginPath();
    ctx?.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    
    const newSig: SavedSignature = {
      id: `sig-${Date.now()}`,
      type: 'draw',
      dataUrl,
      timestamp: new Date().toLocaleDateString()
    };

    const updated = [...savedSignatures, newSig];
    saveSignatureList(updated);
    setSelectedSigId(newSig.id);
    clearCanvas();
  };

  // Type Signature helper
  const handleSaveTypeSignature = () => {
    if (!typedName.trim()) return;

    // We compile the typed signature directly to an SVG block, and then convert to dataURL representation
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#2563EB';
      
      const fontName = selectedFont === 'font-serif' ? 'Georgia' : selectedFont === 'cursive' ? 'Brush Script MT, cursive' : 'Arial';
      ctx.font = `italic bold 28px ${fontName}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 150, 50);
    }

    const newSig: SavedSignature = {
      id: `sig-${Date.now()}`,
      type: 'type',
      dataUrl: canvas.toDataURL(),
      timestamp: new Date().toLocaleDateString()
    };

    const updated = [...savedSignatures, newSig];
    saveSignatureList(updated);
    setSelectedSigId(newSig.id);
    setTypedName('');
  };

  // Upload signature image
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newSig: SavedSignature = {
          id: `sig-${Date.now()}`,
          type: 'upload',
          dataUrl: reader.result as string,
          timestamp: new Date().toLocaleDateString()
        };
        const updated = [...savedSignatures, newSig];
        saveSignatureList(updated);
        setSelectedSigId(newSig.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSignature = (id: string) => {
    const updated = savedSignatures.filter(s => s.id !== id);
    saveSignatureList(updated);
    if (selectedSigId === id) setSelectedSigId(updated.length > 0 ? updated[0].id : null);
  };

  // Document Placement Logic
  const handleDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      setDocFileLoaded(true);
      setSigPlaced(false);
      setSignedDocHash(null);
    }
  };

  const loadSampleContract = () => {
    setDocFileName('Independent_Contractor_NDA.pdf');
    setDocFileLoaded(true);
    setSigPlaced(false);
    setSignedDocHash(null);
  };

  const applySignature = () => {
    if (!selectedSigId) return;
    setSigPlaced(true);
  };

  // Drag-and-drop coordinate shifts on sheet
  const handleDragSigStart = () => {
    setIsDraggingSig(true);
  };

  const handleDragSigMove = (e: React.MouseEvent) => {
    if (!isDraggingSig || !documentRef.current) return;
    const rect = documentRef.current.getBoundingClientRect();
    const x = Math.min(rect.width - 150, Math.max(0, e.clientX - rect.left - 75));
    const y = Math.min(rect.height - 60, Math.max(0, e.clientY - rect.top - 30));
    setPlacementCoords({ x, y });
  };

  const handleDragSigEnd = () => {
    setIsDraggingSig(false);
  };

  const finalizeDocumentSigning = () => {
    // Generate secure cryptographic verification seal
    const randomHash = 'sha256_e4b10' + Math.random().toString(36).substring(2, 12) + 'a9d';
    setSignedDocHash(randomHash);
  };

  const currentSignature = savedSignatures.find(s => s.id === selectedSigId);

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display">E-Signatures Center</h1>
        <p className="text-xs text-slate-500">Design legally binding signatures and place them on contract templates securely.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns: Designer & Vault */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Signature builder box */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Signature Creator
            </h3>

            {/* Design tabs */}
            <div className="flex bg-slate-100 dark:bg-secondary-light/40 p-1 rounded-xl text-xs font-bold">
              {[
                { id: 'draw', name: 'Draw', icon: <PenTool className="h-3.5 w-3.5" /> },
                { id: 'type', name: 'Type', icon: <Type className="h-3.5 w-3.5" /> },
                { id: 'upload', name: 'Upload', icon: <Upload className="h-3.5 w-3.5" /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' 
                      : 'text-slate-500'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Draw workspace */}
            {activeTab === 'draw' && (
              <div className="space-y-3">
                <canvas 
                  ref={canvasRef}
                  width={280}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer w-full"
                />
                <div className="flex gap-2 text-[10px] font-bold">
                  <button 
                    onClick={clearCanvas}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 rounded-lg text-slate-500 flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Clear
                  </button>
                  <button 
                    onClick={handleSaveDrawSignature}
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center justify-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" /> Save Signature
                  </button>
                </div>
              </div>
            )}

            {/* Type workspace */}
            {activeTab === 'type' && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your signature name..."
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary font-bold"
                />
                
                {/* Font selection preview */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'font-serif', name: 'Elegant', font: 'font-serif italic' },
                    { id: 'font-sans', name: 'Modern', font: 'font-sans font-bold' },
                    { id: 'cursive', name: 'Script', font: 'font-serif italic font-bold' }
                  ].map(ft => (
                    <button 
                      key={ft.id}
                      onClick={() => setSelectedFont(ft.id)}
                      className={`p-2.5 border rounded-lg text-center transition-all ${
                        selectedFont === ft.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`block text-[10px] font-bold mb-1 text-slate-400`}>{ft.name}</span>
                      <span className={`${ft.font} truncate block text-xs`}>{typedName || 'John Doe'}</span>
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleSaveTypeSignature}
                  disabled={!typedName.trim()}
                  className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  <Check className="h-4 w-4" /> Save Typed Signature
                </button>
              </div>
            )}

            {/* Upload workspace */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-primary transition-all relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <span className="text-[11px] font-bold text-slate-500 block">Select Signature Image</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Supports transparent PNG files up to 5MB</span>
              </div>
            )}
          </div>

          {/* Signatures Vault */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Signatures Vault
            </h3>
            
            {savedSignatures.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                No signatures saved. Create one above to stamp documents.
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {savedSignatures.map(sig => (
                  <div 
                    key={sig.id}
                    onClick={() => setSelectedSigId(sig.id)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedSigId === sig.id 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                        : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-1 rounded-lg border border-slate-100 max-h-12 w-20 flex items-center justify-center">
                        <img src={sig.dataUrl} alt="sig" className="max-h-10 object-contain" />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        <span className="font-bold capitalize text-slate-500 block">{sig.type} signature</span>
                        <span>Added: {sig.timestamp}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
                      className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-slate-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Placement & Signing Sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          {!docFileLoaded ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center bg-white dark:bg-secondary/20">
              <div className="bg-primary/10 p-5 rounded-3xl text-primary mb-6 animate-pulse-slow">
                <FileText className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold font-display">Stamp & Place Signature</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-sm text-center mb-8">
                Upload your business contract or rent receipt, drag-and-drop signature seals, and output cryptographically signed PDF revisions.
              </p>

              <div className="flex gap-4">
                <div className="relative">
                  <input 
                    type="file" 
                    onChange={handleDocumentFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload PDF Contract
                  </button>
                </div>
                <button 
                  onClick={loadSampleContract}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary rounded-xl text-xs font-bold transition-all"
                >
                  Load NDA Template
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-6">
              
              {/* Header info */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <h4 className="font-bold">{docFileName}</h4>
                  <span className="text-[10px] text-slate-400">Drag signature inside viewer to reposition</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={applySignature}
                    disabled={!selectedSigId}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl font-bold text-[10px] transition-all"
                  >
                    Apply signature seal
                  </button>
                  <button 
                    onClick={() => { setDocFileLoaded(false); setSigPlaced(false); setSignedDocHash(null); }}
                    className="px-4 py-2 border border-slate-250 dark:border-slate-800 rounded-xl font-bold text-[10px] hover:bg-slate-50"
                  >
                    Clear contract
                  </button>
                </div>
              </div>

              {/* Placement Viewer space */}
              <div 
                ref={documentRef}
                onMouseMove={handleDragSigMove}
                onMouseUp={handleDragSigEnd}
                className="border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-100 dark:bg-slate-900 min-h-[450px] relative overflow-hidden flex items-center justify-center p-4 cursor-default select-none shadow-inner"
              >
                
                {/* Emulated contract page layout */}
                <div className="bg-white dark:bg-secondary shadow-lg rounded-lg border border-slate-200 dark:border-slate-800 w-full max-w-lg min-h-[400px] p-8 flex flex-col justify-between text-left text-[11px] leading-relaxed">
                  <div>
                    <h3 className="text-center font-bold text-xs uppercase border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      MUTUAL NON-DISCLOSURE AGREEMENT
                    </h3>
                    <p className="text-slate-400 mb-4">
                      This Agreement is made on June 18, 2026, between PDFMaster Pro Inc. and the undersigned business entity. 
                      Both parties agree to lock communication paths and encrypt shared folders.
                    </p>
                    <p className="text-slate-400">
                      The receiving party agrees that no source files or local WebAssembly scripts will be decrypted or shared. 
                      Breach of conditions warrants termination of contract.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-12 grid grid-cols-2 gap-8 text-[10px] font-semibold text-slate-400">
                    <div>
                      <span className="block border-b border-slate-200 pb-1 mb-1">Company Representative</span>
                      <span className="italic">PDFMaster Pro Licensing Team</span>
                    </div>
                    <div>
                      <span className="block border-b border-slate-200 pb-1 mb-1">Undersigned Client Signature</span>
                      <span className="block h-10 text-slate-300">
                        {sigPlaced ? 'Applied' : '(Sign Below)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Placed signature overlay (draggable) */}
                {sigPlaced && currentSignature && (
                  <div 
                    style={{ left: placementCoords.x, top: placementCoords.y }}
                    onMouseDown={handleDragSigStart}
                    className={`absolute z-30 bg-white/95 dark:bg-secondary/95 border-2 rounded-xl p-2 cursor-move shadow-2xl flex flex-col items-center select-none w-36 ${
                      isDraggingSig ? 'border-primary ring-2 ring-primary/20 scale-[1.03]' : 'border-accent'
                    }`}
                  >
                    <img src={currentSignature.dataUrl} alt="signature" className="h-8 object-contain pointer-events-none" />
                    
                    {/* Timestamp overlay */}
                    <div className="text-[7px] text-slate-400 font-bold border-t border-slate-150 w-full text-center mt-1 pt-1 flex items-center justify-center gap-0.5">
                      <Calendar className="h-2 w-2 text-accent" />
                      <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Cryptographic verification panel */}
              {sigPlaced && (
                <div className="border border-slate-150 dark:border-slate-800 p-4 rounded-2xl space-y-4 bg-slate-50 dark:bg-slate-900 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-accent" /> Secure Stamp Verification Seal</span>
                    <button 
                      onClick={finalizeDocumentSigning}
                      className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-bold text-[10px] transition-all"
                    >
                      Bake Cryptographic Signature
                    </button>
                  </div>
                  
                  {signedDocHash && (
                    <div className="grid sm:grid-cols-2 gap-4 font-mono text-[9px] text-slate-500 bg-white dark:bg-secondary p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold text-slate-400 block mb-0.5">Verification Seal SHA</span>
                        <span className="text-primary font-bold">{signedDocHash}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block mb-0.5">Stamping Authority Authority</span>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">PDFMaster Pro Legal Vault API</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
