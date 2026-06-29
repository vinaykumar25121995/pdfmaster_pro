'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, CreditCard, LifeBuoy, Settings, ShieldCheck, Check,
  AlertCircle, Sparkles, Star, Globe, Key, Trash2
} from 'lucide-react';

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'support'>('profile');
  
  // Profile settings
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('user@pdfmaster.com');
  const [savedUserMsg, setSavedUserMsg] = useState(false);

  // Billing states
  const [currentPlan, setCurrentPlan] = useState('free'); // free, pro, business
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay' | 'paypal'>('stripe');
  
  // Ticket states
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSavedMsg, setTicketSavedMsg] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('user');
    if (cached) {
      const user = JSON.parse(cached);
      setFirstName(user.firstName || 'John');
      setLastName(user.lastName || 'Doe');
      setEmail(user.email || 'user@pdfmaster.com');
      setCurrentPlan(user.plan || 'free');
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const user = { email, firstName, lastName, role: email === 'admin@pdfmaster.com' ? 'admin' : 'user', plan: currentPlan };
    localStorage.setItem('user', JSON.stringify(user));
    setSavedUserMsg(true);
    setTimeout(() => setSavedUserMsg(false), 2000);
  };

  const handleUpgradePlan = (plan: 'pro' | 'business') => {
    // Mock payment trigger
    alert(`Initiating mock sandbox checkout via ${paymentProvider.toUpperCase()} for ${plan.toUpperCase()} Plan...`);
    
    setTimeout(() => {
      const user = { email, firstName, lastName, role: email === 'admin@pdfmaster.com' ? 'admin' : 'user', plan };
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentPlan(plan);
      alert(`Payment Success! Your account has been upgraded to ${plan.toUpperCase()} subscription tier.`);
      window.location.reload();
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) return;

    const newTicket = {
      id: `tick-${Date.now()}`,
      email,
      title: ticketTitle,
      description: ticketDesc,
      priority: ticketPriority,
      status: 'open'
    };

    const cachedTickets = localStorage.getItem('support_tickets') || '[]';
    const list = JSON.parse(cachedTickets);
    list.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(list));

    setTicketTitle('');
    setTicketDesc('');
    setTicketSavedMsg(true);
    setTimeout(() => setTicketSavedMsg(false), 3000);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold font-display">Account Settings</h1>
        <p className="text-xs text-slate-500">Manage user profiles, payments channels, and platform support tickets.</p>
      </div>

      {/* Settings Grid */}
      <div className="grid lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Tabs buttons */}
        <div className="glass-panel p-3 rounded-2xl bg-white dark:bg-secondary flex flex-col gap-1.5 font-display font-bold text-xs">
          {[
            { id: 'profile', name: 'Profile Information', icon: <User className="h-4 w-4" /> },
            { id: 'billing', name: 'Subscription Plan', icon: <CreditCard className="h-4 w-4" /> },
            { id: 'support', name: 'Customer Support', icon: <LifeBuoy className="h-4 w-4" /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-secondary-light/40'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Right Side: Tab details */}
        <div className="lg:col-span-3">
          
          {/* Profile tab details */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-secondary space-y-6">
              <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                Update Profile Info
              </h3>
              
              {savedUserMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  Profile updated successfully.
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>

                <button 
                  type="submit"
                  className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-xs"
                >
                  Save Profile Settings
                </button>
              </form>
            </div>
          )}

          {/* Billing tab details */}
          {activeTab === 'billing' && (
            <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-secondary space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm">
                  Active Subscription Tier
                </h3>
                <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
                  {currentPlan} Plan active
                </span>
              </div>

              {/* Payment selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Choose Payment Gateway</label>
                <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                  {[
                    { id: 'stripe', name: 'Stripe Checkout' },
                    { id: 'razorpay', name: 'Razorpay Payment' },
                    { id: 'paypal', name: 'PayPal Gateway' }
                  ].map(gate => (
                    <button 
                      key={gate.id}
                      onClick={() => setPaymentProvider(gate.id as any)}
                      className={`p-3 border rounded-xl transition-all ${
                        paymentProvider === gate.id 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                      }`}
                    >
                      {gate.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan cards list */}
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                <div className="border border-slate-200 dark:border-slate-850 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent" /> Pro Edition</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Unlimited PDF edits and summaries, plus 1000 OCR pages.</p>
                    <span className="text-xl font-extrabold block mt-4">$9.99/mo</span>
                  </div>
                  <button 
                    onClick={() => handleUpgradePlan('pro')}
                    disabled={currentPlan === 'pro'}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-855 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> Business Suite</h4>
                    <p className="text-[11px] text-slate-500 mt-1">Enterprise team folders, API execution keys, and audit logs.</p>
                    <span className="text-xl font-extrabold block mt-4">$29.99/mo</span>
                  </div>
                  <button 
                    onClick={() => handleUpgradePlan('business')}
                    disabled={currentPlan === 'business'}
                    className="w-full py-2.5 bg-accent hover:bg-accent-dark disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {currentPlan === 'business' ? 'Current Plan' : 'Upgrade to Business'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Support tab details */}
          {activeTab === 'support' && (
            <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-secondary space-y-6">
              <h3 className="font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                Create Support Request
              </h3>

              {ticketSavedMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  Support ticket submitted successfully. View status on the Admin panel queue.
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-bold">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500">Ticket Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Split PDF fails on page 4"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Priority Level</label>
                    <select 
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none font-bold"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Request Description</label>
                  <textarea 
                    placeholder="Provide details about the issue or question..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full p-4 bg-slate-100 dark:bg-secondary-light rounded-xl outline-none focus:ring-2 focus:ring-primary h-28 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-xs"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
