import React from 'react';
import { Menu, FileSpreadsheet, RotateCcw, Sparkles } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Button } from '../common/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const tabTitles: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  upload: 'Upload Dataset',
  profile: 'Data Profiling & Schema',
  clean: 'Cleaning Configuration & Pipeline',
  quality: 'Quality Scoring & Severity Matrix',
  analytics: 'Exploratory Analytics & Visualizations',
  reports: 'Automated Executive Report',
  export: 'Export & Downloads',
};

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { state, loadSampleDataset, resetDataset } = useData();
  const currentTitle = tabTitles[state.activeTab] || 'Dashboard';
  const hasData = Boolean(state.metadata);

  return (
    <header className="h-16 px-4 lg:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Breadcrumb navigation / Mobile menu toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <span className="hidden sm:inline font-medium text-slate-700">Data Cleaning Studio</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <span className="font-semibold text-slate-900 truncate">{currentTitle}</span>
        </div>
      </div>

      {/* Zone 2: Quiet status or file metadata */}
      {hasData && state.metadata && (
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-slate-700 truncate max-w-48">
            {state.metadata.fileName}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {state.metadata.totalRows.toLocaleString()} rows
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {state.metadata.totalColumns} columns
          </span>
        </div>
      )}

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {!hasData ? (
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleDataset}
            isLoading={state.isProcessing}
            icon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
          >
            Load Sample Dataset
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDataset}
            icon={<RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
          >
            Reset
          </Button>
        )}
      </div>
    </header>
  );
};
