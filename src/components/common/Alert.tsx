import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onDismiss,
  className = '',
}) => {
  const styles = {
    error: {
      container: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 border rounded-lg text-sm ${current.container} ${className}`}
    >
      {current.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-inherit mb-0.5">{title}</h4>}
        <p className="text-inherit opacity-90 leading-relaxed break-words">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-inherit opacity-60 hover:opacity-100 p-1 rounded transition-opacity cursor-pointer"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
