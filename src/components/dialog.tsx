'use client';

import { type ReactNode, useRef } from 'react';

type Props = {
  children: ReactNode | ((closeDialog: () => void, openDialog: () => void) => ReactNode);
  trigger: ReactNode;
};

export function Dialog({ children, trigger }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  function openDialog() {
    ref.current?.showModal();
  }

  function closeDialog() {
    ref.current?.close();
  }

  return (
    <>
      <span onClick={openDialog}>{trigger}</span>
      <dialog
        ref={ref}
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
