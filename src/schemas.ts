import { z } from 'zod';

const email = z.string().email('Invalid email address');

const signupSchema = z.object({
  email,
  name: z.string().min(1, 'Name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[@$!%*?&]/, 'Password must contain a special character'),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

const editProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['user', 'admin'], {
    message: 'Role must be either user or admin',
    required_error: 'Role is required',
  }),
});

const resendVerificationEmailSchema = z.object({
  email,
});

export { signupSchema, loginSchema, editProfileSchema, resendVerificationEmailSchema };
