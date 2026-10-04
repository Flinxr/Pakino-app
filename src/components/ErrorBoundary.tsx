import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 my-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              {this.props.fallbackTitle || 'خطایی در نمایش این بخش رخ داده است'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {this.state.error?.message || 'لطفاً صفحه را دوباره بارگذاری کنید یا تب دیگری را انتخاب نمایید.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تلاش مجدد</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
