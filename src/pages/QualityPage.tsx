import React from 'react';
import { useData } from '../hooks/useData';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatPercentage } from '../utils/formatters';

export const QualityPage: React.FC = () => {
  const { state, setTab } = useData();
  const quality = state.quality;

  if (!quality) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Quality Data</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Please upload a dataset to compute quality scores and sub-metrics.
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
            Data Quality &amp; Validation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data Quality Score and Severity Matrix computed from the dataset.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setTab('analytics')} icon={<ArrowRight className="w-3.5 h-3.5" />}>
          View Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Overall Quality Score" subtitle="Weighted multi-dimensional index">
          <div className="flex items-baseline gap-3 my-4">
            <span className="text-5xl font-extrabold text-slate-900 tabular-nums">
              {quality.overallScore}
            </span>
            <span className="text-sm text-slate-500 font-medium">/ 100</span>
            <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md ml-auto">
              {quality.grade.replace('_', ' ')}
            </span>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall Severity:</span>
            <StatusBadge status={quality.overallSeverity} />
          </div>
        </Card>

        <Card title="Dimension Sub-Scores" subtitle="Formula weight breakdown" className="md:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 block mb-0.5">Completeness (30%)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPercentage(quality.subScores.completeness)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 block mb-0.5">Uniqueness (20%)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPercentage(quality.subScores.uniqueness)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 block mb-0.5">Validity (20%)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPercentage(quality.subScores.validity)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 block mb-0.5">Consistency (15%)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPercentage(quality.subScores.consistency)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-xs text-slate-500 block mb-0.5">Type Correctness (15%)</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatPercentage(quality.subScores.typeCorrectness)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
