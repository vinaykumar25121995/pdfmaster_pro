'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Upload, FileText, Bot, User, Copy, Check,
  Zap, Table, ShieldCheck, Mail, FileCheck, RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIAssistant() {
  const [fileLoaded, setFileLoaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on chat update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiTyping]);

  const handleUploadSampleDoc = () => {
    setFileName('Cloud_Service_Invoice_883.pdf');
    const mockContent = `PDFMASTER PRO SERVICE INVOICE STATEMENT
Invoice Number: INV-2026-883
Billing Date: June 18, 2026
Vendor: Amazon Web Services (AWS) EMEA
Recipient: PDFMaster Pro Inc. (admin@pdfmaster.com)

LINE ITEMS:
1. EC2 Elastic Cloud Compute Instance (Size: c5.xlarge, Qty: 4) - $450.00
2. RDS PostgreSQL Database Instance (Size: db.m5.large, Qty: 1) - $180.00
3. Simple Storage Service (S3) Standard storage (Usage: 12TB) - $240.00
4. Route53 Domains & DNS Hosting Setup - $30.00

Total Subtotal: $900.00
Tax / VAT (10%): $90.00
Grand Total Due: $990.00

Thank you for hosting with AWS! For payment queries, contact aws-billing-vault@amazon.com.`;
    setFileText(mockContent);
    setFileLoaded(true);
    
    // Seed initial greeting
    setChatHistory([
      {
        id: '1',
        sender: 'ai',
        text: `Hello! I have loaded **Cloud_Service_Invoice_883.pdf** (~150 words). You can ask me questions about this invoice, summarize billing details, or extract tabular breakdowns.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const query = presetQuery || inputText.trim();
    if (!query) return;

    if (!presetQuery) setInputText('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setAiTyping(true);

    // Call Mock AI response (emulating Gemini when online, heuristics when offline)
    setTimeout(() => {
      let responseText = '';
      const q = query.toLowerCase();

      if (q.includes('summary') || q.includes('summarize')) {
        responseText = `### Billing Summary\nThis document is a **Service Invoice (INV-2026-883)** issued by **Amazon Web Services (AWS)** to **PDFMaster Pro Inc.** on **June 18, 2026**.\n\n- **Grand Total Due**: $990.00 (Includes 10% VAT of $90.00)\n- **Key Vendors**: AWS EMEA Support\n- **Billing Entities**: EC2 Computes, RDS PostgreSQL database, and 12TB S3 Buckets.`;
      } else if (q.includes('contact') || q.includes('emails') || q.includes('phone')) {
        responseText = `### Extracted Contacts & Entities\nI detected the following contact details inside the billing document:\n\n- **Vendor Email**: \`aws-billing-vault@amazon.com\`\n- **Recipient Email**: \`admin@pdfmaster.com\`\n- **Physical Issuer**: Amazon Web Services EMEA`;
      } else if (q.includes('table') || q.includes('items') || q.includes('cost')) {
        responseText = `### Extracted Billing Table\n| Line Item Description | Size / Detail | Cost |\n| :--- | :--- | :--- |\n| EC2 Elastic Compute | c5.xlarge (Qty: 4) | $450.00 |\n| RDS Database | db.m5.large (Qty: 1) | $180.00 |\n| S3 Storage | Standard 12TB | $240.00 |\n| Route53 DNS | Domain setup | $30.00 |\n| **Subtotal** | | **$900.00** |\n| **VAT (10%)** | | **$90.00** |\n| **Grand Total** | | **$990.00** |`;
      } else if (q.includes('tax') || q.includes('vat')) {
        responseText = `The document states that a **10% VAT (Value Added Tax)** of **$90.00** was applied to the subtotal ($900.00), bringing the grand total to **$990.00**.`;
      } else if (q.includes('s3') || q.includes('storage')) {
        responseText = `Yes, the invoice lists **Simple Storage Service (S3) Standard storage** with a usage of **12TB** at a cost of **$240.00**.`;
      } else {
        responseText = `I analyzed the document regarding "${query}". Here is the matches context:\n\n- **Invoice**: INV-2026-883\n- **Client Recipient**: PDFMaster Pro Inc.\n- **Vendor**: Amazon Web Services\n\nIs there a specific line item cost or invoice total you would like me to extract?`;
      }

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setAiTyping(false);
    }, 1000);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6 animate-slide-up h-[calc(100vh-140px)] flex flex-col">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary animate-pulse-slow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold">AI Document Assistant</h1>
            <p className="text-[10px] text-slate-400">Summarize books, build tables, and parse entities using Gemini models.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-full font-bold border flex items-center gap-1.5 transition-all ${
              isOnline 
                ? 'bg-accent/10 border-accent/20 text-accent-dark dark:text-accent-light' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${isOnline ? 'fill-current' : ''}`} />
            {isOnline ? 'Online: Gemini Active' : 'Offline Mode'}
          </button>
        </div>
      </div>

      {/* Main chat Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Side: Document Uploader & quick actions */}
        <div className="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Uploader Box */}
          {!fileLoaded ? (
            <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary text-center space-y-4">
              <FileText className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <div>
                <h3 className="font-bold text-xs">Analyze PDF File</h3>
                <p className="text-[10px] text-slate-400 mt-1">Upload a PDF to unlock summaries and extraction queries.</p>
              </div>
              
              <div className="relative">
                <input 
                  type="file" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFileName(e.target.files[0].name);
                      setFileLoaded(true);
                      handleUploadSampleDoc();
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5">
                  <Upload className="h-4 w-4" /> Upload PDF
                </button>
              </div>

              <button 
                onClick={handleUploadSampleDoc}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary rounded-xl text-xs font-semibold"
              >
                Load Sample Invoice PDF
              </button>
            </div>
          ) : (
            <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-secondary space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="h-4 w-4 text-accent" />
                  <span className="text-xs font-bold truncate">{fileName}</span>
                </div>
                <button 
                  onClick={() => { setFileLoaded(false); setChatHistory([]); }}
                  className="text-[10px] font-bold text-red-500 hover:underline"
                >
                  Unload
                </button>
              </div>

              <p className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 select-none">
                File cached. Ready for natural language extraction and entity checks.
              </p>
            </div>
          )}

          {/* Quick AI Presets (Only enabled if file loaded) */}
          <div className="glass-panel p-5 rounded-3xl bg-white dark:bg-secondary space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</h4>
            
            {[
              { id: 'summary', name: 'Summarize Document', query: 'Please summarize this document and list key points.' },
              { id: 'contacts', name: 'Extract Contacts info', query: 'List all emails and phone contacts inside the document.' },
              { id: 'table', name: 'Extract Data Tables', query: 'Can you extract the line items and cost details into a table format?' }
            ].map(act => (
              <button 
                key={act.id}
                onClick={() => handleSendMessage(undefined, act.query)}
                disabled={!fileLoaded || aiTyping}
                className="w-full text-left px-3.5 py-3 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-secondary rounded-2xl text-[11px] font-bold transition-all disabled:opacity-45 disabled:pointer-events-none flex items-center gap-2 group"
              >
                <Table className="h-3.5 w-3.5 text-primary group-hover:scale-105 transition-transform" />
                {act.name}
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: Chatbox Workspace */}
        <div className="flex-1 glass-panel rounded-3xl bg-white dark:bg-secondary/40 flex flex-col justify-between overflow-hidden shadow-inner">
          
          {/* Chat Messages flow */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Bot className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-bounce" />
                <div>
                  <h3 className="font-bold text-sm">Ask anything about the file</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Type your questions in the input below, or choose one of our quick presets on the left.
                  </p>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {/* Sender Icon */}
                  {msg.sender === 'ai' && (
                    <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="max-w-[80%] space-y-1">
                    <div className={`p-4 rounded-3xl text-xs relative group ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white dark:bg-secondary border border-slate-100 dark:border-slate-800 rounded-tl-none text-slate-850 select-text leading-relaxed shadow-sm'
                    }`}>
                      {/* Formatted Text rendering */}
                      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {/* Copy Helper for AI replies */}
                      {msg.sender === 'ai' && (
                        <button 
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="absolute top-2 right-2 p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-slate-500"
                        >
                          {copiedId === msg.id ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    <span className={`text-[9px] text-slate-400 block px-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="h-8 w-8 rounded-xl bg-slate-200 text-slate-650 flex items-center justify-center shadow-sm shrink-0">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* AI Typing / skeleton animation */}
            {aiTyping && (
              <div className="flex gap-4 justify-start animate-pulse">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-2 max-w-[60%]">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-40" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-60" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-36" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input field */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-secondary/70 backdrop-blur-md flex gap-2 items-center"
          >
            <input 
              type="text" 
              placeholder={fileLoaded ? "Ask a question about the PDF document..." : "Please load a document first..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!fileLoaded || aiTyping}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-2xl text-xs outline-none focus:ring-2 focus:ring-primary w-full disabled:opacity-60"
            />
            <button 
              type="submit"
              disabled={!fileLoaded || aiTyping || !inputText.trim()}
              className="p-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-2xl transition-all shadow-md shadow-primary/10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
