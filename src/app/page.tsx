'use client';

import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { accessToken } = useAuth();

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Basic Auth</h1>
      <p className='break-words'>
        {accessToken ? `Welcome back ${accessToken}` : 'You are not logged in'}
      </p>
    </div>
  );
}
