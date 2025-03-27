import { publicAxios } from '@/axios';

export async function refreshAccessToken() {
  const { data } = await publicAxios.post<{ accessToken: string } | { error: string }>(
    '/api/auth/refresh',
    null,
    { withCredentials: true },
  );

  if ('error' in data) {
    throw new Error(data.error);
  }

  return data.accessToken;
}
