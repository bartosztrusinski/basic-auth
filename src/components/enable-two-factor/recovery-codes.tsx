'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { type TwoFactorData } from '@/components/enable-two-factor';
import { ModalCloseButton } from '@/components/modal';
import { formatCode } from '@/util';

type Props = {
  recoveryCodes: TwoFactorData['recoveryCodes'];
};

export function RecoveryCodes({ recoveryCodes }: Props) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutId = useRef<number>();
  const router = useRouter();

  function handleClose() {
    const { message } = getAuthMessage('two-factor-enabled');
    toast.success(message);
    router.refresh();
  }

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
      <div className='flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2 py-2 font-mono'>
        {recoveryCodes.map((code) => (
          <div className='rounded bg-neutral-800 px-2 py-1' key={code}>
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
      <ModalCloseButton>
        <button className='btn text-sm font-bold' onClick={handleClose}>
          I have saved Recovery Codes
        </button>
      </ModalCloseButton>
    </>
  );
}
