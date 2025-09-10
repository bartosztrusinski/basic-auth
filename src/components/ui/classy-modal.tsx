import { type ComponentProps, type ReactNode } from 'react';
import { ModalCloseButton as UnstyledModalCloseButton } from '@/components/ui/modal';

function ModalContainer({ children, className }: ComponentProps<'div'>) {
  return (
    <div
      className={`flex max-w-sm flex-col gap-2 rounded-md border border-neutral-700 bg-neutral-900 p-4 text-neutral-50 ${className}`}
    >
      {children}
    </div>
  );
}

function ModalTitle({ children }: { children: ReactNode }) {
  return <div className='pr-5 font-medium'>{children}</div>;
}

function ModalDescription({ children }: { children: ReactNode }) {
  return <p className='pb-1 pr-5 text-sm text-neutral-400'>{children}</p>;
}

function ModalCloseButton({ children = '⨉', className, ...props }: ComponentProps<'button'>) {
  return (
    <UnstyledModalCloseButton
      {...props}
      className={`btn btn-danger absolute right-2 top-2 size-7 bg-opacity-0 p-0 text-danger-500 shadow-none outline-offset-0 transition-colors hover:scale-100 hover:bg-opacity-20 ${className}`}
    >
      <span aria-hidden>{children}</span>
      <span className='sr-only'>Close</span>
    </UnstyledModalCloseButton>
  );
}

function ModalButtonsContainer({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div {...props} className={`flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}

function ModalConfirmButton({
  type = 'submit',
  children = 'Confirm',
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button {...props} type={type} className={`btn w-auto px-4 py-1 text-sm ${className}`}>
      {children}
    </button>
  );
}

function ModalCancelButton({
  type = 'button',
  children = 'Cancel',
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <UnstyledModalCloseButton
      {...props}
      type={type}
      className={`btn w-auto px-4 py-1 text-sm ${className}`}
    >
      {children}
    </UnstyledModalCloseButton>
  );
}

export {
  ModalContainer,
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
  ModalButtonsContainer,
  ModalConfirmButton,
  ModalCancelButton,
};
