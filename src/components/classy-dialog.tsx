import { Dialog, type DialogProps } from '@/components/dialog';

type Props = DialogProps & {
  heading?: string;
  description?: string;
};

export function ClassyDialog({ children, heading, description, ...props }: Props) {
  return (
    <Dialog {...props}>
      {(closeDialog, openDialog) => (
        <div className='flex max-w-sm flex-col gap-2 rounded-md border border-zinc-700 bg-zinc-900 p-4 text-zinc-50'>
          {heading && <h2 className='pr-5 font-medium'>{heading}</h2>}
          {description && <p className='pb-1 text-sm text-zinc-400'>{description}</p>}
          {typeof children === 'function' ? children(closeDialog, openDialog) : children}
          <button
            onClick={closeDialog}
            className='btn btn-danger absolute right-2 top-2 size-7 bg-opacity-0 p-0 text-red-500 shadow-none outline-offset-0 transition-colors hover:scale-100 hover:bg-opacity-20'
          >
            ⨉
          </button>
        </div>
      )}
    </Dialog>
  );
}
