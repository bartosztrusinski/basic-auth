import { type ReactNode } from 'react';
import { ErrorIcon } from '@/components/ui/error-icon';
import { SuccessIcon } from '@/components/ui/success-icon';

type Variant = 'default' | 'success' | 'error';

type Props = {
  message: string | string[];
  variant?: Variant;
};

const variants: Record<Variant, { classes: string; accentChar: ReactNode }> = {
  default: { classes: 'border-neutral-600', accentChar: '🔐' },
  success: {
    classes: 'bg-success-950 text-success-500 border-success-900',
    accentChar: <SuccessIcon />,
  },
  error: {
    classes: 'bg-danger-950 border-danger-900 text-danger-400',
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
      className={`flex items-center gap-2 text-wrap rounded border p-2 text-left text-sm shadow ${classes}`}
    >
      {accentChar}
      {Array.isArray(message) ? (
        <div>
          {message.map((err, index) => (
            <p key={index}>{err}</p>
          ))}
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}
