import { useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import config from '@/auth/config';

export function useRemoveAuthCode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeAuthCode = useCallback(() => {
    const urlSearchParams = new URLSearchParams(searchParams.toString());
    urlSearchParams.delete(config.authCodeKey);
    router.replace(`${pathname}?${urlSearchParams}`);
  }, [pathname, router, searchParams]);

  return removeAuthCode;
}
