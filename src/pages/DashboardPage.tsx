import React from 'react';
import { useData } from '../hooks/useData';
import {
  UploadCloud,
  TableProperties,
  Sparkles,
  ShieldCheck,
  BarChart3,
  FileText,
  Download,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { formatNumber } from '../utils/formatters';

const workflowSteps = [
  { step: 1, name: 'Upload', tab: 'upload' as const, desc: 'CSV, XLSX, XLS with multi-sheet support' },
  { step: 2, name: 'Profile', tab: 'profile' as const, desc: 'Column schema, stats, and interactive table' },
  { step: 3, name: 'Detect Issues', tab: 'profile' as const, desc: 'Nulls, duplicates, outliers, and invalid types' },
  { step: 4, name: 'Clean', tab: 'clean' as const, desc: 'Configurable pipeline with replayable logs' },
  { step: 5, name: 'Validate', tab: 'quality' as const, desc: 'Severity matrix and quality score verification' },
  { step: 6, name: 'Analyze', tab: 'analytics' as const, desc: 'Interactive KPIs and visual distributions' },
  { step: 7, name: 'Report', tab: 'reports' as const, desc: 'Automated executive summary and print PDF' },
  { step: 8, name: 'Export', tab: 'export' as const, desc: 'Clean CSV, clean Excel, or filtered data' },
];

export const DashboardPage: React.FC = () => {
  const { state, setTab, loadSampleDataset } = useData();
  const metadata = state.metadata;
  const quality = state.quality;
  const hasData = Boolean(metadata);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
            Browser-Based Data Engineering
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Clean Data. Discover Insights. Automate Reports.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            A production-grade, privacy-first data quality workstation. Profile schemas, standardize values, isolate anomalies, and generate executive reports without transmitting a single byte to an external server.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            {!hasData ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setTab('upload')}
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  Upload Your Dataset
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={loadSampleDataset}
                  isLoading={state.isProcessing}
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                  icon={<Sparkles className="w-4 h-4 text-amber-400" />}
                >
                  Load 500-Row Sample
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => setTab('profile')}
                className="bg-white text-slate-900 hover:bg-slate-100"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue Pipeline to Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dataset Quick Summary Card (if active) */}
      {hasData && metadata && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Active Dataset: {metadata.fileName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsed on {new Date(metadata.parsedAt).toLocaleTimeString()} · Sheet: {metadata.activeSheet}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTab('profile')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Data Profile
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <span className="text-xs text-slate-500 block">Total Records</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatNumber(metadata.totalRows)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Columns Detected</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {metadata.totalColumns}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Quality Baseline</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {quality ? `${quality.overallScore}/100` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Pending Issues</span>
              <span className="text-lg font-bold text-amber-600 tabular-nums">
                {quality ? formatNumber(quality.totalIssues) : '0'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Architecture Stepper */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Workflow Roadmap</h2>
          <p className="text-xs text-slate-500">
            End-to-end data preparation lifecycle executed in pure client-side Web Workers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {workflowSteps.map((s) => {
            const isCurrent = state.activeTab === s.tab;
            const isClickable = !hasData ? s.step === 1 : true;

            return (
              <div
                key={s.step}
                onClick={() => isClickable && setTab(s.tab)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : isClickable
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer'
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isCurrent ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    0{s.step}
                  </span>
                  {hasData && s.step <= 2 ? (
                    <CheckCircle2
                      className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-emerald-600'}`}
                    />
                  ) : (
                    <Clock
                      className={`w-3.5 h-3.5 ${isCurrent ? 'text-slate-400' : 'text-slate-300'}`}
                    />
                  )}
                </div>
                <h4
                  className={`text-sm font-semibold mb-1 ${
                    isCurrent ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {s.name}
                </h4>
                <p
                  className={`text-xs leading-relaxed ${
                    isCurrent ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
