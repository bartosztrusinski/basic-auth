'use client';

import {
  useEffect,
  useRef,
  useState,
  cloneElement,
  isValidElement,
  createContext,
  useContext,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  type MouseEventHandler,
} from 'react';
import { callAll } from '@/util';

type DialogContext = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type DialogContentProps = {
  children: ReactNode;
  shouldCloseOnBackdropClick?: boolean;
};

type DialogButtonProps = {
  children: ReactElement<Record<string, unknown> & { onClick?: MouseEventHandler }>;
};

const DialogContext = createContext<DialogContext>({
  isOpen: false,
  setIsOpen: () => null,
});

function useDialog(): DialogContext {
  return useContext(DialogContext);
}

function Dialog({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return <DialogContext.Provider value={{ isOpen, setIsOpen }}>{children}</DialogContext.Provider>;
}

function DialogContent({ children, shouldCloseOnBackdropClick = true }: DialogContentProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, setIsOpen } = useDialog();

  function closeDialog() {
    setIsOpen(false);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick = event.target === dialogRef.current;

    if (shouldCloseOnBackdropClick && isBackdropClick) {
      closeDialog();
    }
  }

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={closeDialog}
      onMouseDown={handleBackdropClick}
      className='bg-transparent shadow-lg shadow-neutral-950 backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm'
    >
      {children}
    </dialog>
  );
}

function DialogOpenButton({ children }: DialogButtonProps) {
  const { setIsOpen } = useDialog();

  return <DialogButton onClick={() => setIsOpen(true)}>{children}</DialogButton>;
}

function DialogCloseButton({ children }: DialogButtonProps) {
  const { setIsOpen } = useDialog();

  return <DialogButton onClick={() => setIsOpen(false)}>{children}</DialogButton>;
}

function DialogButton({ children, onClick }: { onClick: MouseEventHandler } & DialogButtonProps) {
  if (!isValidElement(children)) {
    throw new Error(`
      ${DialogButton.name} expects a single React element as its child.`);
  }

  return cloneElement(children, {
    ...children.props,
    onClick: callAll(children.props.onClick, onClick),
  });
}

export { Dialog, DialogContent, DialogOpenButton, DialogCloseButton };
