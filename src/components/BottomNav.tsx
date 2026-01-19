'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Discover', icon: Compass },
    { href: '/saved', label: 'Saved', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors',
                isActive ? 'text-accent' : 'text-muted hover:text-foreground'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
