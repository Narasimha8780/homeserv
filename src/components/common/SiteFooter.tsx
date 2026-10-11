import React from 'react';
import { Logo } from '../ui/Logo';
import { ShieldCheck } from 'lucide-react';

// Desktop/tablet only — phones use the bottom navigation instead.
export const SiteFooter: React.FC = () => (
  <footer className="hidden sm:block border-t border-line mt-auto">
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <Logo markClassName="w-7 h-7" textClassName="text-lg" />
        <p className="mt-2 text-[13px] text-ink-3">Free local services directory for every Indian city.</p>
      </div>
      <p className="flex items-center gap-1.5 text-[13px] text-ink-3">
        <ShieldCheck className="w-4 h-4" />
        Directory only — HomeServ never handles bookings or payments.
      </p>
      <p className="text-[13px] text-ink-3">© {new Date().getFullYear()} HomeServ</p>
    </div>
  </footer>
);
