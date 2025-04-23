type Props = {
  error: string | string[];
};

export function ErrorAlert({ error }: Props) {
  return (
    <div className='flex items-center gap-2 rounded border border-red-500 p-3 text-red-500'>
      <span className='text-lg font-bold leading-none'>⨉</span>
      <span className='text-sm font-light'>
        {Array.isArray(error) ? (
          error.map((err, index) => <p key={index}>{err}</p>)
        ) : (
          <p>{error}</p>
        )}
      </span>
    </div>
  );
}
