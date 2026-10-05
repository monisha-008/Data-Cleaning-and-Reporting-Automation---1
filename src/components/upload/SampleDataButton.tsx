import React from 'react';
import { Sparkles, Database, CheckCircle2 } from 'lucide-react';
import { useData } from '../../hooks/useData';
import { Button } from '../common/Button';

export const SampleDataButton: React.FC = () => {
  const { loadSampleDataset, state } = useData();

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-slate-900">
              Try the Deterministic Sample Dataset
            </h4>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Instantly benchmark the platform with our checked-in 500-row e-commerce dataset containing calibrated defects (missing values, exact duplicates, invalid types, spelling variations, and outliers).
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={loadSampleDataset}
          isLoading={state.isProcessing}
          icon={<Database className="w-4 h-4" />}
          className="shrink-0"
        >
          Load 500-Row Sample
        </Button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>500 Rows · 11 Cols</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>25 Exact Duplicates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>75 Missing Values</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>6 Calibrated Outliers</span>
        </div>
      </div>
    </div>
  );
};
