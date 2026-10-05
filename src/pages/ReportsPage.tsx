import React from 'react';
import { useData } from '../hooks/useData';
import { FileText } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ReportsPage: React.FC = () => {
  const { setTab } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Automated Executive Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic data audit report and print-to-PDF formatting (Phase 6).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTab('export')}>
          Go to Export
        </Button>
      </div>

      <Card title="Automated Reporting Engine" subtitle="Executive summaries and audit trails">
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            The automated executive HTML report with print-to-PDF stylesheet, before/after metrics, and recommendations is implemented in Phase 6.
          </p>
        </div>
      </Card>
    </div>
  );
};
