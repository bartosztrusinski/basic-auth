import { type TwoFactorData } from '@/components/enable-two-factor';

type Props = {
  recoveryCodes: TwoFactorData['recoveryCodes'];
  onClose?: () => void;
};

function formatRecoveryCode(code: string, { delimiter = '-', blockLength = 4 } = {}) {
  const regex = new RegExp(`.{${blockLength}}(?!$)`, 'g');
  return code.replace(regex, `$&${delimiter}`);
}

export function RecoveryCodes({ recoveryCodes, onClose }: Props) {
  return (
    <>
      <code className='flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2'>
        {recoveryCodes.map((code) => (
          <div className='rounded bg-zinc-800 px-2 py-1' key={code}>
            {formatRecoveryCode(code)}
          </div>
        ))}
      </code>
      <button
        className='rounded border border-zinc-700 p-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
        onClick={onClose}
      >
        I have saved my recovery codes
      </button>
    </>
  );
}
