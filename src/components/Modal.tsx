'use client';

import { useEffect } from 'react';

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`bg-white rounded-2xl p-6 w-full ${maxWidth} shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}
