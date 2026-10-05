/// <reference lib="webworker" />
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  WorkerCommand,
  WorkerResponse,
  ParseFilePayload,
  SelectSheetPayload,
  SetHeaderRowPayload,
  ParseResultData,
} from '../types/worker';
import { DatasetMetadata, RowData, TablePageQuery, TablePageResult, ColumnProfile, DataType, SheetInfo } from '../types/dataset';
import { DataQualityReport } from '../types/quality';

// In-memory worker dataset storage — NEVER shipped in bulk to React
let currentOriginalRows: RowData[] = [];
let currentCleanedRows: RowData[] = [];
let currentMetadata: DatasetMetadata | null = null;
let currentQuality: DataQualityReport | null = null;
let currentRawWorkbook: XLSX.WorkBook | null = null;
let activeSheetName: string = '';

// Helper to post typed responses back to main thread
function respond(response: WorkerResponse) {
  postMessage(response);
}

function sendSuccess(id: string, type: any, data: any) {
  respond({ id, type, status: 'success', data });
}

function sendError(id: string, type: any, error: string) {
  respond({ id, type, status: 'error', error });
}

function sendProgress(id: string, type: any, progress: number, message: string) {
  respond({ id, type, status: 'progress', progress, message });
}

// Basic type detection for initial Phase 1 profile
function detectInitialColumnType(values: any[], colName: string): DataType {
  const lowerName = colName.toLowerCase();
  const idPatterns = ['id', 'code', 'zip', 'phone', 'roll', 'customer_id', 'student_id'];
  if (idPatterns.some((pattern) => lowerName === pattern || lowerName.endsWith(`_${pattern}`))) {
    return 'identifier';
  }

  let numericCount = 0;
  let boolCount = 0;
  let dateCount = 0;
  let nonNullCount = 0;

  for (const raw of values) {
    if (raw === null || raw === undefined || raw === '') continue;
    const str = String(raw).trim();
    if (['na', 'n/a', 'null', '-', 'nan'].includes(str.toLowerCase())) continue;

    nonNullCount++;
    const boolVals = ['true', 'false', 'yes', 'no', '0', '1'];
    if (boolVals.includes(str.toLowerCase())) boolCount++;

    // Strip currency / formatting
    const cleanedNum = str.replace(/[$₹€,\s%]/g, '');
    if (cleanedNum !== '' && !isNaN(Number(cleanedNum))) numericCount++;

    // Simple date check
    if (str.length >= 8 && !isNaN(Date.parse(str)) && /\d/.test(str)) {
      dateCount++;
    }
  }

  if (nonNullCount === 0) return 'categorical';

  if (numericCount / nonNullCount >= 0.8) return 'numeric';
  if (dateCount / nonNullCount >= 0.8) return 'date';
  if (boolCount / nonNullCount >= 0.8) return 'boolean';

  return 'categorical';
}

function generateInitialProfile(
  rows: RowData[],
  headers: string[],
  fileName: string,
  fileSize: number,
  fileType: 'csv' | 'xlsx' | 'xls',
  sheets: SheetInfo[] = [],
  activeSheet: string = 'Sheet1',
  delimiter: string = ','
): { metadata: DatasetMetadata; quality: DataQualityReport } {
  const totalRows = rows.length;
  const totalColumns = headers.length;
  let totalMissingCells = 0;

  const columns: ColumnProfile[] = headers.map((col) => {
    let missingCount = 0;
    const values: any[] = [];
    const valCounts: Record<string, number> = {};

    for (let i = 0; i < rows.length; i++) {
      const val = rows[i][col];
      const strVal = val === null || val === undefined ? '' : String(val).trim();
      const isMissing = strVal === '' || ['na', 'n/a', 'null', '-', 'nan'].includes(strVal.toLowerCase());

      if (isMissing) {
        missingCount++;
        totalMissingCells++;
      } else {
        values.push(strVal);
        valCounts[strVal] = (valCounts[strVal] || 0) + 1;
      }
    }

    const detected = detectInitialColumnType(values, col);
    const nonNullCount = totalRows - missingCount;
    const missingPercentage = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;
    const uniqueCount = Object.keys(valCounts).length;

    // Top categories
    const topCategories = Object.entries(valCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([val, count]) => ({ value: val, count }));

    return {
      name: col,
      type: detected,
      detectedType: detected,
      nonNullCount,
      missingCount,
      missingPercentage,
      uniqueCount,
      invalidCount: 0,
      outlierCount: 0,
      topCategories,
    };
  });

  // Calculate duplicate rows (stringified row comparison)
  const seenRows = new Set<string>();
  let duplicateRowCount = 0;
  for (const row of rows) {
    const key = headers.map((h) => String(row[h] ?? '')).join('|~|');
    if (seenRows.has(key)) {
      duplicateRowCount++;
    } else {
      seenRows.add(key);
    }
  }

  const numericCount = columns.filter((c) => c.type === 'numeric').length;
  const catCount = columns.filter((c) => c.type === 'categorical').length;
  const dateCount = columns.filter((c) => c.type === 'date').length;
  const idCount = columns.filter((c) => c.type === 'identifier').length;
  const boolCount = columns.filter((c) => c.type === 'boolean').length;

  const metadata: DatasetMetadata = {
    fileName,
    fileSize,
    fileType,
    sheets,
    activeSheet,
    totalRows,
    totalColumns,
    columns,
    numericColumnsCount: numericCount,
    categoricalColumnsCount: catCount,
    dateColumnsCount: dateCount,
    identifierColumnsCount: idCount,
    booleanColumnsCount: boolCount,
    totalMissingCells,
    duplicateRowCount,
    totalInvalidValues: 0,
    totalOutliers: 0,
    delimiter,
    headerRowIndex: 0,
    hasHeaders: true,
    parsedAt: new Date().toISOString(),
  };

  // Initial Quality calculation
  const totalCells = totalRows * totalColumns;
  const completeness = totalCells > 0 ? 1 - totalMissingCells / totalCells : 1;
  const uniqueness = totalRows > 0 ? 1 - duplicateRowCount / totalRows : 1;
  const validity = 1; // detailed in Phase 4
  const consistency = 1; // detailed in Phase 4
  const typeCorrectness = 1; // detailed in Phase 4

  const rawScore =
    completeness * 0.3 +
    uniqueness * 0.2 +
    validity * 0.2 +
    consistency * 0.15 +
    typeCorrectness * 0.15;

  const overallScore = Math.min(100, Math.max(0, Math.round(rawScore * 100)));

  const grade =
    overallScore >= 90
      ? 'excellent'
      : overallScore >= 75
      ? 'good'
      : overallScore >= 50
      ? 'needs_improvement'
      : 'poor';

  // Severity thresholds
  const missingRatio = totalCells > 0 ? totalMissingCells / totalCells : 0;
  const dupRatio = totalRows > 0 ? duplicateRowCount / totalRows : 0;

  const getSeverity = (ratio: number): import('../types/quality').SeverityLevel => {
    if (ratio === 0) return 'passed';
    if (ratio <= 0.05) return 'low';
    if (ratio <= 0.15) return 'medium';
    if (ratio <= 0.3) return 'high';
    return 'critical';
  };

  const missingSev = getSeverity(missingRatio);
  const dupSev = getSeverity(dupRatio);
  const severityRank: Record<string, number> = { passed: 0, low: 1, medium: 2, high: 3, critical: 4 };

  const overallSeverity = ([missingSev, dupSev] as import('../types/quality').SeverityLevel[]).reduce<import('../types/quality').SeverityLevel>(
    (highest, current) => (severityRank[current] > severityRank[highest] ? current : highest),
    'passed'
  );

  const quality: DataQualityReport = {
    overallScore,
    grade,
    subScores: {
      completeness,
      uniqueness,
      validity,
      consistency,
      typeCorrectness,
    },
    overallSeverity,
    severities: {
      missing: missingSev,
      duplicates: dupSev,
      invalid: 'passed',
    },
    columnQuality: {},
    totalIssues: totalMissingCells + duplicateRowCount,
    recommendations: [],
  };

  return { metadata, quality };
}

// Slice and query helper
function queryTable(
  rows: RowData[],
  query: TablePageQuery
): TablePageResult {
  let filtered = [...rows];

  // Search filter across all fields
  if (query.search && query.search.trim()) {
    const q = query.search.toLowerCase().trim();
    filtered = filtered.filter((r) =>
      Object.values(r).some((val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q))
    );
  }

  // Column specific filters
  if (query.columnFilters) {
    for (const [col, filterVal] of Object.entries(query.columnFilters)) {
      if (filterVal) {
        const needle = filterVal.toLowerCase().trim();
        filtered = filtered.filter((r) => {
          const cell = r[col];
          return cell !== null && cell !== undefined && String(cell).toLowerCase().includes(needle);
        });
      }
    }
  }

  // Sort
  if (query.sortColumn) {
    const col = query.sortColumn;
    const dir = query.sortDirection === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const va = a[col];
      const vb = b[col];
      if (va === vb) return 0;
      if (va === null || va === undefined || va === '') return 1;
      if (vb === null || vb === undefined || vb === '') return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }
      return String(va).localeCompare(String(vb)) * dir;
    });
  }

  const totalFilteredRows = filtered.length;
  const pageSize = query.pageSize || 25;
  const totalPages = Math.max(1, Math.ceil(totalFilteredRows / pageSize));
  const page = Math.min(Math.max(1, query.page || 1), totalPages);
  const startIndex = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIndex, startIndex + pageSize);

  return {
    rows: pageRows,
    totalFilteredRows,
    totalRows: rows.length,
    page,
    pageSize,
    totalPages,
  };
}

// Handle messages from main thread
addEventListener('message', async (e: MessageEvent<WorkerCommand>) => {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
      case 'PING': {
        sendSuccess(id, type, { status: 'ready', timestamp: Date.now() });
        break;
      }

      case 'LOAD_SAMPLE': {
        sendProgress(id, type, 20, 'Loading sample dataset...');
        // Sample CSV string or payload
        const csvContent = payload.csvString as string;
        sendProgress(id, type, 50, 'Parsing sample data...');

        const parsed = Papa.parse<Record<string, any>>(csvContent, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
          sendError(id, type, `Failed to parse sample dataset: ${parsed.errors[0].message}`);
          return;
        }

        const headers = parsed.meta.fields || (parsed.data[0] ? Object.keys(parsed.data[0]) : []);
        currentOriginalRows = parsed.data;
        currentCleanedRows = [...parsed.data];

        sendProgress(id, type, 80, 'Profiling sample dataset...');
        const { metadata, quality } = generateInitialProfile(
          currentOriginalRows,
          headers,
          'sample-data.csv',
          new Blob([csvContent]).size,
          'csv',
          [{ name: 'sample-data', isHidden: false, rowCount: currentOriginalRows.length }],
          'sample-data'
        );

        currentMetadata = metadata;
        currentQuality = quality;

        const firstPage = queryTable(currentOriginalRows, { page: 1, pageSize: 25 });

        const result: ParseResultData = {
          metadata,
          quality,
          firstPage,
        };

        sendSuccess(id, type, result);
        break;
      }

      case 'PARSE_FILE': {
        const { file } = payload as ParseFilePayload;
        sendProgress(id, type, 15, `Reading file ${file.name}...`);

        const ext = file.name.split('.').pop()?.toLowerCase() || '';

        if (ext === 'csv') {
          const text = await file.text();
          sendProgress(id, type, 40, 'Parsing CSV content...');

          const parsed = Papa.parse<Record<string, any>>(text, {
            header: true,
            skipEmptyLines: true,
          });

          if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
            sendError(id, type, `CSV Parsing Error: ${parsed.errors[0].message}`);
            return;
          }

          const headers = parsed.meta.fields || (parsed.data[0] ? Object.keys(parsed.data[0]) : []);
          currentOriginalRows = parsed.data;
          currentCleanedRows = [...parsed.data];

          sendProgress(id, type, 75, 'Analyzing dataset structure...');
          const { metadata, quality } = generateInitialProfile(
            currentOriginalRows,
            headers,
            file.name,
            file.size,
            'csv',
            [{ name: file.name.replace(/\.[^/.]+$/, ''), isHidden: false, rowCount: currentOriginalRows.length }],
            file.name.replace(/\.[^/.]+$/, ''),
            parsed.meta.delimiter || ','
          );

          currentMetadata = metadata;
          currentQuality = quality;

          const firstPage = queryTable(currentOriginalRows, { page: 1, pageSize: 25 });
          sendSuccess(id, type, { metadata, quality, firstPage });
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buffer = await file.arrayBuffer();
          sendProgress(id, type, 40, 'Parsing Excel workbook...');

          const workbook = XLSX.read(buffer, { type: 'array' });
          currentRawWorkbook = workbook;

          const sheets: SheetInfo[] = workbook.SheetNames.map((sheetName, index) => {
            const isHidden = (workbook.Workbook?.Sheets?.[index] as any)?.Hidden > 0;
            const worksheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            const rowCount = Math.max(0, range.e.r - range.s.r);
            return {
              name: sheetName,
              isHidden: Boolean(isHidden),
              rowCount,
            };
          });

          // Select first non-hidden sheet by default, or first sheet
          const defaultSheet = sheets.find((s) => !s.isHidden) || sheets[0];
          activeSheetName = defaultSheet ? defaultSheet.name : workbook.SheetNames[0];

          sendProgress(id, type, 70, `Reading worksheet "${activeSheetName}"...`);
          const activeWorksheet = workbook.Sheets[activeSheetName];
          const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(activeWorksheet, { defval: '' });

          const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
          currentOriginalRows = rawRows;
          currentCleanedRows = [...rawRows];

          sendProgress(id, type, 85, 'Profiling dataset...');
          const { metadata, quality } = generateInitialProfile(
            currentOriginalRows,
            headers,
            file.name,
            file.size,
            ext as 'xlsx' | 'xls',
            sheets,
            activeSheetName
          );

          currentMetadata = metadata;
          currentQuality = quality;

          const firstPage = queryTable(currentOriginalRows, { page: 1, pageSize: 25 });
          sendSuccess(id, type, { metadata, quality, firstPage });
        } else {
          sendError(id, type, `Unsupported file format: ${ext}`);
        }
        break;
      }

      case 'SELECT_SHEET': {
        const { sheetName } = payload as SelectSheetPayload;
        if (!currentRawWorkbook || !currentRawWorkbook.Sheets[sheetName]) {
          sendError(id, type, `Worksheet "${sheetName}" not found in current workbook.`);
          return;
        }

        activeSheetName = sheetName;
        const worksheet = currentRawWorkbook.Sheets[sheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

        currentOriginalRows = rawRows;
        currentCleanedRows = [...rawRows];

        if (currentMetadata) {
          const { metadata, quality } = generateInitialProfile(
            currentOriginalRows,
            headers,
            currentMetadata.fileName,
            currentMetadata.fileSize,
            currentMetadata.fileType,
            currentMetadata.sheets,
            sheetName
          );
          currentMetadata = metadata;
          currentQuality = quality;

          const firstPage = queryTable(currentOriginalRows, { page: 1, pageSize: 25 });
          sendSuccess(id, type, { metadata, quality, firstPage });
        }
        break;
      }

      case 'GET_PAGE': {
        const query = payload as TablePageQuery;
        // Paginate from cleaned rows if available, else original
        const rowsToUse = currentCleanedRows.length > 0 ? currentCleanedRows : currentOriginalRows;
        const pageResult = queryTable(rowsToUse, query);
        sendSuccess(id, type, pageResult);
        break;
      }

      case 'RESET': {
        currentOriginalRows = [];
        currentCleanedRows = [];
        currentMetadata = null;
        currentQuality = null;
        currentRawWorkbook = null;
        activeSheetName = '';
        sendSuccess(id, type, { reset: true });
        break;
      }

      default:
        sendError(id, type, `Unknown worker command type: ${type}`);
    }
  } catch (err: any) {
    sendError(id, type, err.message || 'Worker execution failed');
  }
});
