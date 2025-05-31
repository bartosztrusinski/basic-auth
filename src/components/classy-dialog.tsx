import { type ReactNode } from 'react';
import { Dialog, type DialogProps } from '@/components/dialog';

type Props = DialogProps;

export function ClassyDialog({ children, ...props }: Props) {
  return (
    <Dialog {...props}>
      {(closeDialog) => (
        <div className='flex max-w-sm flex-col gap-2 rounded-md border border-neutral-700 bg-neutral-900 p-4 text-neutral-50'>
          {typeof children === 'function' ? children(closeDialog) : children}
          <button
            onClick={closeDialog}
            className='btn btn-danger absolute right-2 top-2 size-7 bg-opacity-0 p-0 text-danger-500 shadow-none outline-offset-0 transition-colors hover:scale-100 hover:bg-opacity-20'
          >
            ⨉
          </button>
        </div>
      )}
    </Dialog>
  );
}

export function ClassyDialogTitle({ children }: { children: ReactNode }) {
  return <div className='pr-5 font-medium'>{children}</div>;
}

export function ClassyDialogDescription({ children }: { children: ReactNode }) {
  return <div className='pb-1 pr-5 text-sm text-neutral-400'>{children}</div>;
}
