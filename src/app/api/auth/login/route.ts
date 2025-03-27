import { AuthError, signIn } from '@/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { accessToken } = await signIn(email, password);
    return { success: 'Logged in successfully', accessToken };
  } catch (error) {
    return {
      error: error instanceof AuthError ? error.message : 'Failed to log in. Please try again.',
    };
  }
}
