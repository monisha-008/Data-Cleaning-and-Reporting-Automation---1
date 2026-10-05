export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB recommended limit
export const LARGE_DATASET_THRESHOLD = 10000;
export const VERY_LARGE_DATASET_THRESHOLD = 50000;

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function isValidDataFile(file: File): { valid: boolean; error?: string } {
  const ext = getFileExtension(file.name);
  if (!['csv', 'xlsx', 'xls'].includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format ".${ext || 'unknown'}". Please upload a CSV, XLSX, or XLS file.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is completely empty (0 bytes).`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 50 MB safety limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  return { valid: true };
}
