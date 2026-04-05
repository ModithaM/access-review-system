import type { ToastOptions } from 'react-toastify';

export const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const toastVariants = {
  success: {
    ...toastConfig,
    autoClose: 3000,
  },
  error: {
    ...toastConfig,
    autoClose: 5000,
  },
  info: {
    ...toastConfig,
    autoClose: 4000,
  },
  warning: {
    ...toastConfig,
    autoClose: 4000,
  },
};
