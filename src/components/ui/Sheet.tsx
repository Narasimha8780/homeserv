import React, { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { pushBackHandler } from '../../utils/backStack';

// Open sheets, top-most last — only the top one reacts to Escape.
const openSheets: symbol[] = [];

// One overlay primitive for the whole app: a bottom sheet on phones (thumb-friendly,
// feels native in the Android app) and a centred dialog / right drawer on larger screens.
// Handles Escape, the Android Back button, background scroll lock and focus.
export const Sheet: React.FC<{
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  placement?: 'center' | 'right';
  widthClass?: string;
}> = ({ open, onClose, label, children, placement = 'center', widthClass = 'sm:max-w-lg' }) => {
  const closeRef = useRef(onClose);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const token = Symbol(label);
    openSheets.push(token);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';

    const removeBack = pushBackHandler(() => {
      closeRef.current();
      return true;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openSheets[openSheets.length - 1] === token) closeRef.current();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      removeBack();
      window.removeEventListener('keydown', onKey);
      openSheets.splice(openSheets.indexOf(token), 1);
      if (openSheets.length === 0) document.body.style.overflow = '';
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, label]);

  if (!open) return null;

  const isRight = placement === 'right';
  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex items-end ${
        isRight ? 'sm:items-stretch sm:justify-end' : 'sm:items-center sm:justify-center sm:p-6'
      }`}
    >
      <div className="absolute inset-0 bg-scrim backdrop-blur-[3px] animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative flex w-full flex-col overflow-hidden bg-surface-solid border border-line shadow-pop outline-none max-h-[92dvh] rounded-t-[28px] animate-sheet-up ${
          isRight
            ? 'sm:h-full sm:max-h-none sm:w-[400px] sm:rounded-none sm:rounded-l-[28px] sm:animate-drawer-in'
            : `${widthClass} sm:rounded-[28px] sm:max-h-[88dvh] sm:animate-pop-in`
        }`}
      >
        <div className="sm:hidden absolute top-0 inset-x-0 z-10 flex justify-center pt-2.5 pointer-events-none" aria-hidden="true">
          <span className="h-1.5 w-10 rounded-full bg-ink/20" />
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

export const SheetHeader: React.FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  onClose: () => void;
}> = ({ title, subtitle, icon, onClose }) => (
  <div className="flex items-start gap-3 px-5 pt-6 sm:pt-5 pb-3 shrink-0">
    {icon && (
      <span className="w-11 h-11 rounded-2xl bg-accent-soft text-accent-ink flex items-center justify-center shrink-0">{icon}</span>
    )}
    <div className="min-w-0 flex-1 pt-0.5">
      <h2 className="text-lg font-bold text-ink leading-tight">{title}</h2>
      {subtitle && <p className="text-[13px] text-ink-3 mt-0.5">{subtitle}</p>}
    </div>
    <button onClick={onClose} className="icon-btn w-9 h-9" aria-label="Close">
      <X className="w-[18px] h-[18px]" />
    </button>
  </div>
);

export const SheetBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex-1 overflow-y-auto overscroll-contain custom-scrollbar ${className}`}>{children}</div>
);

export const SheetFooter: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`shrink-0 border-t border-line bg-surface-solid px-4 pt-3 pb-[calc(0.75rem+var(--sa-bottom))] sm:pb-4 ${className}`}>
    {children}
  </div>
);
