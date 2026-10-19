'use client';

import { cn } from '@/lib/utils';

// ============================================
//   Button — Componentă reutilizabilă
//   Variants: primary, secondary, outline, ghost
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-orange-500 text-white hover:bg-orange-600',
    'focus:ring-orange-500',
    'shadow-[0_4px_14px_rgba(249,115,22,0.4)]',
    'hover:shadow-[0_6px_20px_rgba(249,115,22,0.5)]',
    'hover:-translate-y-0.5',
  ].join(' '),
  secondary: 'bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500',
  outline: [
    'bg-transparent border border-gray-300 text-gray-700',
    'hover:bg-gray-50 hover:border-gray-400',
    'focus:ring-gray-300',
  ].join(' '),
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-4 py-2 gap-1.5',
  md: 'text-sm px-6 py-2.5 gap-2',
  lg: 'text-base px-8 py-3.5 gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-semibold rounded-full',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant & size
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
