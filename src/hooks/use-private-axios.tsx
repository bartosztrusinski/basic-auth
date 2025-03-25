import { useEffect } from 'react';
import { type AxiosError } from 'axios';
import { privateAxios } from '@/axios';
import { useAuth } from '@/hooks/use-auth';
import { useRefreshToken } from '@/hooks/use-refresh-token';

type CustomConfig = {
  config?: {
    _retry: boolean;
  };
};

export function usePrivateAxios() {
  const refreshToken = useRefreshToken();
  const { accessToken, setAccessToken } = useAuth();

  useEffect(() => {
    const requestInterceptor = privateAxios.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );

    const responseInterceptor = privateAxios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError & CustomConfig) => {
        const previousRequest = error.config;

        if (error.response?.status === 403 && previousRequest && !previousRequest._retry) {
          previousRequest._retry = true;
          try {
            const newAccessToken = await refreshToken();
            previousRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return privateAxios(previousRequest);
          } catch {
            setAccessToken(null);
          }
        }

        return Promise.reject(error);
      },
    );

    return () => {
      privateAxios.interceptors.request.eject(requestInterceptor);
      privateAxios.interceptors.response.eject(responseInterceptor);
    };
  });

  return privateAxios;
}
