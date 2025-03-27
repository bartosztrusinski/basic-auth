import { signOut } from '@/auth';

export async function POST() {
  try {
    await signOut();
  } catch {
    return Response.json({ error: 'Failed to sign out' }, { status: 500 });
  }

  return Response.json({ message: 'Successfully signed out' });
}
