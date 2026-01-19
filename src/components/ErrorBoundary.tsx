'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for catching and handling React errors.
 * Provides a fallback UI and error reporting capabilities.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service
    reportError(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted mb-6">
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-background rounded-lg text-sm">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-red-500 overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap text-muted overflow-auto max-h-40 mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Report error to external error tracking service.
 * Integrates with Sentry or other error tracking services.
 */
export function reportError(error: Error, errorInfo?: ErrorInfo): void {
  // Log to console in all environments
  console.error('[Error Report]', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  });

  // Report to Sentry if configured
  // Uncomment and configure when Sentry is set up:
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   Sentry.captureException(error, {
  //     extra: {
  //       componentStack: errorInfo?.componentStack,
  //     },
  //   });
  // }

  // You can also send to a custom error logging endpoint:
  // if (process.env.NODE_ENV === 'production') {
  //   fetch('/api/log-error', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       message: error.message,
  //       stack: error.stack,
  //       componentStack: errorInfo?.componentStack,
  //       url: window.location.href,
  //       userAgent: navigator.userAgent,
  //       timestamp: new Date().toISOString(),
  //     }),
  //   }).catch(() => {
  //     // Silently fail - don't crash on error reporting failure
  //   });
  // }
}

/**
 * Hook for reporting errors in functional components.
 * Use this to report errors that don't crash the component.
 */
export function useErrorReporter() {
  return {
    reportError: (error: Error, context?: Record<string, unknown>) => {
      console.error('[Error]', error, context);
      reportError(error);
    },
    reportWarning: (message: string, context?: Record<string, unknown>) => {
      console.warn('[Warning]', message, context);
      // Optionally report warnings to error tracking service
    },
  };
}

export default ErrorBoundary;
