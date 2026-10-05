export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(num: number | undefined | null, decimals = 0): string {
  if (num === undefined || num === null || isNaN(num)) return 'N/A';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';
  // If val is 0..1 or 0..100
  const normalized = val <= 1 && val >= 0 ? val * 100 : val;
  return `${normalized.toFixed(decimals)}%`;
}

export function truncateText(text: string, maxLength = 24): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
