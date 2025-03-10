import type { NextRequest } from 'next/server';
import { refreshSession } from '@/lib';

export async function middleware(request: NextRequest) {
  return await refreshSession(request);
}
