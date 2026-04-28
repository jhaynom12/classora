'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

let toastId = 0;
let listeners: ((toast: ToastMessage) => void)[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
  const id = `toast-${toastId++}`;
  const toast: ToastMessage = { id, message, type, duration };
  listeners.forEach(listener => listener(toast));
  return id;
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAddToast = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);
      
      if (toast.duration) {
        const timer = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    };

    listeners.push(handleAddToast);
    return () => {
      listeners = listeners.filter(l => l !== handleAddToast);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle className="w-5 h-5 text-green-400" />,
            error: <XCircle className="w-5 h-5 text-red-400" />,
            info: <Info className="w-5 h-5 text-blue-400" />,
            warning: <AlertCircle className="w-5 h-5 text-yellow-400" />
          };

          const bgColors = {
            success: 'bg-green-500/20 border-green-500/30',
            error: 'bg-red-500/20 border-red-500/30',
            info: 'bg-blue-500/20 border-blue-500/30',
            warning: 'bg-yellow-500/20 border-yellow-500/30'
          };

          const textColors = {
            success: 'text-green-400',
            error: 'text-red-400',
            info: 'text-blue-400',
            warning: 'text-yellow-400'
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, y: -100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`pointer-events-auto mb-2 rounded-lg border backdrop-blur-xl ${bgColors[toast.type]} p-4 flex items-center gap-3`}
            >
              {icons[toast.type]}
              <span className={`text-sm font-medium ${textColors[toast.type]}`}>{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}