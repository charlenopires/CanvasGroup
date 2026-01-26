'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Modal = ({ open, onClose, children, className, size = 'md' }: ModalProps) => {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative w-full transform rounded-2xl bg-white dark:bg-slate-800 p-6 text-left shadow-xl transition-all',
          'border border-slate-100 dark:border-slate-700',
          'animate-scale-in',
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mb-5', className)}
    {...props}
  >
    <div>{children}</div>
    {onClose && (
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    )}
  </div>
));
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-xl font-bold text-slate-900 dark:text-white', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-4', className)}
    {...props}
  />
));
ModalBody.displayName = 'ModalBody';

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-8 flex items-center justify-end gap-3', className)}
    {...props}
  />
));
ModalFooter.displayName = 'ModalFooter';

// Confirmation Modal preset
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
}

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ConfirmModalProps) => {
  const iconConfig = {
    danger: { icon: 'warning', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400' },
    warning: { icon: 'warning', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400' },
    default: { icon: 'info', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
  };

  const buttonConfig = {
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
    default: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-blue-500/20',
  };

  const config = iconConfig[variant];

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center', config.bgColor)}>
          <span className={cn('material-symbols-outlined text-2xl', config.textColor)}>
            {config.icon}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Esta ação não pode ser desfeita.</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
        {description}
      </p>

      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-bold text-white shadow-md transition-colors',
            buttonConfig[variant]
          )}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ConfirmModal };
