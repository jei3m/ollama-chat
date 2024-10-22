// @/components/ui/use-toast.tsx
import { useState } from 'react';
import { Toast, ToastTitle, ToastDescription, ToastClose } from './toast';

export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; title: string; description: string; variant: 'default' | 'destructive' }[]>([]);

  const toast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000); // Remove toast after 5 seconds
  };

  return {
    toasts,
    toast,
  };
}