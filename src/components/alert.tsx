type Variant = 'default' | 'success' | 'error';

type Props = {
  message: string | string[];
  variant?: Variant;
};

const variants: Record<Variant, { classes: string; accentChar: string }> = {
  default: { classes: 'border-zinc-600', accentChar: '🔐' },
  success: { classes: 'border-green-500 text-green-500', accentChar: '✓' },
  error: { classes: 'border-red-500 text-red-500', accentChar: '⨉' },
};

export function Alert({ message, variant = 'default' }: Props) {
  const { classes, accentChar } = variants[variant];

  return (
    <div className={`flex items-center gap-2 rounded border p-3 ${classes}`}>
      <span className='text-lg font-bold leading-none'>{accentChar}</span>
      <span className='text-sm font-light'>
        {Array.isArray(message) ? (
          message.map((err, index) => <p key={index}>{err}</p>)
        ) : (
          <p>{message}</p>
        )}
      </span>
    </div>
  );
}
