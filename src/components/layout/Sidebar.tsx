import React from 'react';
import {
  UploadCloud,
  LayoutDashboard,
  TableProperties,
  Sparkles,
  ShieldCheck,
  BarChart3,
  FileText,
  Download,
  RotateCcw,
  Database,
  ChevronRight,
  X,
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { AppNavigationTab } from '../../reducers/dataReducer';
import { formatNumber } from '../../utils/formatters';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: AppNavigationTab;
  label: string;
  icon: React.ReactNode;
  requiresData: boolean;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    requiresData: false,
    description: 'Executive overview & status',
  },
  {
    id: 'upload',
    label: 'Upload Data',
    icon: <UploadCloud className="w-4 h-4" />,
    requiresData: false,
    description: 'CSV, XLSX, XLS import',
  },
  {
    id: 'profile',
    label: 'Data Profile',
    icon: <TableProperties className="w-4 h-4" />,
    requiresData: true,
    description: 'Column stats & data table',
  },
  {
    id: 'clean',
    label: 'Clean Data',
    icon: <Sparkles className="w-4 h-4" />,
    requiresData: true,
    description: 'Deduplicate, impute & fix',
  },
  {
    id: 'quality',
    label: 'Data Quality',
    icon: <ShieldCheck className="w-4 h-4" />,
    requiresData: true,
    description: 'Quality score & severity',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-4 h-4" />,
    requiresData: true,
    description: 'Interactive charts & KPIs',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <FileText className="w-4 h-4" />,
    requiresData: true,
    description: 'Automated executive report',
  },
  {
    id: 'export',
    label: 'Export',
    icon: <Download className="w-4 h-4" />,
    requiresData: true,
    description: 'Cleaned data download',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state, setTab, resetDataset } = useData();
  const hasData = Boolean(state.metadata);

  const handleNavClick = (item: NavItem) => {
    if (item.requiresData && !hasData) return;
    setTab(item.id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Application navigation"
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
              DQ
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                DATA CLEANING
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block uppercase">
                &amp; Automation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workflow Pipeline
          </div>
          {navItems.map((item) => {
            const isActive = state.activeTab === item.id;
            const isDisabled = item.requiresData && !hasData;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : isDisabled
                    ? 'text-slate-300 hover:bg-transparent cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isDisabled ? 'Upload a dataset to unlock this step' : item.description}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`shrink-0 ${
                      isActive ? 'text-white' : isDisabled ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                {isDisabled && (
                  <span className="text-[10px] text-slate-300 font-normal">Locked</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dataset Quick Summary & Reset */}
        {hasData && state.metadata && (
          <div className="p-3 mx-3 mb-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 truncate" title={state.metadata.fileName}>
                {state.metadata.fileName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 pb-2 border-b border-slate-200">
              <div>
                Rows:{' '}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatNumber(state.metadata.totalRows)}
                </span>
              </div>
              <div>
                Cols:{' '}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatNumber(state.metadata.totalColumns)}
                </span>
              </div>
              <div>
                Score:{' '}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {state.quality ? `${state.quality.overallScore}/100` : 'N/A'}
                </span>
              </div>
              <div>
                Issues:{' '}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {state.quality ? formatNumber(state.quality.totalIssues) : '0'}
                </span>
              </div>
            </div>
            <button
              onClick={resetDataset}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-1 rounded transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Dataset</span>
            </button>
          </div>
        )}

        {/* Privacy footnote */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 leading-normal bg-white">
          <p className="font-medium text-slate-600">Local Browser Sandbox</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Zero telemetry. No uploaded dataset ever leaves your browser.
          </p>
        </div>
      </aside>
    </>
  );
};
