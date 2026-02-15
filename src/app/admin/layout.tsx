'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured, isDevelopment, isE2EDemoMode } from '@/lib/env';
import { Sparkles, LogOut, List, Plus, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getDemoModeOverride, setDemoModeOverride } from '@/lib/storage';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [isDemoOverride, setIsDemoOverride] = useState(false);

  useEffect(() => {
    setIsDemoOverride(getDemoModeOverride());
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseEnabled = isSupabaseConfigured();
      const e2eDemoMode = isE2EDemoMode();

      // Check for demo session (E2E demo mode OR development without Supabase)
      const canUseDemoSession = e2eDemoMode || (!supabaseEnabled && isDevelopment());

      if (canUseDemoSession) {
        const demoSession = typeof window !== 'undefined'
          ? sessionStorage.getItem('demo_admin_session') === 'true'
          : false;

        if (demoSession) {
          setIsAuthenticated(true);
          setIsDemoSession(true);
          setIsLoading(false);
          return;
        }

        // If on login page, allow it
        if (pathname === '/admin/login') {
          setIsLoading(false);
          return;
        }

        // In E2E demo mode or development without Supabase, redirect to login if no demo session
        // This ensures E2E tests can properly test the auth redirect
        if (e2eDemoMode || !supabaseEnabled) {
          router.push('/admin/login');
          setIsLoading(false);
          return;
        }
      }

      // Check if Supabase is configured
      if (!supabaseEnabled) {
        // Production without Supabase - redirect to login
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
        setIsLoading(false);
        return;
      }

      // Supabase authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
      } else if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      setIsLoading(false);
    };

    checkAuth();

    // Only set up Supabase subscription if configured AND not in E2E demo mode
    // Skip the listener if we're using demo session to prevent it from redirecting
    const e2eDemoMode = isE2EDemoMode();
    if (isSupabaseConfigured() && !e2eDemoMode) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [pathname, router]);

  const handleDemoToggle = () => {
    const newValue = !isDemoOverride;
    setDemoModeOverride(newValue);
    setIsDemoOverride(newValue);
    window.location.reload();
  };

  const handleLogout = async () => {
    setDemoModeOverride(false);
    if (isDemoSession) {
      // Clear demo session
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('demo_admin_session');
      }
      setIsAuthenticated(false);
      setIsDemoSession(false);
    } else {
      await supabase.auth.signOut();
    }
    router.push('/admin/login');
  };

  // Show login page without admin layout
  if (pathname === '/admin/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: List },
    { href: '/admin/events', label: 'Events', icon: List },
    { href: '/admin/events/new', label: 'Add Event', icon: Plus },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">Event Spark Admin</span>
          </Link>

          <nav className="flex items-center gap-6">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  pathname === href ? 'text-accent' : 'text-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {isDevelopment() && (
              isSupabaseConfigured() ? (
                <button
                  onClick={handleDemoToggle}
                  title={isDemoOverride ? 'Switch to live Supabase data' : 'Switch to local demo data'}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ml-2',
                    isDemoOverride
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  )}
                >
                  {isDemoOverride ? (
                    <><ToggleRight className="w-3.5 h-3.5" />Demo</>
                  ) : (
                    <><ToggleLeft className="w-3.5 h-3.5" />Live</>
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-500/10 border-amber-500/30 text-amber-400 ml-2">
                  Demo
                </span>
              )
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-red-500 transition-colors ml-4"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Demo Mode Status Bar */}
      {isDemoOverride && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400">
          Demo mode — changes are stored locally in your browser
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
