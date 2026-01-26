'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, collapsed = false, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'hidden lg:flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 z-20 transition-all',
        collapsed ? 'w-20' : 'w-72',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
);
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

interface SidebarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: string;
  title: string;
  subtitle?: string;
}

const SidebarBrand = React.forwardRef<HTMLDivElement, SidebarBrandProps>(
  ({ className, logo, title, subtitle, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 mb-8', className)}
      {...props}
    >
      {logo && (
        <div
          className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shadow-sm"
          style={{ backgroundImage: `url("${logo}")` }}
        />
      )}
      <div className="flex flex-col">
        <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
);
SidebarBrand.displayName = 'SidebarBrand';

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    className={cn('flex flex-col gap-2', className)}
    {...props}
  />
));
SidebarNav.displayName = 'SidebarNav';

interface SidebarNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  active?: boolean;
  iconFilled?: boolean;
}

const SidebarNavItem = React.forwardRef<HTMLButtonElement, SidebarNavItemProps>(
  ({ className, icon, active, iconFilled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors w-full text-left',
        active
          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
        className
      )}
      {...props}
    >
      <span
        className="material-symbols-outlined"
        style={iconFilled || active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className={cn('text-sm', active ? 'font-bold' : 'font-medium')}>
        {children}
      </span>
    </button>
  )
);
SidebarNavItem.displayName = 'SidebarNavItem';

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-auto p-6 border-t border-slate-200 dark:border-slate-700', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarDivider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn('border-t border-slate-200 dark:border-slate-700 my-4', className)}
    {...props}
  />
));
SidebarDivider.displayName = 'SidebarDivider';

export {
  Sidebar,
  SidebarHeader,
  SidebarBrand,
  SidebarNav,
  SidebarNavItem,
  SidebarFooter,
  SidebarDivider,
};
