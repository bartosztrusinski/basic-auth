import { type ReactNode } from 'react';
import { ErrorIcon } from '@/components/error-icon';
import { SuccessIcon } from '@/components/success-icon';

type Variant = 'default' | 'success' | 'error';

type Props = {
  message: string | string[];
  variant?: Variant;
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

export function Alert({ message, variant = 'default' }: Props) {
  const { classes, accentChar } = variants[variant];

  if (message.length === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 text-wrap rounded border p-2 text-left text-sm ${classes}`}
    >
      <span>{accentChar}</span>
      <span className='font-light'>
        {Array.isArray(message) ? (
          message.map((err, index) => <p key={index}>{err}</p>)
        ) : (
          <p>{message}</p>
        )}
      </span>
    </div>
  );
}
