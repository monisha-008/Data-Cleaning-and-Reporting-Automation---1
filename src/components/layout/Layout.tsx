import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useData } from '../../hooks/useData';
import { Alert } from '../common/Alert';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, clearError } = useData();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Global Web Worker Processing Progress Bar */}
        {state.isProcessing && (
          <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs transition-all shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate font-medium">
                {state.progress?.message || 'Processing dataset in background worker...'}
              </span>
            </div>
            {state.progress && (
              <span className="tabular-nums font-mono text-slate-300 shrink-0 ml-3">
                {state.progress.percent}%
              </span>
            )}
          </div>
        )}

        {/* Error banner */}
        {state.error && (
          <div className="px-4 lg:px-8 pt-4">
            <Alert
              type="error"
              title="Execution Notice"
              message={state.error}
              onDismiss={clearError}
            />
          </div>
        )}

        {/* Page Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
