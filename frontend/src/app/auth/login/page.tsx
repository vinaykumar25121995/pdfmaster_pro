'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock Login/Signup sequence for local demo/development
    setTimeout(() => {
      setLoading(false);
      if (isSignUp) {
        if (!email || !password || !firstName) {
          setError('Please fill in all required fields.');
          return;
        }
        setShowOtpInput(true);
      } else {
        if (email === 'admin@pdfmaster.com') {
          // Admin Session
          localStorage.setItem('token', 'mock-admin-jwt-token');
          localStorage.setItem('user', JSON.stringify({ email, firstName: 'Platform', lastName: 'Admin', role: 'admin', plan: 'business' }));
          router.push('/admin');
        } else {
          // Regular User Session
          localStorage.setItem('token', 'mock-user-jwt-token');
          localStorage.setItem('user', JSON.stringify({ email, firstName: firstName || 'John', lastName: lastName || 'Doe', role: 'user', plan: 'free' }));
          router.push('/dashboard/documents');
        }
      }
    }, 800);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpCode !== '123456' && otpCode !== '888888') {
      setError('Invalid OTP code. Try entering 123456');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('token', 'mock-user-jwt-token');
      localStorage.setItem('user', JSON.stringify({ email, firstName: firstName || 'User', lastName: lastName || '', role: 'user', plan: 'free' }));
      router.push('/dashboard/documents');
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-secondary-dark px-6 py-12 relative overflow-hidden transition-colors">
      
      {/* Decorative backdrop shapes */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-primary p-2 rounded-xl text-white">
              <FileText className="h-6 w-6" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PDFMaster Pro
            </span>
          </Link>
          <h2 className="text-2xl font-bold font-display">
            {showOtpInput ? 'Verify Your Account' : isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {showOtpInput ? 'We sent a verification code to your email' : isSignUp ? 'Get started with a free plan today' : 'Access your professional document space'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="glass-panel p-8 rounded-3xl shadow-xl bg-white/70 dark:bg-secondary/70">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold">
              {error}
            </div>
          )}

          {!showOtpInput ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => alert('Check your inbox (use 888888 as mock reset code)')}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-9 pr-4 py-3 bg-slate-100 dark:bg-secondary-light rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-bold py-3 bg-slate-100 dark:bg-secondary-light rounded-xl border-0 focus:ring-2 focus:ring-primary outline-none font-mono" 
                  placeholder="123456"
                  required
                />
                <span className="text-[10px] text-slate-400 block text-center mt-1">
                  Enter **123456** to pass verification in local preview
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-accent hover:bg-accent-dark disabled:bg-accent/50 text-white font-bold rounded-xl shadow-lg shadow-accent/25 transition-all text-sm"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button 
                type="button" 
                onClick={() => setShowOtpInput(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 block text-center"
              >
                Go Back
              </button>
            </form>
          )}

          {/* Social Sign-in Divider */}
          {!showOtpInput && (
            <div className="mt-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-secondary px-3 text-slate-400 font-semibold">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    localStorage.setItem('token', 'mock-oauth-jwt');
                    localStorage.setItem('user', JSON.stringify({ email: 'google.user@gmail.com', firstName: 'Google', lastName: 'User', role: 'user', plan: 'free' }));
                    router.push('/dashboard/documents');
                  }}
                  className="py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary-light rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.63 14.99 1 12 1 7.35 1 3.37 3.68 1.46 7.57l3.78 2.93c.9-2.7 3.42-4.46 6.76-4.46z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.68-4.96 3.68-8.63z" />
                    <path fill="#FBBC05" d="M5.24 14.5c-.24-.72-.38-1.5-.38-2.3c0-.8.14-1.58.38-2.3L1.46 6.97C.53 8.84 0 10.92 0 13c0 2.08.53 4.16 1.46 6.03l3.78-2.93z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.03.69-2.35 1.1-4.23 1.1-3.34 0-5.86-1.76-6.76-4.46L1.46 16.77C3.37 20.32 7.35 23 12 23z" />
                  </svg>
                  Google
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem('token', 'mock-oauth-jwt');
                    localStorage.setItem('user', JSON.stringify({ email: 'microsoft.user@outlook.com', firstName: 'Microsoft', lastName: 'User', role: 'user', plan: 'free' }));
                    router.push('/dashboard/documents');
                  }}
                  className="py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-secondary-light rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="h-4 w-4" viewBox="0 0 23 23">
                    <path fill="#F25022" d="M0 0h11v11H0z" />
                    <path fill="#7FBA00" d="M12 0h11v11H12z" />
                    <path fill="#00A4EF" d="M0 12h11v11H0z" />
                    <path fill="#FFB900" d="M12 12h11v11H12z" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Auth Toggle */}
        {!showOtpInput && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-bold"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        )}

        {/* Security badge */}
        <div className="mt-8 flex justify-center items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>SSL Encryption & HIPAA Compliant Data Vault</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-secondary-dark text-slate-400">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
