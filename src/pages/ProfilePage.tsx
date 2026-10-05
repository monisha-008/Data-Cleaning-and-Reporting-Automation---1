import React from 'react';
import { useData } from '../hooks/useData';
import { TableProperties, Search, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { formatNumber } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { state, setTab, handlePageChange, handleSearchChange, handleSortChange } = useData();
  const metadata = state.metadata;
  const pageResult = state.currentPage;

  if (!metadata || !pageResult) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
        <TableProperties className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">No Dataset Loaded</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          Please upload a CSV or Excel file or load the sample benchmark dataset to inspect the data profile.
        </p>
        <Button variant="primary" size="sm" onClick={() => setTab('upload')}>
          Go to Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Data Profile &amp; Schema
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Worker-computed column profiles, detected data types, and interactive data table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setTab('upload')}>
            Change File
          </Button>
          <Button variant="primary" size="sm" onClick={() => setTab('clean')}>
            Configure Cleaning
          </Button>
        </div>
      </div>

      {/* Column Schema Quick Grid */}
      <Card title="Detected Column Schema" subtitle="Summary of column types detected by the worker">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {metadata.columns.map((col) => (
            <div
              key={col.name}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-900 truncate" title={col.name}>
                    {col.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                    {col.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Non-null:</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatNumber(col.nonNullCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missing:</span>
                    <span
                      className={`font-medium tabular-nums ${
                        col.missingCount > 0 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {formatNumber(col.missingCount)} ({col.missingPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique:</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {formatNumber(col.uniqueCount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Table with Worker-Driven Pagination & Search */}
      <Card
        title="Interactive Data View"
        subtitle={`Showing page ${pageResult.page} of ${pageResult.totalPages} (${formatNumber(
          pageResult.totalFilteredRows
        )} filtered rows, ${formatNumber(pageResult.totalRows)} total)`}
        action={
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search all cells..."
              value={state.tableQuery.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            />
          </div>
        }
      >
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-slate-400 font-mono">
                  #
                </th>
                {metadata.columns.map((col) => {
                  const isSorted = state.tableQuery.sortColumn === col.name;
                  const sortDir = state.tableQuery.sortDirection;

                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSortChange(col.name)}
                      className="py-2.5 px-3 border-r border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span>{col.name}</span>
                        <ArrowUpDown
                          className={`w-3 h-3 ${isSorted ? 'text-slate-900 font-bold' : 'text-slate-400'}`}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageResult.rows.map((row, idx) => {
                const rowIndex = (pageResult.page - 1) * pageResult.pageSize + idx + 1;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 border-r border-slate-100 text-[10px] text-slate-400 font-mono">
                      {rowIndex}
                    </td>
                    {metadata.columns.map((col) => {
                      const val = row[col.name];
                      const isEmpty =
                        val === null ||
                        val === undefined ||
                        val === '' ||
                        ['na', 'n/a', 'null', '-', 'nan'].includes(String(val).toLowerCase());

                      return (
                        <td
                          key={col.name}
                          className="py-2 px-3 border-r border-slate-100 font-normal truncate max-w-xs text-slate-800"
                        >
                          {isEmpty ? (
                            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-1 py-0.5 rounded">
                              Empty
                            </span>
                          ) : (
                            <span className={col.type === 'numeric' ? 'tabular-nums' : ''}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
          <div>
            Page <span className="font-semibold text-slate-800 tabular-nums">{pageResult.page}</span> of{' '}
            <span className="font-semibold text-slate-800 tabular-nums">{pageResult.totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={pageResult.page <= 1}
              onClick={() => handlePageChange(pageResult.page - 1)}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pageResult.page >= pageResult.totalPages}
              onClick={() => handlePageChange(pageResult.page + 1)}
              icon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
