export type SeverityLevel = 'passed' | 'low' | 'medium' | 'high' | 'critical';
export type QualityGrade = 'excellent' | 'good' | 'needs_improvement' | 'poor';

export interface QualitySubScores {
  completeness: number; // 0..1
  uniqueness: number; // 0..1
  validity: number; // 0..1
  consistency: number; // 0..1
  typeCorrectness: number; // 0..1
}

export interface DataQualityReport {
  overallScore: number; // 0..100 (rounded)
  grade: QualityGrade;
  subScores: QualitySubScores;
  overallSeverity: SeverityLevel;
  severities: {
    missing: SeverityLevel;
    duplicates: SeverityLevel;
    invalid: SeverityLevel;
  };
  columnQuality: Record<string, {
    completeness: number;
    validity: number;
    typeCorrectness: number;
    severity: SeverityLevel;
    issues: string[];
  }>;
  totalIssues: number;
  recommendations: Array<{
    id: string;
    column?: string;
    type: 'missing' | 'duplicate' | 'invalid' | 'outlier' | 'category' | 'date';
    severity: SeverityLevel;
    message: string;
    suggestedAction: string;
  }>;
}

export interface BeforeAfterSummary {
  before: {
    rows: number;
    columns: number;
    missingCells: number;
    duplicateRows: number;
    invalidValues: number;
    qualityScore: number;
  };
  after: {
    rows: number;
    columns: number;
    missingCells: number;
    duplicateRows: number;
    invalidValues: number;
    qualityScore: number;
  };
  improvement: number; // after - before
}
