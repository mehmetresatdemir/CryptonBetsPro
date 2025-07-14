// WebSocket Client - Completely Disabled
// This is a stub implementation to prevent any WebSocket connection attempts

interface WebSocketMessage {
  type: string;
  data: any;
}

type MessageHandler = (message: WebSocketMessage) => void;
type StatusHandler = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;

class WebSocketClientDisabled {
  private static instance: WebSocketClientDisabled;
  private status: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';

  constructor() {
    console.log('WebSocketClient: All connections permanently disabled');
  }

  public static getInstance(): WebSocketClientDisabled {
    if (!WebSocketClientDisabled.instance) {
      WebSocketClientDisabled.instance = new WebSocketClientDisabled();
    }
    return WebSocketClientDisabled.instance;
  }

  connect(): Promise<void> {
    console.log('WebSocket connect: Disabled');
    return Promise.resolve();
  }

  disconnect() {
    console.log('WebSocket disconnect: Disabled');
  }

  subscribe() {
    console.log('WebSocket subscribe: Disabled');
  }

  unsubscribe() {
    console.log('WebSocket unsubscribe: Disabled');
  }

  onStatusChange(handler: StatusHandler) {
    handler('disconnected');
  }

  sendMessage() {
    return false;
  }

  sendDirectMessage() {
    return false;
  }

  sendAdminBroadcast() {
    return false;
  }

  getCurrentStatus() {
    return 'disconnected';
  }
}

// Export the disabled client
export const websocketClient = WebSocketClientDisabled.getInstance();