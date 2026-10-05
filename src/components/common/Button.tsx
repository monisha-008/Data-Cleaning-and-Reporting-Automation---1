import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap shrink-0 rounded-lg cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-9.5',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
  };

  const variantClasses = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:bg-slate-950',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : icon ? (
        <span className="shrink-0" aria-hidden="true">{icon}</span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
};
