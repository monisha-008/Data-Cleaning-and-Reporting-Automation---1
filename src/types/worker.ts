import { DatasetMetadata, TablePageQuery, TablePageResult } from './dataset';
import { CleaningConfig, CleaningLogEntry } from './cleaning';
import { DataQualityReport, BeforeAfterSummary } from './quality';

export type WorkerCommandType =
  | 'PING'
  | 'PARSE_FILE'
  | 'LOAD_SAMPLE'
  | 'SELECT_SHEET'
  | 'SET_HEADER_ROW'
  | 'GET_PAGE'
  | 'CLEAN_DATASET'
  | 'RESET';

export interface WorkerCommand<T = any> {
  id: string;
  type: WorkerCommandType;
  payload: T;
}

export interface WorkerSuccessResponse<T = any> {
  id: string;
  type: WorkerCommandType;
  status: 'success';
  data: T;
}

export interface WorkerErrorResponse {
  id: string;
  type: WorkerCommandType;
  status: 'error';
  error: string;
}

export interface WorkerProgressResponse {
  id: string;
  type: WorkerCommandType;
  status: 'progress';
  progress: number; // 0..100
  message: string;
}

export type WorkerResponse = WorkerSuccessResponse | WorkerErrorResponse | WorkerProgressResponse;

export interface ParseFilePayload {
  file: File;
  sheetName?: string;
  headerRowIndex?: number;
}

export interface SelectSheetPayload {
  sheetName: string;
  headerRowIndex?: number;
}

export interface SetHeaderRowPayload {
  headerRowIndex: number;
}

export interface CleanDatasetPayload {
  config: CleaningConfig;
}

export interface ParseResultData {
  metadata: DatasetMetadata;
  quality: DataQualityReport;
  firstPage: TablePageResult;
}

export interface CleanResultData {
  metadata: DatasetMetadata;
  quality: DataQualityReport;
  beforeAfter: BeforeAfterSummary;
  logs: CleaningLogEntry[];
  firstPage: TablePageResult;
}
