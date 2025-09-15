import { type ComponentProps } from 'react';
import { ModalCloseButton as UnstyledModalCloseButton } from '@/components/ui/modal';

export function ModalCancelButton({
  type = 'button',
  children = 'Cancel',
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <UnstyledModalCloseButton {...props} type={type} className={`btn btn-inline ${className}`}>
      {children}
    </UnstyledModalCloseButton>
  );
}

export function ModalCloseButton({
  children = '⨉',
  className,
  ...props
}: ComponentProps<'button'>) {
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
