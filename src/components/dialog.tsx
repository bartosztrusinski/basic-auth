'use client';

import {
  useEffect,
  useRef,
  useState,
  cloneElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

export type DialogProps = {
  children: ReactNode | ((closeDialog: () => void) => ReactNode);
  trigger?: ReactElement<Record<string, unknown> & { onClick?: (event: MouseEvent) => void }>;
  isOpen?: boolean;
  onClose?: () => void;
  shouldCloseOnBackdropClick?: boolean;
};

export function Dialog({
  children,
  trigger,
  isOpen: externalIsOpen,
  onClose,
  shouldCloseOnBackdropClick = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen ?? internalIsOpen;
  const isControlled = externalIsOpen !== undefined;

  function closeDialog() {
    onClose?.();

    if (!isControlled) {
      setInternalIsOpen(false);
    }
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

  useEffect(() => {
    if (isControlled && trigger) {
      console.warn(
        'You provided both `trigger` and `isOpen` props. This will not render `trigger`. For controlled dialogs, manage state with `isOpen` prop. For uncontrolled dialogs, use `trigger` prop.',
      );
    }
  }, [isControlled, trigger]);

  useEffect(() => {
    if (isControlled && !onClose) {
      console.warn(
        'You provided `isOpen` prop without `onClose`. This will not close the dialog when `isOpen` changes. Provide `onClose` handler to manage dialog state.',
      );
    }
  }, [isControlled, onClose]);

  return (
    <>
      {trigger &&
        !isControlled &&
        cloneElement(trigger, {
          ...trigger.props,
          onClick: (event: MouseEvent) => {
            if (trigger.props.onClick) {
              trigger.props.onClick(event);
            }

            setInternalIsOpen(true);
          },
        })}
      {isOpen && (
        <dialog
          ref={dialogRef}
          onClose={closeDialog}
          onMouseDown={handleBackdropClick}
          className='bg-transparent shadow-lg shadow-neutral-950 backdrop:bg-neutral-950/50 backdrop:backdrop-blur-sm'
        >
          {typeof children === 'function' ? children(closeDialog) : children}
        </dialog>
      )}
    </>
  );
}
