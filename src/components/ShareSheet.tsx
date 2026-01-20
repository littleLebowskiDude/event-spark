'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Check, Facebook, Mail } from 'lucide-react';
import { SocialShareUrls } from '@/lib/share';
import { cn } from '@/lib/utils';

// Custom X (Twitter) icon since lucide doesn't have the new X logo
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// WhatsApp icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  socialUrls: SocialShareUrls;
  shareUrl: string;
  isCopied: boolean;
  onCopy: () => void;
}

export default function ShareSheet({
  isOpen,
  onClose,
  socialUrls,
  isCopied,
  onCopy,
}: ShareSheetProps) {
  const shareOptions: ShareOption[] = [
    {
      id: 'copy',
      label: isCopied ? 'Copied!' : 'Copy Link',
      icon: isCopied ? <Check className="w-6 h-6" /> : <Link2 className="w-6 h-6" />,
      color: isCopied ? 'bg-green-500' : 'bg-gray-600',
      onClick: onCopy,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="w-6 h-6" />,
      color: 'bg-[#1877F2]',
      onClick: () => window.open(socialUrls.facebook, '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'twitter',
      label: 'X',
      icon: <XIcon className="w-5 h-5" />,
      color: 'bg-black',
      onClick: () => window.open(socialUrls.twitter, '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="w-6 h-6" />,
      color: 'bg-[#25D366]',
      onClick: () => window.open(socialUrls.whatsapp, '_blank', 'noopener,noreferrer'),
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-6 h-6" />,
      color: 'bg-gray-500',
      onClick: () => window.location.href = socialUrls.email,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl p-6 pb-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Share Event</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Share Options Grid */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.onClick}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105',
                      option.color
                    )}
                  >
                    {option.icon}
                  </div>
                  <span className="text-xs text-muted group-hover:text-foreground transition-colors">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-full font-medium transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
