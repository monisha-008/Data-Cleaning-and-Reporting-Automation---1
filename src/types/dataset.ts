export type DataType = 'numeric' | 'categorical' | 'date' | 'boolean' | 'identifier';

export interface ColumnProfile {
  name: string;
  type: DataType;
  detectedType: DataType;
  manualTypeOverride?: DataType;
  nonNullCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  stdDev?: number;
  topCategories?: Array<{ value: string; count: number }>;
  invalidCount: number;
  outlierCount: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface SheetInfo {
  name: string;
  isHidden: boolean;
  rowCount: number;
}

export interface DatasetMetadata {
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'xlsx' | 'xls';
  sheets: SheetInfo[];
  activeSheet: string;
  totalRows: number;
  totalColumns: number;
  columns: ColumnProfile[];
  numericColumnsCount: number;
  categoricalColumnsCount: number;
  dateColumnsCount: number;
  identifierColumnsCount: number;
  booleanColumnsCount: number;
  totalMissingCells: number;
  duplicateRowCount: number;
  totalInvalidValues: number;
  totalOutliers: number;
  delimiter?: string;
  headerRowIndex: number;
  hasHeaders: boolean;
  parsedAt: string;
}

export type RowData = Record<string, string | number | boolean | null | undefined>;

export interface TablePageQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilters?: Record<string, string>;
}

export interface TablePageResult {
  rows: RowData[];
  totalFilteredRows: number;
  totalRows: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
