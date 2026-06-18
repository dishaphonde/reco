import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    // console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-2xl w-full bg-white border border-red-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-sm text-slate-600 mt-2">A runtime error occurred while rendering the app. Details are shown below.</p>

            <div className="mt-4 bg-red-50 p-3 rounded">
              <div className="text-sm text-red-700 break-words">
                <strong>Error:</strong> {String(this.state.error?.message || 'Unknown')}
              </div>
              {this.state.errorInfo && (
                <details className="mt-2 text-xs text-slate-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </details>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Reload App
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 border border-slate-200 rounded-md"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
