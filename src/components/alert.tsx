'use client';

import { useState, type ReactNode } from 'react';
import { ErrorIcon } from '@/components/error-icon';
import { SuccessIcon } from '@/components/success-icon';

type Variant = 'default' | 'success' | 'error';

type Props = {
  message: string | string[];
  variant?: Variant;
  isClosable?: boolean;
  onClose?: () => void;
};

const variants: Record<Variant, { classes: string; accentChar: ReactNode }> = {
  default: { classes: 'border-zinc-700', accentChar: '🔐' },
  success: {
    classes: 'bg-green-950 text-green-500 border-green-900',
    accentChar: <SuccessIcon />,
  },
  error: {
    classes: 'bg-red-950 border-red-900 text-red-400',
    accentChar: <ErrorIcon />,
  },
};

export function Alert({ message, variant = 'default', onClose, isClosable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const { classes, accentChar } = variants[variant];

  if (!isVisible || message.length === 0) {
    return null;
  }

  function handleClose() {
    setIsVisible(false);
    onClose?.();
  }

  return (
    <div className={`flex items-start justify-between gap-2 rounded border p-2 text-sm ${classes}`}>
      <div className='flex items-center gap-2'>
        <span>{accentChar}</span>
        <span className='font-light'>
          {Array.isArray(message) ? (
            message.map((err, index) => <p key={index}>{err}</p>)
          ) : (
            <p>{message}</p>
          )}
        </span>
      </div>
      {isClosable && (
        <button
          onClick={handleClose}
          className='size-5 shrink-0 rounded bg-red-500 bg-opacity-0 text-red-500 transition-opacity duration-100 hover:bg-opacity-20'
        >
          ⨉
        </button>
      )}
    </div>
  );
}
