// WebSocket Override - Prevent all WebSocket connections
// This file completely disables WebSocket functionality to prevent connection errors

// Override global WebSocket constructor to prevent any connections
if (typeof window !== 'undefined') {
  const originalWebSocket = window.WebSocket;
  
  // Replace WebSocket constructor with a disabled version
  window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
    console.log('WebSocket connection prevented:', url);
    
    // Create a fake WebSocket that immediately closes
    const fakeSocket = {
      readyState: 3, // CLOSED
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      url: url.toString(),
      protocol: '',
      extensions: '',
      bufferedAmount: 0,
      binaryType: 'blob' as BinaryType,
      
      // Event handlers
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      
      // Methods
      close: () => {
        console.log('WebSocket close called (disabled)');
      },
      send: () => {
        console.log('WebSocket send called (disabled)');
        throw new Error('WebSocket disabled');
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    };
    
    // Immediately trigger error to prevent hanging
    setTimeout(() => {
      if (fakeSocket.onerror) {
        fakeSocket.onerror(new Event('error'));
      }
    }, 0);
    
    return fakeSocket as any;
  } as any;
  
  // Copy static properties
  window.WebSocket.CONNECTING = originalWebSocket.CONNECTING;
  window.WebSocket.OPEN = originalWebSocket.OPEN;
  window.WebSocket.CLOSING = originalWebSocket.CLOSING;
  window.WebSocket.CLOSED = originalWebSocket.CLOSED;
  
  console.log('WebSocket constructor overridden to prevent connections');
}

export {};