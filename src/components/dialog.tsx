'use client';

import { type ReactNode, useEffect, useRef } from 'react';

type Props = {
  children: ReactNode | ((closeDialog: () => void, openDialog: () => void) => ReactNode);
  trigger: ReactNode;
  onClose?: () => void;
};

export function Dialog({ children, trigger, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  function openDialog() {
    ref.current?.showModal();
  }

  function closeDialog() {
    onClose?.();
    ref.current?.close();
  }

  useEffect(() => {
    if (typeof trigger === 'boolean' && trigger) {
      openDialog();
    }
  }, [trigger]);

  return (
    <>
      <span onClick={openDialog}>{trigger}</span>
      <dialog
        ref={ref}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
        className='bg-transparent shadow-lg shadow-zinc-950 backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm'
      >
        {typeof children === 'function' ? children(closeDialog, openDialog) : children}
      </dialog>
    </>
  );
}
