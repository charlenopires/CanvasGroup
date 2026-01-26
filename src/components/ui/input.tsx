import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = 'left', error, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          {iconPosition === 'left' && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm transition-colors',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-1',
              error
                ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
                : 'border-slate-200 dark:border-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              iconPosition === 'left' ? 'pl-10 pr-3' : 'pl-3 pr-10',
              'py-2.5',
              className
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === 'right' && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white text-sm transition-colors',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
            : 'border-slate-200 dark:border-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white text-sm transition-colors',
          'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          'focus:outline-none focus:ring-1',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
            : 'border-slate-200 dark:border-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-white text-sm transition-colors',
            'focus:outline-none focus:ring-1',
            error
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]'
              : 'border-slate-200 dark:border-slate-600 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        className={cn(
          'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

const HelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => {
  return (
    <p
      className={cn(
        'mt-1 text-xs',
        error ? 'text-[var(--color-error)]' : 'text-slate-500 dark:text-slate-400',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
HelperText.displayName = 'HelperText';

export { Input, Textarea, Select, Label, HelperText };
