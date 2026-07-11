import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string, title?: string) => void;
  removeNotification: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback((type: Notification['type'], message: string, title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    const toastFn = {
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
    }[type];

    toastFn(message, {
      id,
      duration: 5000,
      ...(title && { description: title }),
    });

    setNotifications((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => removeNotification(id), 5000);
  }, [removeNotification]);

  const success = useCallback((message: string, title?: string) => {
    addNotification('success', message, title);
  }, [addNotification]);

  const error = useCallback((message: string, title?: string) => {
    addNotification('error', message, title);
  }, [addNotification]);

  const warning = useCallback((message: string, title?: string) => {
    addNotification('warning', message, title);
  }, [addNotification]);

  const info = useCallback((message: string, title?: string) => {
    addNotification('info', message, title);
  }, [addNotification]);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};