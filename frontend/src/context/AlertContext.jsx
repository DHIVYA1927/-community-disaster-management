import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setAlerts(res.data.notifications || []);
      setUnreadAlertsCount(res.data.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications/alerts:', err.message);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        toasts,
        alerts,
        unreadAlertsCount,
        showToast,
        removeToast,
        refreshAlerts: fetchAlerts
      }}
    >
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 rounded-lg shadow-lg border text-sm transition-all transform ease-out duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex-1 font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-700 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
