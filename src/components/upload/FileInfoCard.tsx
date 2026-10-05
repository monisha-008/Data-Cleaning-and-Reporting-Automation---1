import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Table,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useData } from '../../hooks/useData';
import { formatBytes, formatNumber } from '../../utils/formatters';
import { Button } from '../common/Button';
import { SheetSelector } from './SheetSelector';

export const FileInfoCard: React.FC = () => {
  const { state, setTab, handleSheetSelect, resetDataset } = useData();
  const metadata = state.metadata;

  if (!metadata) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900 truncate">
                  {metadata.fileName}
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {metadata.fileType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Size: {formatBytes(metadata.fileSize)}
                {metadata.delimiter && ` · Delimiter: "${metadata.delimiter}"`}
                {` · Sheet: ${metadata.activeSheet}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={resetDataset}
              icon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Change File
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setTab('profile')}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Inspect Data Profile
            </Button>
          </div>
        </div>

        {/* High-level metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-500 block mb-1">Total Rows</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {formatNumber(metadata.totalRows)}
              </span>
              <span className="text-[11px] text-slate-500">records</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-500 block mb-1">Total Columns</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {formatNumber(metadata.totalColumns)}
              </span>
              <span className="text-[11px] text-slate-500">fields</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-500 block mb-1">Missing Cells</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-600 tabular-nums">
                {formatNumber(metadata.totalMissingCells)}
              </span>
              <span className="text-[11px] text-slate-500">empty</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
            <span className="text-xs text-slate-500 block mb-1">Duplicate Rows</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-rose-600 tabular-nums">
                {formatNumber(metadata.duplicateRowCount)}
              </span>
              <span className="text-[11px] text-slate-500">clones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Sheet selector if multi-sheet */}
      {metadata.sheets && metadata.sheets.length > 1 && (
        <SheetSelector
          sheets={metadata.sheets}
          activeSheet={metadata.activeSheet}
          onSelectSheet={handleSheetSelect}
          disabled={state.isProcessing}
        />
      )}
    </div>
  );
};
