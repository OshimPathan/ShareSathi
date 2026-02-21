import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
              <p className="text-sm text-slate-500">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            </div>
            {this.state.error && (
              <details className="text-left bg-slate-50 rounded-xl p-4 border border-slate-200">
                <summary className="text-xs font-medium text-slate-500 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-rose-600 whitespace-pre-wrap break-words font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-mero-teal text-white rounded-xl text-sm font-semibold hover:bg-mero-darkTeal transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
