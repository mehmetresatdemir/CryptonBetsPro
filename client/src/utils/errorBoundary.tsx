import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Error reporting servisine gönder (production için)
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Burada error tracking servisi kullanabilirsiniz
    // Örnek: Sentry, LogRocket, etc.
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Local storage'a kaydet (geliştirme için)
      const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
      errorLog.push(errorData);
      
      // Son 10 hatayı tut
      if (errorLog.length > 10) {
        errorLog.shift();
      }
      
      localStorage.setItem('errorLog', JSON.stringify(errorLog));
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 text-center border border-red-500/20">
            <div className="mb-4">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Bir Hata Oluştu
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya tekrar deneyin.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-gray-900 rounded text-left text-xs">
                <p className="text-red-400 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-gray-400 mt-2 text-xs overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Tekrar Dene
              </Button>
              
              <Button
                onClick={this.handleReload}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Sayfayı Yenile
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC version for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};