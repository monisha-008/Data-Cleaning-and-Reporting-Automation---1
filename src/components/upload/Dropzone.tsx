import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { isValidDataFile } from '../../utils/fileUtils';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setLocalError(null);
    const validation = isValidDataFile(file);
    if (!validation.valid) {
      setLocalError(validation.error || 'Invalid file');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 lg:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-slate-900 bg-slate-100/70 scale-[0.99]'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload CSV or Excel file dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4 transition-transform group-hover:scale-105">
          <UploadCloud className="w-7 h-7 text-slate-700" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5">
          Drop your dataset here, or <span className="text-slate-900 underline underline-offset-2">browse files</span>
        </h3>

        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-4">
          Supports CSV (auto-delimiter, UTF-8 BOM) and Excel (.xlsx, .xls) up to 50 MB.
          All parsing occurs 100% locally in your browser.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 w-full max-w-sm">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            CSV / TSV / Semicolon
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            Excel Multi-Sheet
          </span>
        </div>
      </div>

      {localError && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}
    </div>
  );
};
