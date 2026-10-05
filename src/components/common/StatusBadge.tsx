import React from 'react';

export type StatusType = 'passed' | 'low' | 'medium' | 'high' | 'critical' | 'neutral';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
}) => {
  const statusConfig: Record<StatusType, { dot: string; text: string; defaultLabel: string }> = {
    passed: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
      defaultLabel: 'Passed',
    },
    low: {
      dot: 'bg-sky-500',
      text: 'text-sky-700',
      defaultLabel: 'Low',
    },
    medium: {
      dot: 'bg-amber-500',
      text: 'text-amber-700',
      defaultLabel: 'Medium',
    },
    high: {
      dot: 'bg-orange-500',
      text: 'text-orange-700',
      defaultLabel: 'High',
    },
    critical: {
      dot: 'bg-rose-500',
      text: 'text-rose-700',
      defaultLabel: 'Critical',
    },
    neutral: {
      dot: 'bg-slate-400',
      text: 'text-slate-600',
      defaultLabel: 'Neutral',
    },
  };

  const config = statusConfig[status] || statusConfig.neutral;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium tabular-nums ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
