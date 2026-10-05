import React from 'react';
import { useData } from '../hooks/useData';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const CleanPage: React.FC = () => {
  const { state, setTab } = useData();
  const metadata = state.metadata;

  if (!metadata) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Dataset Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Please upload a dataset first to configure and run the cleaning pipeline.
        </p>
        <Button variant="primary" size="sm" onClick={() => setTab('upload')}>
          Go to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clean Data Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurable 7-step deterministic cleaning pipeline executed locally.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setTab('quality')} icon={<ArrowRight className="w-3.5 h-3.5" />}>
          View Quality Score
        </Button>
      </div>

      <Card title="Standard Pipeline Order" subtitle="Fixed sequential order defined in engineering specification">
        <ol className="divide-y divide-slate-100 text-xs text-slate-700">
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">1. Trim whitespace and convert null-like values</span>
            <span className="text-slate-500">Auto (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">2. Type conversion &amp; numeric parsing</span>
            <span className="text-slate-500">Auto / Manual (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">3. Date standardization (YYYY-MM-DD)</span>
            <span className="text-slate-500">Needs Input if Ambiguous (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">4. Category normalization (Levenshtein distance)</span>
            <span className="text-slate-500">User Approved Merges (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">5. Duplicate detection/removal</span>
            <span className="text-slate-500">All columns / Key columns (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">6. Missing-value handling</span>
            <span className="text-slate-500">Mean / Median / Mode / Remove (Phase 3)</span>
          </li>
          <li className="py-2.5 flex items-center justify-between">
            <span className="font-medium">7. IQR outlier detection &amp; handling</span>
            <span className="text-slate-500">Flag / Cap / Remove (Phase 3)</span>
          </li>
        </ol>
      </Card>
    </div>
  );
};
