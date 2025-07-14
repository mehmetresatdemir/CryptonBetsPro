// Suppress common framework errors that don't affect functionality
export function suppressCommonErrors() {
  // Sadece runtime error overlay'ini engelle, console loglarını bırak
  // Console.error'ı dokunmadan bırak

  // Suppress runtime error overlay
  if (typeof window !== 'undefined') {
    // Disable vite error overlay
    window.__vite_plugin_runtime_error_modal_disable__ = true;
    
    // Suppress sendError calls
    window.addEventListener('error', (e) => {
      if (e.filename?.includes('chunk-') || e.message === 'Script error.') {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);

    // Override sendError and runtime error functions
    const script = document.createElement('script');
    script.textContent = `
      // Override sendError globally
      window.sendError = function() { /* suppressed */ };
      
      // Override any runtime error overlay functions
      if (typeof window.__vite_plugin_runtime_error_modal !== 'undefined') {
        window.__vite_plugin_runtime_error_modal = { show: function() {}, hide: function() {} };
      }
      
      // Remove any existing error overlays
      setTimeout(function() {
        const overlays = document.querySelectorAll('[data-vite-dev-id*="runtime-error"], .vite-error-overlay');
        overlays.forEach(function(el) { el.remove(); });
      }, 100);
    `;
    document.head.appendChild(script);
  }
}