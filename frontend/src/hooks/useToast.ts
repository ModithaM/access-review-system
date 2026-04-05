import { useCallback } from 'react';
import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { toastVariants } from '@/config/toast.config';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      const toastOptions = { ...toastVariants[type], ...options };
      toast[type](message, toastOptions);
    },
    [],
  );

  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'success', options);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'error', options);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'info', options);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      showToast(message, 'warning', options);
    },
    [showToast],
  );

  return { success, error, info, warning, showToast };
};
