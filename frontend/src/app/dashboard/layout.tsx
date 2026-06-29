'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, FolderOpen, Eye, Edit3, Cpu, ArrowRightLeft, 
  Merge, Scissors, Minimize2, Type, PenTool, Settings,
  Search, Bell, Sun, Moon, LogOut, Menu, X, User
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; firstName: string; lastName: string; role: string; plan: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Fallback local mock user details if session is empty
      const defaultUser = { email: 'user@pdfmaster.com', firstName: 'John', lastName: 'Doe', role: 'user', plan: 'free' };
      localStorage.setItem('user', JSON.stringify(defaultUser));
      setUser(defaultUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Documents', path: '/dashboard/documents', icon: <FolderOpen className="h-4.5 w-4.5" /> },
    { name: 'PDF Reader', path: '/dashboard/reader', icon: <Eye className="h-4.5 w-4.5" /> },
    { name: 'PDF Editor', path: '/dashboard/editor', icon: <Edit3 className="h-4.5 w-4.5" /> },
    { name: 'AI & Advanced OCR Scanner', path: '/dashboard/ocr', icon: <Cpu className="h-4.5 w-4.5" /> },
    { name: 'Convert PDF', path: '/dashboard/convert', icon: <ArrowRightLeft className="h-4.5 w-4.5" /> },
    { name: 'Merge PDFs', path: '/dashboard/utilities?tool=merge', icon: <Merge className="h-4.5 w-4.5" /> },
    { name: 'Split PDFs', path: '/dashboard/utilities?tool=split', icon: <Scissors className="h-4.5 w-4.5" /> },
    { name: 'Compress PDFs', path: '/dashboard/utilities?tool=compress', icon: <Minimize2 className="h-4.5 w-4.5" /> },
    { name: 'Watermark PDFs', path: '/dashboard/utilities?tool=watermark', icon: <Type className="h-4.5 w-4.5" /> },
    { name: 'E-signatures', path: '/dashboard/signature', icon: <PenTool className="h-4.5 w-4.5" /> },
    { name: 'AI Assistant', path: '/dashboard/ai', icon: <SparklesIcon className="h-4.5 w-4.5" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-secondary-dark transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-6 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <FileText className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-base tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PDFMaster Pro
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const active = pathname === item.path || (item.path.includes('utilities') && pathname.includes('utilities'));
              return (
                <Link 
                  key={item.name} 
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-secondary-light hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                  {item.name === 'AI & Advanced OCR Scanner' ? (
                    <div className="flex flex-col items-start leading-tight -my-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">AI & Advanced</span>
                      <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">OCR Scanner</span>
                    </div>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
          {user && (
            <div className="bg-slate-100/50 dark:bg-secondary-light/50 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="h-9 w-9 bg-primary/15 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                {user.firstName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold truncate">{user.firstName} {user.lastName}</h4>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {user.plan} Plan
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800/50 dark:hover:bg-red-950/20 dark:hover:text-red-400 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-secondary/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-secondary-light lg:hidden"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            
            {/* Search Box */}
            <div className="relative hidden sm:block w-64 md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents and tags..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-secondary-light rounded-xl text-xs border-0 focus:ring-2 focus:ring-primary outline-none" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 relative">
            {/* Dark Mode toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-secondary-light transition-all"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Notifications Trigger */}
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-secondary-light transition-all relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse-slow" />
            </button>

            {/* Profile Dropdown Trigger */}
            <button 
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-600 font-bold"
            >
              <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Notifications Overlay Panel */}
            {showNotifications && (
              <div className="absolute right-12 top-12 w-80 glass-panel rounded-2xl p-4 shadow-xl z-50 bg-white dark:bg-secondary">
                <h4 className="font-bold text-xs border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  Notifications Log
                </h4>
                <div className="space-y-3">
                  <div className="p-2.5 hover:bg-slate-50 dark:hover:bg-secondary-light rounded-xl transition-all">
                    <span className="text-[10px] text-accent font-bold uppercase block">OCR Success</span>
                    <p className="text-xs font-semibold mt-0.5">Scanned_Contract_v2.jpg converted successfully (98% confidence).</p>
                  </div>
                  <div className="p-2.5 hover:bg-slate-50 dark:hover:bg-secondary-light rounded-xl transition-all">
                    <span className="text-[10px] text-primary font-bold uppercase block">Security Audit</span>
                    <p className="text-xs font-semibold mt-0.5">Admin logged in from IP 192.168.1.15.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Menu Dropdown */}
            {showProfileMenu && user && (
              <div className="absolute right-0 top-12 w-56 glass-panel rounded-2xl p-4 shadow-xl z-50 bg-white dark:bg-secondary text-xs">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <h4 className="font-bold">{user.firstName} {user.lastName}</h4>
                  <span className="text-[10px] text-slate-500 block">{user.email}</span>
                </div>
                <ul className="space-y-2">
                  <li>
                    <Link href="/dashboard/settings" className="block p-2 hover:bg-slate-50 dark:hover:bg-secondary-light rounded-lg transition-all font-semibold">
                      Account Settings
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link href="/admin" className="block p-2 text-primary font-bold hover:bg-primary/10 rounded-lg transition-all">
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="w-full text-left p-2 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all">
                      Logout Account
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Child Router Layout */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}

// Inline helper for AI icon compatibility
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}
