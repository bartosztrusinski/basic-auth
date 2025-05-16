'use client';

import { type MouseEvent, type ReactElement, type ReactNode, useEffect, useRef } from 'react';

export type DialogProps = {
  children: ReactNode | ((closeDialog: () => void, openDialog: () => void) => ReactNode);
  trigger: boolean | ReactElement;
  onClose?: () => void;
  shouldCloseOnBackdropClick?: boolean;
};

export function Dialog({
  children,
  trigger,
  onClose,
  shouldCloseOnBackdropClick = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const isTriggerBoolean = typeof trigger === 'boolean';

  function openDialog() {
    ref.current?.showModal();
  }

  function closeDialog() {
    onClose?.();
    ref.current?.close();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (shouldCloseOnBackdropClick && event.target === event.currentTarget) {
      closeDialog();
    }
  }

  useEffect(() => {
    if (isTriggerBoolean && trigger) {
      openDialog();
    }
  }, [isTriggerBoolean, trigger]);

  return (
    <>
      {!isTriggerBoolean && <span onClick={openDialog}>{trigger}</span>}
      <dialog
        ref={ref}
        onClose={closeDialog}
        onMouseDown={handleBackdropClick}
        className='bg-transparent shadow-lg shadow-zinc-950 backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm'
      >
        {typeof children === 'function' ? children(closeDialog, openDialog) : children}
      </dialog>
    </>
  );
}
