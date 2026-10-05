import React from 'react';
import { useData } from '../hooks/useData';
import { Download } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ExportPage: React.FC = () => {
  const { setTab } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Export Datasets
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Download cleaned datasets in CSV or Excel format (Phase 6).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTab('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Card title="Export Pipeline" subtitle="Full and filtered exports">
        <div className="text-center py-12">
          <Download className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Full CSV and Excel exports, along with filtered dataset downloads, will be activated upon completion of the cleaning pipeline in Phase 6.
          </p>
        </div>
      </Card>
    </div>
  );
};
