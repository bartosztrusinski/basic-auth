import { type FormHTMLAttributes, type DetailedHTMLProps } from 'react';

type Props = DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
  confirmText: string;
  onCancel: () => void;
  isPending?: boolean;
  className?: string;
};

export function ConfirmForm({ confirmText, onCancel, isPending, className, ...formProps }: Props) {
  return (
    <form {...formProps} className='flex items-center justify-end gap-2'>
      <button
        type='submit'
        disabled={isPending}
        className={`btn w-auto px-4 py-1 text-sm ${className}`}
      >
        {confirmText}
      </button>
      <button type='button' onClick={onCancel} className='btn w-auto px-4 py-1 text-sm'>
        Cancel
      </button>
    </form>
  );
}
