interface WebSocketMessage {
  type: string;
  data: any;
}

type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private statusHandlers: StatusHandler[] = [];
  private userId: number | null = null;
  private username: string | null = null;
  private token: string | null = null;
  private isAdmin: boolean = false;
  private adminToken: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000; // İlk yeniden bağlanma gecikmesi (ms)
  private status: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';

  // Singleton deseni için
  private static instance: WebSocketClient;

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  // WebSocket bağlantısını başlat (tamamen devre dışı)
  connect(userId: number, username: string, token: string, isAdmin: boolean = false, adminToken?: string) {
    console.log('WebSocket client completely disabled to prevent connection conflicts');
    this.updateStatus('disconnected');
    return Promise.resolve();
  }

  // Bağlantıyı sonlandır
  disconnectranslate() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.userId = null;
    this.username = null;
    this.token = null;
    this.isAdmin = false;
    this.adminToken = null;
    this.updateStatus('disconnected');
  }

  // Belirli bir mesaj tipine abone ol
  subscribe(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  // Belirli bir mesaj tipinden aboneliği kaldır
  unsubscribe(messageType: string, handler: MessageHandler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType)!;
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Bağlantı durumu değişikliklerini dinle
  onStatusChange(handler: StatusHandler) {
    this.statusHandlers.push(handler);
    // Mevcut durumu hemen bildir
    handler(this.status);
  }

  // Mesaj gönder
  sendMessage(type: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
      return true;
    }
    return false;
  }

  // Kullanıcıya doğrudan mesaj gönder
  sendDirectMessage(targetUserId: number, message: string) {
    return this.sendMessage('direct_message', {
      targetUserId,
      message
    });
  }

  // Admin yayını (yalnızca admin kullanıcılar için)
  sendAdminBroadcastranslate(message: string, type: string = 'info', targetGroup?: string) {
    if (!this.isAdmin) {
      console.error('Admin yetkisi gerekli');
      return false;
    }
    
    return this.sendMessage('admin_broadcast', {
      message,
      type,
      targetGroup
    });
  }

  // Durum güncellemesi
  getCurrentStatus() {
    return this.status;
  }

  // WebSocket bağlantı oluşturma (tamamen devre dışı)
  private createConnection() {
    console.log('WebSocket createConnection completely disabled');
    this.updateStatus('disconnected');
    return;
  }

  // Mesajı işle ve ilgili işleyicileri çağır
  private processMessage(message: WebSocketMessage) {
    // Genel 'message' handler'ları (tüm mesajları alır)
    if (this.messageHandlers.has('message')) {
      this.messageHandlers.get('message')!.forEach(handler => {
        handler(message);
      });
    }

    // Belirli mesaj tipi için handler'lar
    if (this.messageHandlers.has(message.type)) {
      this.messageHandlers.get(message.type)!.forEach(handler => {
        handler(message);
      });
    }
  }

  // Yeniden bağlanma girişimi (devre dışı)
  private attemptReconnectranslate() {
    console.log('WebSocket reconnect disabled');
    return;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maksimum yeniden bağlanma denemesi (${this.maxReconnectAttempts}) aşıldı`);
      return;
    }

    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    console.log(`${delay}ms sonra yeniden bağlanılacak (deneme ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      if (this.userId && this.username && this.token) {
        this.createConnection();
      }
    }, delay);
  }

  // Durum güncellemesi yap ve bildirimleri gönder
  private updateStatus(newStatus: 'connected' | 'disconnected' | 'connecting' | 'error') {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusHandlers.forEach(handler => {
        handler(newStatus);
      });
    }
  }
}

export const websocketClient = WebSocketClient.getInstance();