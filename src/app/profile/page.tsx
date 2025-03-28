'use client';

import { UserProfile } from '@/components/user-profile';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.replace('/');
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return null;
  }

  return <UserProfile />;
}
