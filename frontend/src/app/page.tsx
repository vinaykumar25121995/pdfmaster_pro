'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Cpu, Eye, ArrowRightLeft, PenTool, Sparkles, 
  Check, Moon, Sun, ArrowRight, ShieldCheck, Zap, Download,
  FolderLock, Globe, HelpCircle, MessageSquare,
  ChevronDown, ChevronUp, Scissors, Trash2, Files, LayoutGrid, Scan,
  ShieldAlert, Image, FileCode, Presentation, FileSpreadsheet,
  RotateCw, Hash, Type, Crop, Edit3, Layout, Unlock, Lock,
  Eraser, Languages, Minimize2
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const megamenuCategories = [
    {
      title: "ORGANIZE PDF",
      color: "text-red-500 dark:text-red-400",
      items: [
        { name: "Merge PDF", path: "/dashboard/utilities?tool=merge", icon: <FileText className="h-4 w-4" /> },
        { name: "Split PDF", path: "/dashboard/utilities?tool=split", icon: <Scissors className="h-4 w-4" /> },
        { name: "Remove pages", path: "/dashboard/utilities?tool=remove", icon: <Trash2 className="h-4 w-4" /> },
        { name: "Extract pages", path: "/dashboard/utilities?tool=extract", icon: <Files className="h-4 w-4" /> },
        { name: "Organize PDF", path: "/dashboard/utilities?tool=organize", icon: <LayoutGrid className="h-4 w-4" /> },
        { name: "Scan to PDF", path: "/dashboard/ocr", icon: <Scan className="h-4 w-4" /> },
      ]
    },
    {
      title: "OPTIMIZE PDF",
      color: "text-green-500 dark:text-green-400",
      items: [
        { name: "Compress PDF", path: "/dashboard/utilities?tool=compress", icon: <Minimize2 className="h-4 w-4" /> },
        { name: "Repair PDF", path: "/dashboard/utilities?tool=repair", icon: <ShieldAlert className="h-4 w-4" /> },
        { name: "OCR PDF", path: "/dashboard/ocr?tool=ocr-pdf", icon: <Cpu className="h-4 w-4" /> },
      ]
    },
    {
      title: "CONVERT TO PDF",
      color: "text-amber-500 dark:text-amber-400",
      items: [
        { name: "JPG to PDF", path: "/dashboard/convert?tool=jpg-to-pdf", icon: <Image className="h-4 w-4" /> },
        { name: "WORD to PDF", path: "/dashboard/convert?tool=word-to-pdf", icon: <FileCode className="h-4 w-4" /> },
        { name: "POWERPOINT to PDF", path: "/dashboard/convert?tool=ppt-to-pdf", icon: <Presentation className="h-4 w-4" /> },
        { name: "EXCEL to PDF", path: "/dashboard/convert?tool=excel-to-pdf", icon: <FileSpreadsheet className="h-4 w-4" /> },
        { name: "HTML to PDF", path: "/dashboard/convert?tool=html-to-pdf", icon: <Globe className="h-4 w-4" /> },
      ]
    },
    {
      title: "CONVERT FROM PDF",
      color: "text-blue-500 dark:text-blue-400",
      items: [
        { name: "PDF to JPG", path: "/dashboard/convert?tool=pdf-to-jpg", icon: <Image className="h-4 w-4" /> },
        { name: "PDF to WORD", path: "/dashboard/convert?tool=pdf-to-word", icon: <FileCode className="h-4 w-4" /> },
        { name: "PDF to POWERPOINT", path: "/dashboard/convert?tool=pdf-to-ppt", icon: <Presentation className="h-4 w-4" /> },
        { name: "PDF to EXCEL", path: "/dashboard/convert?tool=pdf-to-excel", icon: <FileSpreadsheet className="h-4 w-4" /> },
        { name: "PDF to PDF/A", path: "/dashboard/convert?tool=pdf-to-pdfa", icon: <ShieldCheck className="h-4 w-4" /> },
      ]
    },
    {
      title: "EDIT PDF",
      color: "text-purple-500 dark:text-purple-400",
      items: [
        { name: "Rotate PDF", path: "/dashboard/utilities?tool=rotate", icon: <RotateCw className="h-4 w-4" /> },
        { name: "Add page numbers", path: "/dashboard/utilities?tool=pagenumbers", icon: <Hash className="h-4 w-4" /> },
        { name: "Add watermark", path: "/dashboard/utilities?tool=watermark", icon: <Type className="h-4 w-4" /> },
        { name: "Crop PDF", path: "/dashboard/utilities?tool=crop", icon: <Crop className="h-4 w-4" /> },
        { name: "Edit PDF", path: "/dashboard/editor", icon: <Edit3 className="h-4 w-4" /> },
        { name: "PDF Forms", path: "/dashboard/utilities?tool=forms", icon: <Layout className="h-4 w-4" /> },
      ]
    },
    {
      title: "PDF SECURITY",
      color: "text-indigo-500 dark:text-indigo-400",
      items: [
        { name: "Unlock PDF", path: "/dashboard/utilities?tool=unlock", icon: <Unlock className="h-4 w-4" /> },
        { name: "Protect PDF", path: "/dashboard/utilities?tool=protect", icon: <Lock className="h-4 w-4" /> },
        { name: "Sign PDF", path: "/dashboard/signature", icon: <PenTool className="h-4 w-4" /> },
        { name: "Redact PDF", path: "/dashboard/utilities?tool=redact", icon: <Eraser className="h-4 w-4" /> },
        { name: "Compare PDF", path: "/dashboard/ocr?tool=compare-pdf", icon: <ArrowRightLeft className="h-4 w-4" /> },
      ]
    },
    {
      title: "PDF INTELLIGENCE",
      color: "text-violet-500 dark:text-violet-400",
      items: [
        { name: "AI Summarizer", path: "/dashboard/ai", icon: <Sparkles className="h-4 w-4" /> },
        { name: "Translate PDF", path: "/dashboard/ocr?tool=translate-pdf", icon: <Languages className="h-4 w-4" /> },
      ]
    }
  ];

  const features = [
    {
      icon: <PenTool className="h-6 w-6 text-primary" />,
      title: "PDF Editing",
      description: "Directly modify PDF text, resize images, delete pages, and customize layouts inside your browser."
    },
    {
      icon: <Cpu className="h-6 w-6 text-accent" />,
      title: "OCR Recognition",
      description: "Convert scanned PDFs, JPEGs, and PNGs to fully searchable text formats using client-side Wasm engines."
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "PDF Reader",
      description: "Fast loading for files up to 1000 pages with night mode, side-by-side thumbnails, and presentation layouts."
    },
    {
      icon: <ArrowRightLeft className="h-6 w-6 text-accent" />,
      title: "PDF Conversion",
      description: "Convert freely from/to PDF (Word, Excel, PowerPoint, JPEG, PNG, HTML) without layout distortion."
    },
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Annotation Tools",
      description: "Apply underlines, highlights, circles, lines, shapes, drawing canvas sketches, and comment reply logs."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-accent animate-pulse-slow" />,
      title: "AI Assistant",
      description: "Query document contents, extract tables, list contact info, and summarize books with natural chat interfaces."
    }
  ];

  const plans = [
    {
      name: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      description: "Core features for individuals",
      features: [
        "10 PDFs / day limit",
        "20 OCR pages / day limit",
        "Web app access only",
        "Standard local storage"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      priceMonthly: 9.99,
      priceYearly: 7.99,
      description: "Professional tools for power users",
      features: [
        "Unlimited PDFs and edits",
        "1,000 OCR pages / month",
        "AI Assistant & Summaries",
        "Desktop app download",
        "Priority Customer Support"
      ],
      buttonText: "Go Pro",
      popular: true
    },
    {
      name: "Business",
      priceMonthly: 29.99,
      priceYearly: 23.99,
      description: "Built for team workflows and scales",
      features: [
        "Unlimited everything",
        "API execution keys",
        "Shared team document library",
        "Audit logs & role controls",
        "Custom branding & signatures"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "Does PDFMaster Pro process OCR offline?",
      a: "Yes! Our downloadable desktop apps (for macOS and Windows) run completely client-side. WebAssembly enables offline OCR processing directly on your device, ensuring maximum security and zero cloud upload requirements."
    },
    {
      q: "How does the AI Assistant analyze my files?",
      a: "When online, we use advanced Gemini API processing to summarize and query documents. In offline mode, the desktop app executes local parsing filters to pull out contacts, summaries, and key points safely."
    },
    {
      q: "Can I manage pages and reorder them?",
      a: "Absolutely. Our utility dashboard offers a visual layout where you can drag-and-drop to reorder pages, duplicate them, rotate them, or split ranges into individual documents."
    },
    {
      q: "Is my payment information secure?",
      a: "Yes. All subscription pathways are secured and processed using Stripe, PayPal, and Razorpay, complying with PCI-DSS guidelines."
    }
  ];

  const testimonials = [
    {
      quote: "PDFMaster Pro completely replaced our expensive Adobe licenses. The client-side OCR is faster than anything we used before, and the AI summary tool saves us hours of manual parsing.",
      author: "Sarah Jenkins",
      role: "Lead Document Architect, LexCorp"
    },
    {
      quote: "The desktop app is phenomenal. Being able to sign contracts offline and extract structural tables from scans directly into CSVs has streamlined our client billing process.",
      author: "Marcus Chen",
      role: "Operations Director, Apex Financial"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-secondary-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-panel backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-primary p-2 rounded-xl text-white">
            <FileText className="h-6 w-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PDFMaster Pro
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <button 
            onClick={() => setShowMegaMenu(!showMegaMenu)}
            className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none"
          >
            All PDF Tools
            {showMegaMenu ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
          </button>
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#testimonials" className="hover:text-primary transition-colors">Reviews</a>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-secondary-light transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </button>
          
          <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold hover:text-primary transition-all">
            Login
          </Link>
          
          <Link href="/auth/login?signup=true" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Megamenu Overlay Backdrop */}
      {showMegaMenu && (
        <div 
          className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px]"
          onClick={() => setShowMegaMenu(false)}
        />
      )}

      {/* Megamenu Dropdown Panel */}
      {showMegaMenu && (
        <div 
          className="fixed left-0 right-0 top-[73px] z-50 bg-white/95 dark:bg-secondary/95 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xl py-8 px-6 overflow-y-auto max-h-[85vh] animate-fade-in-down"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {megamenuCategories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className={`text-[10px] font-black tracking-widest uppercase pb-1 border-b border-slate-100 dark:border-slate-800/50 ${cat.color}`}>
                  {cat.title}
                </h4>
                <ul className="space-y-2.5">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link 
                        href={`/auth/login?redirect=${encodeURIComponent(item.path)}`}
                        onClick={() => setShowMegaMenu(false)}
                        className="group flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary-light transition-all"
                      >
                        <span className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background glow graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Introducing v2.0 with Offline Wasm OCR</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-tight tracking-tight mb-8">
            Edit, Convert, Read and <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent">
              OCR PDFs in Seconds
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional PDF tools powered by advanced OCR and AI technology. 
            Compile metadata, annotate pages, and sign contracts completely inside browser or desktop packages.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/login?signup=true" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 group">
              Start Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a href="#desktop-download" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white dark:bg-secondary-light dark:hover:bg-slate-800 font-semibold rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2">
              <Download className="h-4 w-4 text-accent" />
              Download Desktop App
            </a>
          </div>

          {/* Social Proof metrics */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-sm text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <span>PCI-DSS Secured Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderLock className="h-5 w-5 text-primary" />
              <span>GDPR Compliant Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              <span>100% Client-Side Processing Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 bg-slate-50 dark:bg-secondary border-t border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-16">
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight text-slate-900 dark:text-white">
              PDFMaster Pro Mobile
            </h2>
            
            {/* App Store & Google Play Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a 
                href="/PDFMaster_Pro_Setup.apk"
                download="PDFMaster_Pro_Setup.apk"
                className="bg-black text-white hover:bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3 transition-all duration-300 shadow-md group"
              >
                {/* Play Store SVG */}
                <svg className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,3.23C5.18,3.05 5.5,3 5.83,3C6.07,3 6.32,3.05 6.55,3.15L17.74,9.6L14.07,12.3L5,3.23M4.07,4.27L13.14,13.34L4.07,22.4C4,22.19 3.96,21.93 3.96,21.62V5C3.96,4.72 4,4.47 4.07,4.27M14.93,13.16L18.66,10.13C19.34,9.74 19.8,9 19.8,8.1C19.8,7.2 19.34,6.46 18.66,6.07L14.93,8.2L14.93,13.16M5,22.97L14.07,13.9L17.74,16.6L6.55,23.05C6.32,23.15 6.07,23.2 5.83,23.2C5.5,23.2 5.18,23.15 5,22.97Z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block">Get it on</span>
                  <span className="text-sm font-black block">Google Play</span>
                </div>
              </a>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); alert("App Store publication pending. Use Direct APK download for Android!"); }}
                className="bg-black text-white hover:bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-800 flex items-center gap-3 transition-all duration-300 shadow-md group"
              >
                {/* Apple Store SVG */}
                <svg className="w-6 h-6 text-slate-200 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block">Download on the</span>
                  <span className="text-sm font-black block">App Store</span>
                </div>
              </a>

              <a 
                href="/PDFMaster_Pro_Setup.apk"
                download="PDFMaster_Pro_Setup.apk"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-md shadow-primary/25 group"
              >
                <Download className="w-5 h-5 text-white group-hover:translate-y-0.5 transition-transform" />
                <div className="text-left leading-tight">
                  <span className="text-[9px] text-primary-light uppercase tracking-widest font-black block">Direct Download</span>
                  <span className="text-sm font-black block">Android APK</span>
                </div>
              </a>
            </div>
          </div>

          {/* Device Mockups Container */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto pt-6">
            
            {/* Tablet Mockup */}
            <div className="w-full lg:w-[65%] bg-slate-200 dark:bg-slate-800 rounded-[32px] p-3 shadow-2xl border border-slate-300 dark:border-slate-700/80 animate-float">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[24px] overflow-hidden flex aspect-[4/3] border border-slate-200 dark:border-slate-850">
                
                {/* Tablet Sidebar */}
                <aside className="w-1/4 bg-slate-100 dark:bg-slate-950 border-r border-slate-200/50 dark:border-slate-800/50 p-4 flex flex-col justify-between text-left">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-1.5 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                      <span className="font-display font-extrabold text-[13px] tracking-tight">PDFMaster</span>
                    </div>

                    <div className="space-y-1">
                      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-xs">
                        S
                      </div>
                      <div className="pt-1.5">
                        <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold block w-fit">Premium</span>
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate mt-1">Sakane Miiko</h4>
                      </div>
                    </div>

                    <nav className="space-y-1">
                      {["Home", "Files", "Tools", "Scanner", "Settings"].map((navItem, nIdx) => (
                        <div 
                          key={navItem} 
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black ${
                            navItem === "Tools" 
                              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" 
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {navItem}
                        </div>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="text-[8px] text-slate-400 font-bold">
                    v2.0.4 - Mobile
                  </div>
                </aside>

                {/* Tablet Main Content */}
                <main className="flex-1 p-5 overflow-y-auto text-left bg-white dark:bg-secondary">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">All Tools</h3>
                    <div className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "Merge PDF", color: "bg-red-500/10 text-red-500" },
                      { name: "Split PDF", color: "bg-amber-500/10 text-amber-500" },
                      { name: "Compress PDF", color: "bg-green-500/10 text-green-500" },
                      { name: "PDF to Word", color: "bg-blue-500/10 text-blue-500" },
                      { name: "PDF to Excel", color: "bg-indigo-500/10 text-indigo-500" },
                      { name: "PDF to PPT", color: "bg-purple-500/10 text-purple-500" },
                      { name: "Rotate PDF", color: "bg-pink-500/10 text-pink-500" },
                      { name: "Add Watermark", color: "bg-violet-500/10 text-violet-500" },
                      { name: "Protect PDF", color: "bg-teal-500/10 text-teal-500" },
                    ].map((tool, tIdx) => (
                      <div 
                        key={tIdx} 
                        className="bg-slate-50 dark:bg-secondary-light/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 text-center space-y-1.5 hover:scale-[1.03] transition-all"
                      >
                        <div className={`w-6 h-6 rounded-lg ${tool.color} flex items-center justify-center mx-auto text-[9px] font-black`}>
                          {tool.name.charAt(0)}
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-700 dark:text-slate-350 block truncate">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </main>

              </div>
            </div>

            {/* Phone Mockup */}
            <div className="w-[280px] bg-slate-200 dark:bg-slate-800 rounded-[44px] p-3 shadow-2xl border border-slate-350 dark:border-slate-700/80 animate-float [animation-delay:0.5s]">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[36px] overflow-hidden aspect-[9/19.5] border border-slate-200 dark:border-slate-850 p-4 text-left flex flex-col justify-between">
                
                <div className="space-y-4">
                  {/* Status Bar / Brand */}
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                    <span className="font-display font-extrabold text-[10px]">PDFMaster</span>
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>

                  {/* Recent Files */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-450">
                      <span>Recent Files</span>
                      <span className="text-primary cursor-pointer hover:underline">Clear</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { name: "Invoice.pdf", size: "128 KB", time: "2 mins ago" },
                        { name: "Results.pdf", size: "1.4 MB", time: "1 hour ago" },
                        { name: "Scanned_Doc.pdf", size: "4.2 MB", time: "Yesterday" }
                      ].map((fileItem, fIdx) => (
                        <div key={fIdx} className="bg-white dark:bg-secondary p-2 rounded-lg border border-slate-100 dark:border-slate-850 flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-red-500/10 text-red-500 flex items-center justify-center text-[8px] font-black">
                            PDF
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[9px] font-bold text-slate-800 dark:text-slate-200 truncate">{fileItem.name}</h5>
                            <span className="text-[7px] text-slate-400 font-semibold block">{fileItem.size} | {fileItem.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Favorites */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-450">
                      Favorites ⭐
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Contract.pdf", color: "border-primary" },
                        { name: "ID_Card.png", color: "border-accent" }
                      ].map((fav, fIdx) => (
                        <div key={fIdx} className={`bg-white dark:bg-secondary p-2 rounded-lg border-l-2 ${fav.color} border border-slate-100 dark:border-slate-850`}>
                          <span className="text-[8px] font-bold text-slate-700 dark:text-slate-300 block truncate">{fav.name}</span>
                          <span className="text-[6px] text-slate-400 block mt-0.5">Quick access</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2 flex justify-between items-center text-[8px] font-bold text-slate-400">
                  <span className="text-primary font-black">Home</span>
                  <span>Files</span>
                  <span>Tools</span>
                  <span>Settings</span>
                </div>

              </div>
            </div>

          </div>

          {/* Description Footer */}
          <div className="max-w-3xl mx-auto space-y-4 pt-4">
            <h3 className="text-3xl md:text-4xl font-black font-display text-slate-900 dark:text-white leading-tight">
              Scan, edit and share documents from your smartphone and tablet
            </h3>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold">
              Turn your mobile device or tablet into a portable PDF editor. Keep projects moving and stay productive by working with your favorite PDF tools anytime, anywhere.
            </p>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-100/50 dark:bg-secondary-dark/40 border-y border-slate-200/50 dark:border-slate-800/40 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Equipped with Complete PDF Utilities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to handle document management and secure annotations in a single responsive environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="glass-panel p-8 rounded-3xl glow-card transition-all hover:scale-[1.02]"
              >
                <div className="bg-slate-100 dark:bg-secondary-light p-3.5 rounded-2xl w-fit mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop App Promo Block */}
      <section id="desktop-download" className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass-panel rounded-[40px] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex-1 space-y-6">
              <span className="bg-accent/15 text-accent-dark dark:text-accent-light px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                macOS & Windows Apps Available
              </span>
              <h2 className="text-3xl md:text-5xl font-bold font-display leading-tight">
                Work Instantly with Offline Client Operations
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Take PDFMaster Pro with you anywhere. The downloadable macOS and Windows Electron shells pack full local WebAssembly OCR, signature drawing pads, local database caches, and native auto-update installers.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <a 
                  href="/PDFMaster_Pro_Setup.dmg"
                  download="PDFMaster_Pro_Setup.dmg"
                  className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download for macOS (.dmg)
                </a>
                <a 
                  href="/PDFMaster_Pro_Setup.exe"
                  download="PDFMaster_Pro_Setup.exe"
                  className="px-6 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary text-slate-850 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download for Windows (.exe)
                </a>
                <a 
                  href="/PDFMaster_Pro_Setup.apk"
                  download="PDFMaster_Pro_Setup.apk"
                  className="px-6 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary text-slate-850 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download for Android (.apk)
                </a>
                <span className="text-xs text-slate-550 self-center">v2.0.4 | macOS, Windows & Android</span>
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center">
              <div className="relative w-full max-w-sm glass-panel p-4 rounded-3xl shadow-2xl border-slate-200 dark:border-slate-800 bg-slate-900/90 text-white">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500 font-mono pl-2">PDFMaster Pro Offline Shell</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-accent">$ npm run dev:desktop</div>
                  <div className="text-slate-400">Loading Electron process manager...</div>
                  <div className="text-primary-light">Wasm-Core Engine Loaded successfully.</div>
                  <div className="text-slate-400">Listening to local file drop events.</div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 mt-4 text-center">
                    <Download className="h-6 w-6 text-accent mx-auto mb-2 animate-bounce" />
                    <span className="text-slate-200 font-semibold block text-[11px]">Drop a scanned file to run Local OCR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-100/50 dark:bg-secondary-dark/40 border-y border-slate-200/50 dark:border-slate-800/40 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Flexible Plans Built to Scale
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
              Whether you are scanning individual pages or automating enterprise document flows, choose the right fit.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-slate-200 dark:bg-secondary-light p-1.5 rounded-2xl">
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${billingPeriod === 'monthly' ? 'bg-white dark:bg-slate-800 shadow-md text-primary' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${billingPeriod === 'yearly' ? 'bg-white dark:bg-slate-800 shadow-md text-primary' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`glass-panel p-8 rounded-3xl flex flex-col justify-between relative transition-all ${
                  plan.popular ? 'border-primary ring-2 ring-primary/20 scale-[1.03] shadow-xl bg-white dark:bg-secondary-light' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-bold font-display mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold font-display">
                      ${billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                    </span>
                    <span className="text-sm text-slate-500">/ month</span>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800 mb-8" />

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="bg-primary/10 dark:bg-primary/20 p-1 rounded-full text-primary">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href={`/auth/login?signup=true&plan=${plan.name.toLowerCase()}`}
                  className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Read how teams and individuals optimize their document archives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((test, index) => (
              <div key={index} className="glass-panel p-8 rounded-3xl flex flex-col justify-between">
                <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  "{test.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">
                    {test.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{test.author}</h4>
                    <span className="text-xs text-slate-500">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-100/50 dark:bg-secondary-dark/40 border-t border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-panel p-8 rounded-3xl">
                <h3 className="text-lg font-bold font-display mb-2 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-light/30 via-primary/5 to-transparent opacity-50" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold font-display">
            Supercharge Your PDF Workflows Today
          </h2>
          <p className="text-lg text-primary-light max-w-xl mx-auto">
            Get started for free. Upgrade whenever you need higher OCR limits or desktop installations.
          </p>
          <div className="pt-6">
            <Link href="/auth/login?signup=true" className="px-8 py-4 bg-white hover:bg-slate-100 text-primary font-bold rounded-2xl shadow-xl transition-all inline-flex items-center gap-2 group">
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">PDFMaster Pro</span>
            </div>
            <p className="text-xs text-slate-500">
              The professional all-in-one PDF solution powered by client-side WebAssembly OCR and AI helper filters.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><button onClick={() => alert('Opening sitemap...')} className="hover:text-white transition-colors">Sitemap</button></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Audit</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR & Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} PDFMaster Pro Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Twitter</a>
            <a href="#" className="hover:underline">GitHub</a>
            <a href="#" className="hover:underline">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
