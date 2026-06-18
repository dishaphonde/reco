import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in
        ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    >
      {type === 'success'
        ? <CheckCircle className="w-5 h-5 shrink-0" />
        : <XCircle className="w-5 h-5 shrink-0" />}
      <span>{message}</span>
    </div>
  );
};

// ─── useToast hook ────────────────────────────────────────────────────────────
interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });

  const show = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hide = () => setToast(t => ({ ...t, visible: false }));

  return { toast, show, hide };
}
