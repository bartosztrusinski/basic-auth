import { publicAxios } from '@/axios';
import { useAuth } from '@/hooks/use-auth';

export function useRefreshToken() {
  const { setAccessToken } = useAuth();

  const refreshAccessToken = async () => {
    const { data } = await publicAxios.post<{ accessToken: string } | { error: string }>(
      '/api/auth/refresh',
      null,
      { withCredentials: true },
    );

    if ('error' in data) {
      throw new Error(data.error);
    }

    setAccessToken(data.accessToken);
    return data.accessToken;
  };

  return refreshAccessToken;
}
