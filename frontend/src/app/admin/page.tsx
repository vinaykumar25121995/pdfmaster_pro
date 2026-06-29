'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, CreditCard, Cpu, Database, AlertTriangle, LifeBuoy,
  Search, ShieldAlert, ArrowLeft, ArrowUpRight, BarChart3, CheckCircle,
  Eye, ToggleLeft, Star, Edit3, Trash2, Calendar
} from 'lucide-react';

interface UserAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  plan: 'free' | 'pro' | 'business';
  createdAt: string;
}

interface SupportTicket {
  id: string;
  email: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
}

interface SystemError {
  id: string;
  service: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [errors, setErrors] = useState<SystemError[]>([]);
  
  const [activeTab, setActiveTab] = useState<'users' | 'tickets' | 'errors'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<'free' | 'pro' | 'business'>('free');

  useEffect(() => {
    // Seed initial admin data
    const seedUsers: UserAccount[] = [
      { id: 'u1', email: 'admin@pdfmaster.com', firstName: 'Platform', lastName: 'Admin', role: 'admin', plan: 'business', createdAt: '2026-06-01T08:00:00Z' },
      { id: 'u2', email: 'jack.finance@gmail.com', firstName: 'Jack', lastName: 'Sparrow', role: 'user', plan: 'pro', createdAt: '2026-06-12T14:20:00Z' },
      { id: 'u3', email: 'clara.legal@company.com', firstName: 'Clara', lastName: 'Oswald', role: 'user', plan: 'business', createdAt: '2026-06-15T09:10:00Z' },
      { id: 'u4', email: 'robert.contracts@dev.net', firstName: 'Robert', lastName: 'Pattinson', role: 'user', plan: 'free', createdAt: '2026-06-17T11:45:00Z' }
    ];

    const seedTickets: SupportTicket[] = [
      { id: 't1', email: 'jack.finance@gmail.com', title: 'OCR fails on blurry TIFF scans', description: 'The WebAssembly OCR is throwing worker errors on 300dpi TIFF images. Please advise.', priority: 'medium', status: 'open' },
      { id: 't2', email: 'robert.contracts@dev.net', title: 'Need custom API key details', description: 'Would love to integrate split-PDF script directly inside our backend server. How to get keys?', priority: 'low', status: 'in_progress' }
    ];

    const seedErrors: SystemError[] = [
      { id: 'err1', service: 'auth-gateway', message: 'Token refresh rejection rate spike (5%)', severity: 'warning', timestamp: '2026-06-18T18:30:00Z' },
      { id: 'err2', service: 'database-pool', message: 'Connection pool timeout warning (max 20 reached)', severity: 'critical', timestamp: '2026-06-18T19:15:00Z' }
    ];

    setUsers(seedUsers);
    setTickets(seedTickets);
    setErrors(seedErrors);
  }, []);

  const handleUpdatePlan = (userId: string) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, plan: editPlan } : u
    );
    setUsers(updated);
    setEditingUserId(null);
  };

  const handleUpdateTicketStatus = (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    const updated = tickets.map(t => 
      t.id === ticketId ? { ...t, status } : t
    );
    setTickets(updated);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-secondary-dark text-slate-900 dark:text-slate-100 p-8 space-y-8 transition-colors">
      
      {/* Admin Title bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/documents" className="p-1.5 hover:bg-slate-200 dark:hover:bg-secondary rounded-xl text-slate-500 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
              Platform Admin Control
            </span>
          </div>
          <h1 className="text-3xl font-bold font-display">SaaS Command Dashboard</h1>
          <p className="text-xs text-slate-500">System analytics, subscriptions levels, error checks, and support ticket queues.</p>
        </div>

        <Link href="/dashboard/documents" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all">
          Exit Admin Mode
        </Link>
      </div>

      {/* Analytics Summary Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
        {[
          { title: 'Active Accounts', value: users.length, icon: <Users className="h-4 w-4" />, trend: '+12% this week', color: 'text-blue-500' },
          { title: 'Monthly Revenue', value: '$2,480', icon: <CreditCard className="h-4 w-4" />, trend: '+$450 new sales', color: 'text-emerald-500' },
          { title: 'OCR Pages run', value: '45,892', icon: <Cpu className="h-4 w-4" />, trend: '98% accuracy score', color: 'text-teal-500' },
          { title: 'Storage Used', value: '142.8 GB', icon: <Database className="h-4 w-4" />, trend: '24% buffer remaining', color: 'text-indigo-500' },
          { title: 'System Errors', value: errors.length, icon: <AlertTriangle className="h-4 w-4 animate-bounce" />, trend: '1 critical threat', color: 'text-amber-500' },
          { title: 'Open Tickets', value: tickets.filter(t => t.status !== 'resolved').length, icon: <LifeBuoy className="h-4 w-4" />, trend: '2 in active queue', color: 'text-purple-500' }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl bg-white dark:bg-secondary flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider">{card.title}</span>
              <div className={`${card.color} p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display leading-tight">{card.value}</h3>
              <span className="text-[9px] text-slate-400 block mt-1">{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panels Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col (2/3 width): Data lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-3 gap-6 font-display font-bold text-sm">
            {[
              { id: 'users', label: 'User Subscriptions' },
              { id: 'tickets', label: 'Support Tickets' },
              { id: 'errors', label: 'System Errors log' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-1 transition-all ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-primary text-primary' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* User management list */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search user emails..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 bg-white dark:bg-secondary border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none w-full"
                />
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden bg-white dark:bg-secondary/40 border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-secondary/80 font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4">Email Account</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Subscription Plan</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-secondary-light/20 transition-colors">
                        <td className="p-4 font-bold text-primary">{user.email}</td>
                        <td className="p-4">{user.firstName} {user.lastName}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.plan === 'business' ? 'bg-purple-100 text-purple-600' : user.plan === 'pro' ? 'bg-accent/10 text-accent-dark' : 'bg-slate-150 text-slate-500'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {editingUserId === user.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <select 
                                value={editPlan}
                                onChange={(e) => setEditPlan(e.target.value as any)}
                                className="p-1 text-[10px] bg-slate-100 border-0 outline-none rounded font-bold"
                              >
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="business">Business</option>
                              </select>
                              <button onClick={() => handleUpdatePlan(user.id)} className="p-1 bg-emerald-500 text-white rounded">
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setEditingUserId(user.id); setEditPlan(user.plan); }}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-primary transition-all"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Support tickets list */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="glass-panel p-5 rounded-2xl bg-white dark:bg-secondary space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">{ticket.email}</span>
                      <h4 className="font-bold text-sm mt-0.5">{ticket.title}</h4>
                    </div>
                    <div className="flex gap-2 text-[9px] font-bold uppercase">
                      <span className={`px-2.5 py-0.5 rounded-full ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.priority} priority
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full ${
                        ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {ticket.description}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-[10px] font-bold">
                    <button 
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                      Mark In-Progress
                    </button>
                    <button 
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                      className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System error monitoring */}
          {activeTab === 'errors' && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <h4 className="font-bold">Database connection pool warning</h4>
                  <p className="mt-0.5 font-semibold text-amber-650 dark:text-amber-400">
                    Connection pool reached maximum allocated client count (20). Ensure clean connection release hooks are mapped.
                  </p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden bg-white dark:bg-secondary/40 border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-secondary/80 font-bold uppercase tracking-wider text-slate-500">
                      <th className="p-4">Service</th>
                      <th className="p-4">Message</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold font-mono text-[10px]">
                    {errors.map(err => (
                      <tr key={err.id} className="hover:bg-slate-50 dark:hover:bg-secondary-light/20 transition-colors">
                        <td className="p-4 font-bold text-red-500">{err.service}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-350">{err.message}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${err.severity === 'critical' ? 'bg-red-100 text-red-600 font-bold animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                            {err.severity}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(err.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Right Col (1/3 width): Extra admin details (Billing & OCR trends) */}
        <div className="space-y-6">
          
          {/* Revenue Breakdown */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              Subscription breakdown <BarChart3 className="h-4 w-4 text-slate-400" />
            </h3>
            
            <div className="space-y-3 font-semibold text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Business Tier Plan ($29.99)</span>
                <span>1 Active account</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[25%]" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pro Tier Plan ($9.99)</span>
                <span>1 Active account</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-accent h-full w-[25%]" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Free Tier Plan ($0.00)</span>
                <span>2 Active accounts</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-350 h-full w-[50%]" />
              </div>
            </div>
          </div>

          {/* OCR Usage logs */}
          <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-secondary space-y-4">
            <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
              Recent OCR logs
            </h3>
            <div className="space-y-3 font-semibold text-[10px]">
              {[
                { email: 'jack.finance@gmail.com', pages: 12, lang: 'eng', confidence: 98, status: 'success' },
                { email: 'clara.legal@company.com', pages: 3, lang: 'spa', confidence: 95, status: 'success' },
                { email: 'admin@pdfmaster.com', pages: 25, lang: 'hin', confidence: 92, status: 'success' }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-secondary-light/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold truncate block max-w-[120px]">{log.email}</span>
                    <span className="text-[9px] text-slate-400">{log.pages} pages • language: {log.lang}</span>
                  </div>
                  <span className="font-bold text-accent">{log.confidence}% score</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
