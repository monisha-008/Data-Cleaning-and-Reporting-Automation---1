import React from 'react';
import { useData } from '../hooks/useData';
import { BarChart3 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const AnalyticsPage: React.FC = () => {
  const { state, setTab } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Exploratory Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real data visualizations, distributions, and KPI summaries (Phase 5).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTab('reports')}>
          Go to Reports
        </Button>
      </div>

      <Card title="Analytics Engine" subtitle="Data visualization architecture">
        <div className="text-center py-12">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Interactive Recharts visualizations and business KPI generation will be integrated in Phase 5, powered by real-time worker query aggregations.
          </p>
        </div>
      </Card>
    </div>
  );
};
