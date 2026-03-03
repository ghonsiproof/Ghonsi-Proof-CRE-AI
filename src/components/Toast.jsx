import React, { createContext, useContext, useState, useCallback } from 'react';

// Create context for toast
const ToastContext = createContext(null);

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return mock functions if not wrapped in provider
    return {
      toasts: [],
      addToast: (message, type) => console.log(`[Toast ${type}]: ${message}`),
      removeToast: () => {},
    };
  }
  return context;
}

// Toast container component - render these in your app
export function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/40 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/40 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-circle-exclamation';
      case 'warning':
        return 'fa-triangle-exclamation';
      default:
        return 'fa-circle-info';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
            animate-[slideIn_0.3s_ease-out] backdrop-blur-md
            ${getToastStyles(toast.type)}
          `}
        >
          <i className={`fa-solid ${getIcon(toast.type)} text-lg`}></i>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-xmark text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
