'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Merge, Scissors, Minimize2, Type, Upload, FileText, 
  Trash2, Download, CheckCircle, RefreshCw, Layers
} from 'lucide-react';

function UtilityToolsContent() {
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState<'merge' | 'split' | 'compress' | 'watermark'>('merge');

  // Multi-tool file lists
  const [fileList, setFileList] = useState<File[]>([]);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  
  // Custom tool parameters
  const [splitRange, setSplitRange] = useState('1-2, 3');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [targetSizeKb, setTargetSizeKb] = useState<number>(0);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [watermarkColor, setWatermarkColor] = useState('red');

  // Execution states
  const [processing, setProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{ name: string; path: string; size: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const API_BASE = 'http://localhost:5000/api/utility';

  useEffect(() => {
    const tool = searchParams.get('tool') as 'merge' | 'split' | 'compress' | 'watermark' | null;
    if (tool) {
      setActiveTool(tool);
      setOutputFile(null);
      setErrorMsg('');
    }
  }, [searchParams]);

  // Load carry over files on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const globFiles = (window as any).sharedFiles as File[];
      const hasBuffer = (window as any).sharedPdfBuffer && (window as any).sharedPdfName;

      if (hasBuffer) {
        const buffer = (window as any).sharedPdfBuffer;
        const name = (window as any).sharedPdfName;
        try {
          const f = new File([new Uint8Array(buffer)], name, { type: 'application/pdf' });
          setSingleFile(f);
          setFileList([f]);
          const kb = Math.round(f.size / 1024);
          setTargetSizeKb(Math.round(kb * 0.7));
        } catch (e) {
          console.error('Failed to reconstruct file on mount in Utilities:', e);
        }
      } else if (globFiles && globFiles.length > 0) {
        setFileList(globFiles);
        setSingleFile(globFiles[0]);
        const kb = Math.round(globFiles[0].size / 1024);
        setTargetSizeKb(Math.round(kb * 0.7));
      }
    }
  }, []);

  // Sync changes in singleFile to global window variables
  useEffect(() => {
    if (typeof window !== 'undefined' && singleFile) {
      (window as any).sharedFiles = [singleFile];
      (window as any).sharedPdfName = singleFile.name;
      singleFile.arrayBuffer().then(buf => {
        (window as any).sharedPdfBuffer = buf;
      }).catch(err => console.error('Error syncing single file buffer:', err));
    }
  }, [singleFile]);

  // Sync changes in fileList to global window variables
  useEffect(() => {
    if (typeof window !== 'undefined' && fileList.length > 0) {
      (window as any).sharedFiles = fileList;
      const firstPdf = fileList.find(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (firstPdf) {
        (window as any).sharedPdfName = firstPdf.name;
        firstPdf.arrayBuffer().then(buf => {
          (window as any).sharedPdfBuffer = buf;
        }).catch(err => console.error('Error syncing file list buffer:', err));
      }
    }
  }, [fileList]);

  const clearInputs = () => {
    setFileList([]);
    setSingleFile(null);
    setOutputFile(null);
    setErrorMsg('');
    if (typeof window !== 'undefined') {
      (window as any).sharedFiles = [];
      (window as any).sharedPdfBuffer = null;
      (window as any).sharedPdfName = null;
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected) {
      const selectedArray = Array.from(selected);
      setFileList(prev => {
        const updated = [...prev, ...selectedArray];
        if (!singleFile && updated.length > 0) {
          setSingleFile(updated[0]);
          const kb = Math.round(updated[0].size / 1024);
          setTargetSizeKb(Math.round(kb * 0.7));
        }
        return updated;
      });
      setOutputFile(null);
      setErrorMsg('');
    }
  };

  const handleSingleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setSingleFile(selected);
      setFileList([selected]);
      setOutputFile(null);
      setErrorMsg('');
      const kb = Math.round(selected.size / 1024);
      setTargetSizeKb(Math.round(kb * 0.7));
    }
  };

  // Perform actual API requests to the Express backend
  const handleExecute = async () => {
    setProcessing(true);
    setOutputFile(null);
    setErrorMsg('');

    const token = localStorage.getItem('token') || 'mock-user-jwt-token';
    const formData = new FormData();

    try {
      let endpoint = '';
      
      if (activeTool === 'merge') {
        if (fileList.length < 2) {
          setErrorMsg('Please select at least two PDF files to merge.');
          setProcessing(false);
          return;
        }
        endpoint = `${API_BASE}/merge`;
        fileList.forEach(file => formData.append('files', file));
      } else {
        if (!singleFile) {
          setErrorMsg('Please select a PDF file to process.');
          setProcessing(false);
          return;
        }
        formData.append('file', singleFile);

        if (activeTool === 'split') {
          endpoint = `${API_BASE}/split`;
          formData.append('ranges', splitRange);
        } else if (activeTool === 'compress') {
          endpoint = `${API_BASE}/compress`;
          formData.append('compressionLevel', compressLevel);
          formData.append('targetSizeKb', targetSizeKb.toString());
        } else if (activeTool === 'watermark') {
          endpoint = `${API_BASE}/watermark`;
          formData.append('text', watermarkText);
          formData.append('opacity', (watermarkOpacity / 100).toString());
          formData.append('size', '40');
          formData.append('color', watermarkColor);
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server processing failed.');
      }

      const result = await response.json();
      
      // Setup output representation
      if (activeTool === 'split' && result.parts && result.parts.length > 0) {
        // For splits, default download the first split part
        setOutputFile({
          name: result.parts[0].filename,
          path: result.parts[0].path,
          size: `${(result.parts[0].size / 1024).toFixed(1)} KB`
        });
      } else {
        setOutputFile({
          name: result.filename,
          path: result.outputPath,
          size: result.compressedSize 
            ? `${(result.compressedSize / (1024 * 1024)).toFixed(2)} MB` 
            : `${(result.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }

      // Reconstruct the processed output PDF and carry it over to other tabs/pages
      const outPath = activeTool === 'split' ? result.parts?.[0]?.path : result.outputPath;
      const outName = activeTool === 'split' ? result.parts?.[0]?.filename : result.filename;
      if (outPath && outName) {
        const downloadUrl = `${API_BASE}/download?path=${encodeURIComponent(outPath)}`;
        try {
          const res = await fetch(downloadUrl);
          if (res.ok) {
            const blob = await res.blob();
            const finalFile = new File([blob], outName, { type: 'application/pdf' });
            setSingleFile(finalFile);
            setFileList([finalFile]);
            
            if (typeof window !== 'undefined') {
              (window as any).sharedFiles = [finalFile];
              (window as any).sharedPdfName = outName;
              const arrayBuf = await blob.arrayBuffer();
              (window as any).sharedPdfBuffer = arrayBuf;
            }
          }
        } catch (fetchErr) {
          console.error('Failed to carry over output file:', fetchErr);
        }
      }
    } catch (err: any) {
      console.error('Utility execution error:', err);
      setErrorMsg(err.message || 'Failed to connect to backend service. Ensure launcher script console is running.');
    } finally {
      setProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!outputFile) return;
    // Download via backend download route
    const downloadUrl = `${API_BASE}/download?path=${encodeURIComponent(outputFile.path)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black font-display text-slate-800 dark:text-slate-100">PDF Utility Toolkit</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">Perform real PDF merges, page splitting, compression levels, and watermark overlays via backend services.</p>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Tool Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tool tab selection */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-secondary-light/40 p-2 rounded-xl text-sm font-extrabold w-fit gap-1 shadow-sm">
            {[
              { id: 'merge', name: 'Merge PDFs', icon: <Merge className="h-4 w-4" /> },
              { id: 'split', name: 'Split Pages', icon: <Scissors className="h-4 w-4" /> },
              { id: 'compress', name: 'Compress Size', icon: <Minimize2 className="h-4 w-4" /> },
              { id: 'watermark', name: 'Watermark PDF', icon: <Type className="h-4 w-4" /> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTool(tab.id as any);
                  setOutputFile(null);
                  setErrorMsg('');
                }}
                className={`px-5 py-3 rounded-lg transition-all flex items-center gap-2 text-sm font-black ${activeTool === tab.id ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-650 dark:text-red-400 font-extrabold">
              {errorMsg}
            </div>
          )}

          {/* Merge PDF Panel */}
          {activeTool === 'merge' && (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-primary p-8 rounded-2xl text-center relative cursor-pointer">
                <input 
                  type="file" 
                  multiple
                  onChange={handleMultipleFiles}
                  accept="application/pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3 animate-bounce" />
                <span className="text-base font-extrabold text-slate-600 block">Select PDF files to Merge</span>
                <span className="text-xs text-slate-450 block mt-1 font-semibold">Select multiple PDF documents to join together.</span>
              </div>

              {/* Uploaded Files list */}
              {fileList.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-450 uppercase tracking-widest block mb-2">Merge Queue</span>
                  {fileList.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-secondary-light/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm font-extrabold">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">{idx + 1}</span>
                        <span className="truncate max-w-[220px]">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-450">
                        <span>{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <button 
                          onClick={() => setFileList(fileList.filter((_, i) => i !== idx))}
                          className="p-1 hover:text-red-550 transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={handleExecute}
                    disabled={processing}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all mt-4"
                  >
                    {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
                    {processing ? 'Processing PDF Merge...' : 'Merge PDF Files'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Split Pages panel */}
          {activeTool === 'split' && (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
              {!singleFile ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-855 hover:border-primary p-8 rounded-2xl text-center relative cursor-pointer">
                  <input type="file" onChange={handleSingleFile} accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <span className="text-base font-extrabold text-slate-600 block">Select PDF to Split</span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-sm font-extrabold">
                    <span className="truncate max-w-[240px] text-slate-800 dark:text-slate-100">{singleFile.name}</span>
                    <button onClick={clearInputs} className="text-red-500 hover:underline transition-all">Clear</button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-450 uppercase tracking-widest block">Page Range Selection</label>
                    <input 
                      type="text" 
                      value={splitRange} 
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1-2, 3 (1-indexed)"
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary font-extrabold border border-slate-200 dark:border-slate-800"
                    />
                    <span className="text-xs font-bold text-slate-455 block mt-1">Split pages by comma-separated page ranges.</span>
                  </div>

                  <button 
                    onClick={handleExecute}
                    disabled={processing}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Scissors className="h-5 w-5" />}
                    {processing ? 'Processing Split...' : 'Split PDF Pages'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Compress panel */}
          {activeTool === 'compress' && (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
              {!singleFile ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-855 hover:border-primary p-8 rounded-2xl text-center relative cursor-pointer">
                  <input type="file" onChange={handleSingleFile} accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <span className="text-base font-extrabold text-slate-600 block">Select PDF to Compress</span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-sm font-extrabold">
                    <span className="truncate max-w-[240px] text-slate-800 dark:text-slate-100">{singleFile.name}</span>
                    <button onClick={clearInputs} className="text-red-500 hover:underline transition-all">Clear</button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-455 uppercase tracking-widest block mb-2">Compression Preset</label>
                    <div className="grid grid-cols-3 gap-3 text-sm text-center font-black">
                      {[
                        { id: 'low', name: 'Low', desc: 'Max Quality' },
                        { id: 'medium', name: 'Medium', desc: 'Optimized' },
                        { id: 'high', name: 'High', desc: 'Max Compression' }
                      ].map(level => (
                        <button 
                          key={level.id}
                          onClick={() => {
                            setCompressLevel(level.id as any);
                            const originalKb = Math.round(singleFile.size / 1024);
                            const target = level.id === 'high' ? 0.4 : level.id === 'medium' ? 0.7 : 0.9;
                            setTargetSizeKb(Math.round(originalKb * target));
                          }}
                          className={`p-4 border rounded-xl transition-all ${
                            compressLevel === level.id 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-slate-200 dark:border-slate-855 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-sm font-black">{level.name}</span>
                          <span className="block text-xs text-slate-450 font-extrabold mt-0.5">{level.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Target Size Selector */}
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <label className="text-sm font-black text-slate-455 uppercase tracking-widest block">Target Size (KB)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={targetSizeKb}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const originalKb = Math.round(singleFile.size / 1024);
                            setTargetSizeKb(Math.max(1, Math.min(originalKb, val)));
                          }}
                          className="w-28 px-3 py-2 bg-slate-100 dark:bg-secondary-light rounded-lg text-base outline-none text-right font-mono font-extrabold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800"
                        />
                        <span className="text-sm text-slate-450 font-black">KB</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <input 
                        type="range"
                        min={Math.round((singleFile.size / 1024) * 0.2)}
                        max={Math.round(singleFile.size / 1024)}
                        value={targetSizeKb}
                        onChange={(e) => setTargetSizeKb(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-455 font-black px-0.5">
                        <span>Min: {Math.round((singleFile.size / 1024) * 0.2)} KB</span>
                        <span>Max: {Math.round(singleFile.size / 1024)} KB</span>
                      </div>
                    </div>

                    {/* Compression Warning/Status Badge */}
                    <div className="pt-2">
                      {(() => {
                        const originalKb = Math.round(singleFile.size / 1024);
                        const ratio = targetSizeKb / originalKb;
                        if (ratio >= 0.6) {
                          return (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 rounded-xl text-sm text-emerald-650 dark:text-emerald-450 font-black flex items-center gap-2.5 shadow-sm">
                              <span className="text-base">🟢</span>
                              <span>Safe compression (Maximum quality, no distortion or blurring)</span>
                            </div>
                          );
                        } else if (ratio >= 0.4) {
                          return (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded-xl text-sm text-amber-650 dark:text-amber-455 font-black flex items-center gap-2.5 shadow-sm">
                              <span className="text-base">🟡</span>
                              <span>Balanced compression (Good quality, negligible blur)</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900 rounded-xl text-sm text-rose-650 dark:text-rose-455 font-black flex items-center gap-2.5 shadow-sm">
                              <span className="text-base">🔴</span>
                              <span>High compression (Maximum compression, possible text/image blurring)</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  <button 
                    onClick={handleExecute}
                    disabled={processing}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Minimize2 className="h-5 w-5" />}
                    {processing ? 'Compressing...' : 'Compress PDF Size'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Watermark panel */}
          {activeTool === 'watermark' && (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
              {!singleFile ? (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-850 hover:border-primary p-8 rounded-2xl text-center relative cursor-pointer">
                  <input type="file" onChange={handleSingleFile} accept="application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <span className="text-base font-extrabold text-slate-600 block">Select PDF to Watermark</span>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-sm font-extrabold">
                    <span className="truncate max-w-[240px] text-slate-800 dark:text-slate-100">{singleFile.name}</span>
                    <button onClick={clearInputs} className="text-red-500 hover:underline transition-all">Clear</button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5 text-sm font-extrabold">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-450 uppercase tracking-widest block">Watermark Text</label>
                      <input 
                        type="text" 
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-2 focus:ring-primary border border-slate-200 dark:border-slate-800 font-extrabold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-455 uppercase tracking-widest block font-bold">Opacity ({watermarkOpacity}%)</label>
                      <input 
                        type="range" 
                        min={10} 
                        max={100}
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mt-4"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-black text-slate-455 uppercase tracking-widest block">Color Stamp</label>
                      <select 
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none border border-slate-200 dark:border-slate-800 font-extrabold"
                      >
                        <option value="red">Red Stamp</option>
                        <option value="blue">Blue Stamp</option>
                        <option value="gray">Gray Stamp</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleExecute}
                    disabled={processing}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                  >
                    {processing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Type className="h-5 w-5" />}
                    {processing ? 'Applying Stamp...' : 'Apply Watermark Stamp'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Output download card */}
        <div className="space-y-6">
          {outputFile && (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4 animate-fade-in border-2 border-accent/20">
              <h3 className="font-black text-base border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 text-slate-800 dark:text-slate-100">
                Operation Complete
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm font-extrabold">
                <div className="flex justify-between">
                  <span className="text-slate-400">File Output Name</span>
                  <span className="text-right truncate max-w-[170px] text-slate-800 dark:text-slate-100">{outputFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">File Size</span>
                  <span className="text-slate-800 dark:text-slate-100">{outputFile.size}</span>
                </div>
              </div>

              <button 
                onClick={triggerDownload}
                className="w-full py-4 bg-accent hover:bg-accent-dark text-white font-black rounded-xl text-sm shadow-lg shadow-accent/25 flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="h-5 w-5" /> Download PDF File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UtilityTools() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading tools...</div>}>
      <UtilityToolsContent />
    </Suspense>
  );
}
