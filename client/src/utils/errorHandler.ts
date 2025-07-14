// Global error handler
export function setupGlobalErrorHandling() {
  // Uncaught errors - sadece overlay engellemek için
  window.addEventListener('error', (event) => {
    // Script error'ları logla ama overlay'i engelle
    console.error('Global error:', event.error);
    
    if (event.error && event.error.message !== 'Script error.') {
      console.error('Error details:', {
        message: event.error.message,
        stack: event.error.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent default browser behavior
    event.preventDefaultranslate();
  });

  // React error boundary fallback
  window.addEventListener('beforeunload', () => {
    // Cleanup any resources before page unload
  });
}

// Safely handle async operations
export function safeAsync<T>(
  fn: () => Promise<T>, 
  fallback?: T
): Promise<T | undefined> {
  return fn().catch((error) => {
    console.error('Async operation failed:', error);
    return fallback;
  });
}

// Safe DOM operations
export function safeQuery(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch (error) {
    console.warn('DOM query failed:', selector, error);
    return null;
  }
}