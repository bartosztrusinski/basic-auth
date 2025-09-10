'use client';

import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type MouseEvent,
  type ReactNode,
  type ComponentProps,
} from 'react';
import { callAll } from '@/util';

type ModalContext = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  closeOnBackdropClick: boolean;
};

type ModalOptions = {
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
};

const ModalContext = createContext<ModalContext | undefined>(undefined);

function useModal(): ModalContext {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error(`${useModal.name} must be used within a ${Modal.name}`);
  }

  return context;
}

function Modal({
  children,
  onClose,
  closeOnBackdropClick = true,
}: { children: ReactNode } & ModalOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal, closeOnBackdropClick }}>
      {children}
    </ModalContext.Provider>
  );
}

function ModalContent({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isOpen, closeModal, closeOnBackdropClick } = useModal();

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    const isBackdropClick = event.target === dialogRef.current;

    if (closeOnBackdropClick && isBackdropClick) {
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

function ModalOpenButton({ children, onClick, ...props }: ComponentProps<'button'>) {
  const { openModal } = useModal();
  return (
    <button {...props} onClick={callAll(onClick, openModal)}>
      {children}
    </button>
  );
}

function ModalCloseButton({ children, onClick, ...props }: ComponentProps<'button'>) {
  const { closeModal } = useModal();
  return (
    <button {...props} onClick={callAll(onClick, closeModal)}>
      {children}
    </button>
  );
}

export { Modal, ModalContent, ModalOpenButton, ModalCloseButton };
