import React from 'react';
import { FileSpreadsheet, EyeOff } from 'lucide-react';
import { SheetInfo } from '../../types/dataset';
import { formatNumber } from '../../utils/formatters';

interface SheetSelectorProps {
  sheets: SheetInfo[];
  activeSheet: string;
  onSelectSheet: (sheetName: string) => void;
  disabled?: boolean;
}

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  activeSheet,
  onSelectSheet,
  disabled = false,
}) => {
  if (sheets.length <= 1) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-semibold text-slate-900">Workbook Worksheets</h4>
        </div>
        <span className="text-[11px] text-slate-500">
          {sheets.length} sheets detected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sheets.map((sheet) => {
          const isActive = sheet.name === activeSheet;

          return (
            <button
              key={sheet.name}
              disabled={disabled}
              onClick={() => onSelectSheet(sheet.name)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{sheet.name}</span>
              {sheet.isHidden && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                  title="This worksheet was marked as hidden in Excel"
                >
                  <EyeOff className="w-3 h-3" />
                  Hidden
                </span>
              )}
              {sheet.rowCount > 0 && (
                <span
                  className={`text-[10px] tabular-nums ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  ({formatNumber(sheet.rowCount)} rows)
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
