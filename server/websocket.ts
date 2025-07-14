import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

// WebSocket bağlantılarını saklamak için harita
interface UserConnection {
  userId: number;
  username: string;
  socket: WebSocket;
  lastActivity: Date;
}

interface Message {
  type: string;
  data: any;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private connections: Map<WebSocket, UserConnection> = new Map();

  // Kullanıcı kimliğine göre bağlantıları takip eden harita
  private userConnections: Map<number, WebSocket[]> = new Map();
  
  // Tüm admin bağlantılarını takip eden dizi
  private adminConnections: WebSocket[] = [];

  // WebSocket sunucusunu başlat
  init(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      perMessageDeflate: false,
      maxPayload: 1024 * 1024 // 1MB max payload
    });
    log('WebSocket sunucusu başlatıldı', 'websocket');
    
    this.wss.on('connection', (socket: WebSocket) => {
      log('Yeni WebSocket bağlantısı', 'websocket');

      // Set socket timeout to prevent hanging connections
      socket.on('ping', () => {
        socket.pong();
      });

      // Her 25 saniyede bir ping gönder - bağlantıyı canlı tutmak için
      const pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 25000);

      // Connection error handling
      socket.on('error', (error) => {
        log(`WebSocket error: ${error.message}`, 'websocket');
        clearInterval(pingInterval);
        this.cleanupConnection(socket);
      });

      // Kullanıcı mesajlarını dinle
      socket.on('message', (message: Buffer) => {
        try {
          const parsedMessage: Message = JSON.parse(message.toString());
          this.handleMessage(socket, parsedMessage);
        } catch (error) {
          log(`Geçersiz mesaj formatı: ${error}`, 'websocket');
          this.sendError(socket, 'Geçersiz mesaj formatı');
        }
      });

      // Bağlantı kapandığında temizle
      socket.on('close', () => {
        log('WebSocket bağlantısı kapandı', 'websocket');
        clearInterval(pingInterval);
        this.cleanupConnection(socket);
      });

      // Ping-pong yanıtlarını işle
      socket.on('pong', () => {
        const connection = this.connections.get(socket);
        if (connection) {
          connection.lastActivity = new Date();
        }
      });
    });

    // Düzenli aralıklarla zaman aşımına uğrayan bağlantıları temizle
    setInterval(() => {
      const now = new Date();
      this.connections.forEach((connection, socket) => {
        const inactiveTime = now.getTime() - connection.lastActivity.getTime();
        
        // 5 dakika (300000 ms) inaktif olan bağlantıları kapat
        if (inactiveTime > 300000 && socket.readyState === WebSocket.OPEN) {
          log(`Zaman aşımı: ${connection.username} (${connection.userId})`, 'websocket');
          socket.close();
        }
      });
    }, 60000); // Her dakika kontrol et
  }

  // Gelen mesajları işle
  private handleMessage(socket: WebSocket, message: Message) {
    switch (message.type) {
      case 'auth':
        this.handleAuth(socket, message.data);
        break;
      
      case 'admin_auth':
        this.handleAdminAuth(socket, message.data);
        break;
      
      case 'admin_broadcast':
        this.handleAdminBroadcast(socket, message.data);
        break;
      
      case 'direct_message':
        this.handleDirectMessage(socket, message.data);
        break;
        
      default:
        this.sendError(socket, 'Bilinmeyen mesaj tipi');
    }
  }

  // Kullanıcı kimlik doğrulama
  private handleAuth(socket: WebSocket, data: any) {
    // Kullanıcı bilgilerini doğrula
    const { userId, username, token } = data;
    
    if (!userId || !username) {
      return this.sendError(socket, 'Eksik kimlik bilgileri');
    }
    
    // Not: Gerçek senaryoda token doğrulaması yapılmalıdır
    
    // Bağlantıyı kaydet
    this.connections.set(socket, {
      userId,
      username,
      socket,
      lastActivity: new Date()
    });
    
    // Kullanıcı bağlantılarını güncelle
    const userSockets = this.userConnections.get(userId) || [];
    userSockets.push(socket);
    this.userConnections.set(userId, userSockets);
    
    log(`Kullanıcı bağlandı: ${username} (${userId})`, 'websocket');
    
    // Başarılı kimlik doğrulama yanıtı
    this.send(socket, {
      type: 'auth_success',
      data: {
        userId,
        username,
        timestamp: new Date().toISOString()
      }
    });
    
    // Adminlere kullanıcının çevrimiçi olduğunu bildir
    this.broadcastToAdmins({
      type: 'user_status',
      data: {
        userId,
        username,
        status: 'online',
        timestamp: new Date().toISOString()
      }
    });
  }

  // Admin kimlik doğrulama
  private handleAdminAuth(socket: WebSocket, data: any) {
    const { userId, username, adminToken } = data;
    
    if (!userId || !username || !adminToken) {
      return this.sendError(socket, 'Eksik admin kimlik bilgileri');
    }
    
    // Not: Gerçek senaryoda admin token doğrulaması yapılmalıdır
    
    // Admin bağlantısını kaydet
    this.connections.set(socket, {
      userId,
      username,
      socket,
      lastActivity: new Date()
    });
    
    // Admin bağlantılarına ekle
    this.adminConnections.push(socket);
    
    log(`Admin bağlandı: ${username} (${userId})`, 'websocket');
    
    // Başarılı kimlik doğrulama yanıtı
    this.send(socket, {
      type: 'admin_auth_success',
      data: {
        userId,
        username,
        timestamp: new Date().toISOString()
      }
    });
    
    // Çevrimiçi kullanıcı sayısını gönder
    this.send(socket, {
      type: 'online_users_count',
      data: {
        count: this.userConnections.size,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Admin tarafından genel bir mesaj yayınlama
  private handleAdminBroadcast(socket: WebSocket, data: any) {
    const connection = this.connections.get(socket);
    
    if (!connection) {
      return this.sendError(socket, 'Oturum bulunamadı');
    }
    
    if (!this.adminConnections.includes(socket)) {
      return this.sendError(socket, 'Admin yetkisi gerekli');
    }
    
    const { message, type, targetGroup } = data;
    
    if (!message) {
      return this.sendError(socket, 'Mesaj içeriği gerekli');
    }
    
    log(`Admin yayını: ${connection.username} (${connection.userId})`, 'websocket');
    
    // Tüm kullanıcılara veya hedef gruba mesaj gönder
    this.broadcastToUsers({
      type: 'admin_notification',
      data: {
        adminId: connection.userId,
        adminUsername: connection.username,
        message,
        notificationType: type || 'info',
        targetGroup,
        timestamp: new Date().toISOString()
      }
    }, targetGroup);
    
    // Başarılı yanıt
    this.send(socket, {
      type: 'broadcast_success',
      data: {
        timestamp: new Date().toISOString()
      }
    });
  }

  // Doğrudan mesaj gönderme
  private handleDirectMessage(socket: WebSocket, data: any) {
    const connection = this.connections.get(socket);
    
    if (!connection) {
      return this.sendError(socket, 'Oturum bulunamadı');
    }
    
    const { targetUserId, message } = data;
    
    if (!targetUserId || !message) {
      return this.sendError(socket, 'Hedef kullanıcı ID ve mesaj gerekli');
    }
    
    // Hedef kullanıcıya mesaj gönder
    const targetSockets = this.userConnections.get(targetUserId);
    
    if (!targetSockets || targetSockets.length === 0) {
      return this.sendError(socket, 'Hedef kullanıcı çevrimdışı veya bulunamadı');
    }
    
    for (const targetSocket of targetSockets) {
      if (targetSocket.readyState === WebSocket.OPEN) {
        this.send(targetSocket, {
          type: 'direct_message',
          data: {
            fromUserId: connection.userId,
            fromUsername: connection.username,
            message,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    // Başarılı yanıt
    this.send(socket, {
      type: 'message_sent',
      data: {
        targetUserId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Tek bir socket'e JSON mesajı gönder
  private send(socket: WebSocket, message: any) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  // Hata mesajı gönder
  private sendError(socket: WebSocket, errorMessage: string) {
    this.send(socket, {
      type: 'error',
      data: {
        message: errorMessage,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Bağlantıyı temizle
  private cleanupConnection(socket: WebSocket) {
    const connection = this.connections.get(socket);
    
    if (connection) {
      // Kullanıcı bağlantı haritasından kaldır
      const userSockets = this.userConnections.get(connection.userId);
      if (userSockets) {
        const updatedSockets = userSockets.filter(s => s !== socket);
        if (updatedSockets.length > 0) {
          this.userConnections.set(connection.userId, updatedSockets);
        } else {
          this.userConnections.delete(connection.userId);
        }
      }
      
      // Admin bağlantılarından kaldır
      const adminIndex = this.adminConnections.indexOf(socket);
      if (adminIndex > -1) {
        this.adminConnections.splice(adminIndex, 1);
      }
      
      // Ana bağlantı haritasından kaldır
      this.connections.delete(socket);
      
      log(`Bağlantı temizlendi: ${connection.username} (${connection.userId})`, 'websocket');
    }
  }

  // Tüm kullanıcılara mesaj yayınla (isteğe bağlı hedef grup)
  broadcastToUsers(message: any, targetGroup?: string) {
    const messageStr = JSON.stringify(message);
    
    // Bağlantı yoksa, işlemi atla
    if (this.userConnections.size === 0) {
      log('Yayın yapılacak kullanıcı bağlantısı yok', 'websocket');
      return;
    }
    
    this.userConnections.forEach((sockets) => {
      for (const socket of sockets) {
        try {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(messageStr);
          }
        } catch (error) {
          log(`Mesaj gönderme hatası: ${error}`, 'websocket');
        }
      }
    });
  }

  // Tüm adminlere mesaj yayınla
  broadcastToAdmins(message: any) {
    const messageStr = JSON.stringify(message);
    
    // Bağlantı yoksa, işlemi atla
    if (this.adminConnections.length === 0) {
      log('Yayın yapılacak admin bağlantısı yok', 'websocket');
      return;
    }
    
    for (const socket of this.adminConnections) {
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(messageStr);
        }
      } catch (error) {
        log(`Admin'e mesaj gönderme hatası: ${error}`, 'websocket');
      }
    }
  }

  // Doğrudan kullanıcıya mesaj gönder (sunucu tarafı API'dan çağrılabilir)
  sendToUser(userId: number, message: any) {
    const userSockets = this.userConnections.get(userId) || [];
    const messageStr = JSON.stringify(message);
    
    if (userSockets.length === 0) {
      log(`Kullanıcı ID ${userId} için aktif bağlantı bulunamadı`, 'websocket');
      return false;
    }
    
    let success = false;
    for (const socket of userSockets) {
      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(messageStr);
          success = true;
        }
      } catch (error) {
        log(`Kullanıcıya mesaj gönderme hatası (ID: ${userId}): ${error}`, 'websocket');
      }
    }
    
    return success;
  }
}

// Tek bir örnek oluştur (singleton)
export const websocketManager = new WebSocketManager();