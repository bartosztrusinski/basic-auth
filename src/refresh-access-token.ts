import { type ExtendedRequestInit } from '@/hooks/use-auth';

export async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    _shouldRetry: false,
  } as ExtendedRequestInit);

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = (await response.json()) as { accessToken: string };

  return data.accessToken;
}
