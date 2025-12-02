import { useState, useEffect, useCallback } from "react";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('system_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('system_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('system_notifications');
      if (saved) setNotifications(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addNotification = useCallback((notification: Omit<SystemNotification, "id" | "time" | "read">) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep max 50
    return newNotification;
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
};
