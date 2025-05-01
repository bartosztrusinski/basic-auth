'use client';

import { useState } from 'react';

type Variant = 'default' | 'success' | 'error';

type Props = {
  message: string | string[];
  variant?: Variant;
  isClosable?: boolean;
  onClose?: () => void;
};

const variants: Record<Variant, { classes: string; accentChar: string }> = {
  default: { classes: 'border-zinc-600', accentChar: '🔐' },
  success: { classes: 'border-green-500 text-green-500', accentChar: '✅' },
  error: { classes: 'border-red-500 text-red-500', accentChar: '❌' },
};

export function Alert({ message, variant = 'default', onClose, isClosable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const { classes, accentChar } = variants[variant];

  if (!isVisible) {
    return null;
  }

  function handleClose() {
    setIsVisible(false);
    onClose?.();
  }

  return (
    <div
      className={`group flex items-start justify-between gap-2 rounded border p-2 text-sm ${classes}`}
    >
      <div className='flex items-start gap-2'>
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
          className='size-5 shrink-0 rounded bg-red-500 bg-opacity-0 text-red-500 opacity-0 transition-all duration-100 hover:bg-opacity-20 group-hover:opacity-100'
        >
          ⨉
        </button>
      )}
    </div>
  );
}
