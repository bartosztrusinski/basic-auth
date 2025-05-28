'use client';

import { useEffect, useRef, useState } from 'react';
import { type TwoFactorData } from '@/components/enable-two-factor';

type Props = {
  recoveryCodes: TwoFactorData['recoveryCodes'];
  onClose?: () => void;
};

function formatCode(code: string, { delimiter = '-', blockLength = 4 } = {}) {
  const regex = new RegExp(`.{${blockLength}}(?!$)`, 'g');
  return code.replace(regex, `$&${delimiter}`);
}

export function RecoveryCodes({ recoveryCodes, onClose }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutId = useRef<number>();

  async function copyCodesToClipboard() {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));

    setIsCopied(true);
    clearCurrentTimeout();

    timeoutId.current = window.setTimeout(() => {
      setIsCopied(false);
    }, 1200);
  }

  function clearCurrentTimeout() {
    window.clearTimeout(timeoutId.current);
  }

  useEffect(() => {
    return clearCurrentTimeout;
  }, []);

  return (
    <>
      <div className='flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 font-mono selection:bg-amber-500 selection:text-zinc-900'>
        {recoveryCodes.map((code) => (
          <div className='rounded bg-zinc-800 px-2 py-1' key={code}>
            {formatCode(code)}
          </div>
        ))}
      </div>
      <button
        className={`btn my-1 text-sm font-medium ${isCopied ? 'btn-success' : ''}`}
        onClick={copyCodesToClipboard}
      >
        {isCopied ? 'Copied!' : 'Copy to Clipboard'}
      </button>
      <button className='btn text-sm font-bold' onClick={onClose}>
        I have saved Recovery Codes
      </button>
    </>
  );
}
