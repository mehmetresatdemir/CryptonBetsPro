import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
// import { websocketClient } from '@/utils/websocket-disabled'; // Completely disabled WebSocket

// WebSocket mesaj tiplerini tanımla
export interface WebSocketMessage {
  type: string;
  data: any;
}

// Bildirim tipini tanımla
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

// WebSocket bağlantı durumu tipini tanımla
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

// Sohbet mesajı tipini tanımla
export interface ChatMessage {
  id: string;
  sender: {
    id: number;
    username: string;
    isAdmin?: boolean;
  };
  message: string;
  timestamp: Date;
}

// WebSocket Context tipini tanımla
interface WebSocketContextType {
  status: ConnectionStatus;
  notifications: Notification[];
  chatMessages: ChatMessage[];
  unreadNotificationsCount: number;
  connect: (userId: number, username: string, token: string, isAdmin?: boolean, adminToken?: string) => void;
  disconnect: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  sendChatMessage: (targetUserId: number, message: string) => boolean;
  sendBroadcast: (message: string, type?: string, targetGroup?: string) => boolean;
  clearChatMessages: () => void;
}

// Context oluştur
const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Context Provider bileşeni
export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Okunmamış bildirim sayısını hesapla
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // WebSocket bağlantısını tamamen devre dışı bırak
  useEffect(() => {
    setStatus('disconnected');
    console.log('WebSocket Context: All connections disabled');
    
    return () => {
      // Temizleme işlemleri
    };
  }, []);

  // WebSocket bağlantısı kur (tamamen devre dışı)
  const connect = (userId: number, username: string, token: string, isAdmin: boolean = false, adminToken?: string) => {
    console.log('WebSocket bağlantısı devre dışı:', { userId, username, isAdmin });
    setStatus('disconnected');
  };

  // WebSocket bağlantısını kapat (geçici olarak devre dışı)
  const disconnect = () => {
    console.log('WebSocket bağlantısı kapatıldı');
    // WebSocket API entegrasyonu hazır olduğunda etkinleştirilecek
    // websocketClient.disconnect();
  };

  // Bildirimi okundu olarak işaretle
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Sohbet mesajı gönder (geçici olarak simüle ediliyor)
  const sendChatMessage = (targetUserId: number, message: string): boolean => {
    console.log('Mesaj gönderiliyor:', { targetUserId, message });
    // Gerçek implementasyon hazır olduğunda değiştirilecek
    // return websocketClient.sendDirectMessage(targetUserId, message);
    return true;
  };

  // Yayın mesajı gönder (geçici olarak simüle ediliyor)
  const sendBroadcast = (message: string, type: string = 'info', targetGroup?: string): boolean => {
    console.log('Broadcast gönderiliyor:', { message, type, targetGroup });
    // Gerçek implementasyon hazır olduğunda değiştirilecek
    // return websocketClient.sendAdminBroadcast(message, type, targetGroup);
    return true;
  };

  // Sohbet mesajlarını temizle
  const clearChatMessages = () => {
    setChatMessages([]);
  };

  const contextValue = {
    status,
    notifications,
    chatMessages,
    unreadNotificationsCount,
    connect,
    disconnect,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendChatMessage,
    sendBroadcast,
    clearChatMessages
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom Hook oluştur
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket hook must be used within a WebSocketProvider');
  }
  return context;
};