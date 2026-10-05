import React from 'react';
import { useData } from '../hooks/useData';
import { Dropzone } from '../components/upload/Dropzone';
import { SampleDataButton } from '../components/upload/SampleDataButton';
import { FileInfoCard } from '../components/upload/FileInfoCard';
import { ShieldCheck, Cpu, HardDrive, FileCheck } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { state, handleFileUpload } = useData();
  const hasData = Boolean(state.metadata);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Upload &amp; Ingest Dataset
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Select or drop a CSV or multi-sheet Excel workbook. Processing is performed securely within your browser using a dedicated Web Worker thread.
        </p>
      </div>

      {/* When data is already loaded */}
      {hasData ? (
        <FileInfoCard />
      ) : (
        <div className="space-y-6">
          {/* Dropzone */}
          <Dropzone onFileSelect={handleFileUpload} disabled={state.isProcessing} />

          {/* Sample dataset benchmark */}
          <SampleDataButton />

          {/* Architecture & Privacy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-0.5">
                  100% Client-Side Privacy
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Your dataset never leaves this machine. No backend, no external storage, zero telemetry.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-0.5">
                  Dedicated Web Worker
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Parsing and calculations run off the main thread, keeping the user interface smooth and responsive.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-0.5">
                  Multi-Format Compatible
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Auto-detects CSV delimiters (comma, semicolon, tab), UTF-8 BOM, and multi-sheet Excel files.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
