'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured, isDevelopment } from '@/lib/env';
import { Sparkles, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

// Demo credentials - only work in development when Supabase is not configured
const DEMO_EMAIL = 'admin@example.com';
const DEMO_PASSWORD = 'admin';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabaseConfigured = isSupabaseConfigured();
  const showDemoMode = !supabaseConfigured && isDevelopment();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check if Supabase is configured
      if (!supabaseConfigured) {
        // Demo mode - only in development
        if (isDevelopment()) {
          if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            // Set a session indicator for demo mode
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('demo_admin_session', 'true');
            }
            router.push('/admin');
            return;
          }
          throw new Error('Invalid credentials for demo mode.');
        } else {
          // Production without Supabase - block access
          throw new Error('Admin authentication is not configured. Please contact the administrator.');
        }
      }

      // Production authentication via Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Map Supabase errors to user-friendly messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password.');
        }
        throw error;
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-10 h-10 text-accent" />
          <h1 className="text-2xl font-bold">Event Spark</h1>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl p-8 border border-border">
          <h2 className="text-xl font-semibold text-center mb-6">Admin Login</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 rounded-lg p-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {showDemoMode && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-sm font-medium">Development Mode</span>
              </div>
              <p className="text-sm text-muted">
                Supabase not configured. Using demo credentials:
              </p>
              <p className="text-sm font-mono mt-1">
                {DEMO_EMAIL} / {DEMO_PASSWORD}
              </p>
            </div>
          )}

          {!supabaseConfigured && !isDevelopment() && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-sm font-medium">Configuration Required</span>
              </div>
              <p className="text-sm text-muted">
                Admin authentication is not configured. Please set up Supabase environment variables.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
