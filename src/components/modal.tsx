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

type ModalContext = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

type ModalContentProps = {
  children: ReactNode;
  shouldCloseOnBackdropClick?: boolean;
};

type ModalButtonProps = {
  children: ReactElement<Record<string, unknown> & { onClick?: MouseEventHandler }>;
};

const ModalContext = createContext<ModalContext>({
  isOpen: false,
  setIsOpen: () => null,
});

function useModal(): ModalContext {
  return useContext(ModalContext);
}

function Modal({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return <ModalContext.Provider value={{ isOpen, setIsOpen }}>{children}</ModalContext.Provider>;
}

function ModalContent({ children, shouldCloseOnBackdropClick = true }: ModalContentProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, setIsOpen } = useModal();

  function closeModal() {
    setIsOpen(false);
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick = event.target === dialogRef.current;

    if (shouldCloseOnBackdropClick && isBackdropClick) {
      closeModal();
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
      onClose={closeModal}
      onMouseDown={handleBackdropClick}
      className='bg-transparent shadow-lg shadow-neutral-950 backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm'
    >
      {children}
    </dialog>
  );
}

function ModalOpenButton({ children }: ModalButtonProps) {
  const { setIsOpen } = useModal();

  return <ModalButton onClick={() => setIsOpen(true)}>{children}</ModalButton>;
}

function ModalCloseButton({ children }: ModalButtonProps) {
  const { setIsOpen } = useModal();

  return <ModalButton onClick={() => setIsOpen(false)}>{children}</ModalButton>;
}

function ModalButton({ children, onClick }: { onClick: MouseEventHandler } & ModalButtonProps) {
  if (!isValidElement(children)) {
    throw new Error(`
      ${ModalButton.name} expects a single React element as its child.`);
  }

  return cloneElement(children, {
    ...children.props,
    onClick: callAll(children.props.onClick, onClick),
  });
}

export { Modal, ModalContent, ModalOpenButton, ModalCloseButton };
