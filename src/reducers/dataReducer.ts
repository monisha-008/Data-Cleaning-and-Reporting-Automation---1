import { DatasetMetadata, TablePageQuery, TablePageResult } from '../types/dataset';
import { CleaningConfig, CleaningLogEntry, CleaningOperation } from '../types/cleaning';
import { DataQualityReport, BeforeAfterSummary } from '../types/quality';

export type AppNavigationTab =
  | 'dashboard'
  | 'upload'
  | 'profile'
  | 'clean'
  | 'quality'
  | 'analytics'
  | 'reports'
  | 'export';

export interface DataState {
  activeTab: AppNavigationTab;
  isProcessing: boolean;
  progress: { percent: number; message: string } | null;
  error: string | null;
  metadata: DatasetMetadata | null;
  quality: DataQualityReport | null;
  currentPage: TablePageResult | null;
  tableQuery: TablePageQuery;
  cleaningConfig: CleaningConfig;
  cleaningLogs: CleaningLogEntry[];
  operationHistory: CleaningOperation[];
  historyIndex: number;
  isCleaned: boolean;
  beforeAfter: BeforeAfterSummary | null;
}

export const initialCleaningConfig: CleaningConfig = {
  trimWhitespace: true,
  convertNullLikes: true,
  standardizeDates: true,
  dateResolutions: {},
  categoryNormalization: true,
  approvedCategoryMerges: [],
  removeDuplicates: true,
  duplicateKeyColumns: [],
  globalMissingNumeric: 'median',
  globalMissingCategorical: 'mode',
  globalMissingDate: 'mode',
  columnMissingOverrides: {},
  outlierHandling: 'flag',
  columnOutlierOverrides: {},
};

export const initialTableQuery: TablePageQuery = {
  page: 1,
  pageSize: 25,
  search: '',
  sortColumn: undefined,
  sortDirection: undefined,
  columnFilters: {},
};

export const initialDataState: DataState = {
  activeTab: 'upload',
  isProcessing: false,
  progress: null,
  error: null,
  metadata: null,
  quality: null,
  currentPage: null,
  tableQuery: initialTableQuery,
  cleaningConfig: initialCleaningConfig,
  cleaningLogs: [],
  operationHistory: [],
  historyIndex: -1,
  isCleaned: false,
  beforeAfter: null,
};

export type DataAction =
  | { type: 'SET_TAB'; payload: AppNavigationTab }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean; progress?: { percent: number; message: string } } }
  | { type: 'SET_PROGRESS'; payload: { percent: number; message: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'DATASET_LOADED';
      payload: {
        metadata: DatasetMetadata;
        quality: DataQualityReport;
        firstPage: TablePageResult;
      };
    }
  | { type: 'SET_TABLE_PAGE'; payload: TablePageResult }
  | { type: 'SET_TABLE_QUERY'; payload: Partial<TablePageQuery> }
  | { type: 'UPDATE_CLEANING_CONFIG'; payload: Partial<CleaningConfig> }
  | { type: 'RESET_DATASET' };

export function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload, error: null };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.isProcessing,
        progress: action.payload.progress ?? null,
        error: action.payload.isProcessing ? null : state.error,
      };

    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
        progress: null,
      };

    case 'DATASET_LOADED':
      return {
        ...state,
        isProcessing: false,
        progress: null,
        error: null,
        metadata: action.payload.metadata,
        quality: action.payload.quality,
        currentPage: action.payload.firstPage,
        tableQuery: initialTableQuery,
        activeTab: 'profile', // Advance to Data Profile once loaded
      };

    case 'SET_TABLE_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        isProcessing: false,
      };

    case 'SET_TABLE_QUERY':
      return {
        ...state,
        tableQuery: { ...state.tableQuery, ...action.payload },
      };

    case 'UPDATE_CLEANING_CONFIG':
      return {
        ...state,
        cleaningConfig: { ...state.cleaningConfig, ...action.payload },
      };

    case 'RESET_DATASET':
      return {
        ...initialDataState,
        activeTab: 'upload',
      };

    default:
      return state;
  }
}
