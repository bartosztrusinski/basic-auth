'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    if (accessToken) {
      router.replace(redirectTo);
    }
  }, [accessToken, redirectTo, router]);

  if (accessToken) {
    return null;
  }

  return <LoginForm />;
}
