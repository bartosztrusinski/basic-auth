import { z } from 'zod';
import { UserRoles } from '@/db';

const email = z.string().email('Please enter a correct email address').min(1, 'Email is required');
const name = z.string().min(1, 'Please enter your name');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[@$!%*?&]/, 'Password must contain a special character');

const signupSchema = z.object({
  email,
  name,
  password,
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

const editProfileSchema = z.object({
  name,
  role: z.enum(UserRoles, {
    message: `Role must be one of the following: ${UserRoles.join(', ')}`,
    required_error: 'Role is required',
  }),
});

const resendVerificationEmailSchema = z.object({
  email,
});

const addPasswordSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export {
  signupSchema,
  loginSchema,
  editProfileSchema,
  resendVerificationEmailSchema,
  addPasswordSchema,
};
