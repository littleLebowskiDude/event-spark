'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured, isDevelopment } from '@/lib/env';
import { Sparkles, LogOut, List, Plus, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const checkAuth = async () => {
      const supabaseEnabled = isSupabaseConfigured();

      // Check if Supabase is configured
      if (!supabaseEnabled) {
        // Demo mode - only in development with session check
        if (isDevelopment()) {
          const demoSession = typeof window !== 'undefined'
            ? sessionStorage.getItem('demo_admin_session') === 'true'
            : false;

          if (demoSession || pathname === '/admin/login') {
            setIsAuthenticated(demoSession);
            setIsDemoSession(demoSession);
          } else {
            router.push('/admin/login');
          }
        } else {
          // Production without Supabase - redirect to login
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
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

    // Only set up Supabase subscription if configured
    if (isSupabaseConfigured()) {
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

  const handleLogout = async () => {
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
