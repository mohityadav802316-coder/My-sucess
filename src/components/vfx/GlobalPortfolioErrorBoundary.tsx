import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalPortfolioErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Portfolio Global Crash Guard caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleSafeReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('mohit_profile_photo');
      localStorage.setItem('mohit_low_effects', 'true');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner">
              ⚡
            </div>
            <div className="space-y-1">
              <h2 className="font-cyber font-black text-xl text-white tracking-wider">
                PORTFOLIO RECOVERY SHIELD
              </h2>
              <p className="text-xs text-amber-300 font-mono">
                अपेक्षित रेंडरिंग सुरक्षा कवच (Auto-Recovered)
              </p>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              वेबसाइट में एक घटक को रेंडर करते समय रुकावट आई। सुरक्षा प्रणाली ने क्रैश को रोक लिया है।
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-lg shadow-amber-500/20"
              >
                Reload (पुनः लोड)
              </button>
              <button
                onClick={this.handleSafeReset}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer transition border border-slate-700"
              >
                Fast Mode Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
