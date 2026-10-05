export type MissingNumericStrategy = 'mean' | 'median' | 'mode' | 'remove_row' | 'leave';
export type MissingCategoricalStrategy = 'mode' | 'unknown' | 'remove_row' | 'leave';
export type MissingDateStrategy = 'mode' | 'remove_row' | 'leave';

export interface ColumnMissingStrategy {
  column: string;
  strategy: MissingNumericStrategy | MissingCategoricalStrategy | MissingDateStrategy;
  customValue?: string | number;
}

export type OutlierStrategy = 'flag' | 'remove' | 'cap';

export interface ColumnOutlierStrategy {
  column: string;
  strategy: OutlierStrategy;
}

export interface CategoryMergeRule {
  id: string;
  column: string;
  fromValue: string;
  toValue: string;
  similarity: number;
  approved: boolean;
}

export interface DateAmbiguityResolution {
  column: string;
  preference: 'day_first' | 'month_first'; // DD/MM vs MM/DD
}

export interface CleaningConfig {
  trimWhitespace: boolean;
  convertNullLikes: boolean;
  standardizeDates: boolean;
  dateResolutions: Record<string, 'day_first' | 'month_first'>;
  categoryNormalization: boolean;
  approvedCategoryMerges: CategoryMergeRule[];
  removeDuplicates: boolean;
  duplicateKeyColumns?: string[]; // empty means all columns
  globalMissingNumeric: MissingNumericStrategy;
  globalMissingCategorical: MissingCategoricalStrategy;
  globalMissingDate: MissingDateStrategy;
  columnMissingOverrides: Record<string, ColumnMissingStrategy>;
  outlierHandling: OutlierStrategy;
  columnOutlierOverrides: Record<string, OutlierStrategy>;
}

export interface CleaningLogEntry {
  id: string;
  timestamp: string;
  step: string;
  description: string;
  rowsAffected: number;
  cellsAffected: number;
  details?: Record<string, any>;
}

export interface CleaningOperation {
  id: string;
  operation: string;
  columns?: string[];
  column?: string;
  strategy?: string;
  params?: Record<string, any>;
  timestamp: string;
}
