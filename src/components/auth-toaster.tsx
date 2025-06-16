'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast, Toaster } from 'sonner';
import { getAuthMessage, type AuthCode } from '@/auth/message';
import config from '@/auth/config';

export function AuthToaster() {
  const params = useSearchParams();
  const router = useRouter();
  const toastId = useRef<number | string>();

  useEffect(() => {
    const searchParams = new URLSearchParams(params.toString());
    const authCode = searchParams.get(config.authCodeKey) as AuthCode | null;

    if (authCode) {
      const authMessage = getAuthMessage(authCode);
      const id = toast[authMessage.type](authMessage.message, {
        id: toastId.current,
      });

      toastId.current = id;

      searchParams.delete(config.authCodeKey);
      router.replace(`?${searchParams}`, { scroll: false });
    }
  }, [params, router]);

  return <Toaster richColors theme='dark' closeButton duration={10000} />;
}
