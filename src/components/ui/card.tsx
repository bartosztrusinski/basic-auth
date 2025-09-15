import { type ComponentProps, type ReactNode } from 'react';

export function Card({ children, className }: ComponentProps<'div'>) {
  return (
    <div
      className={`flex max-w-sm flex-col gap-2 rounded-md border border-neutral-700 bg-neutral-900 p-4 text-neutral-50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className='pr-5 font-medium'>{children}</div>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className='pb-1 pr-5 text-sm text-neutral-400'>{children}</p>;
}

export function CardFooter({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
