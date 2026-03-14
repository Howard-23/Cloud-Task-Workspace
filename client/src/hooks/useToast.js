import { createContext, createElement, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

function createToast(toast) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variant: 'info',
    duration: 4000,
    ...toast,
  };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function dismissToast(id) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }

  function pushToast(toast) {
    const nextToast = createToast(toast);
    setToasts((currentToasts) => [...currentToasts, nextToast]);

    window.setTimeout(() => {
      dismissToast(nextToast.id);
    }, nextToast.duration);

    return nextToast.id;
  }

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
      success: (message, title = 'Success') => pushToast({ title, message, variant: 'success' }),
      error: (message, title = 'Something went wrong') =>
        pushToast({ title, message, variant: 'error', duration: 5000 }),
      info: (message, title = 'Heads up') => pushToast({ title, message, variant: 'info' }),
    }),
    [toasts],
  );

  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }

  return context;
}
