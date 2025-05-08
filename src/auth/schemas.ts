import { z } from 'zod';

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

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  scope: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

const totpSchema = z.object({
  token: z
    .string()
    .min(1, 'Please enter a valid 6-digit code')
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit code'),
});

// Provider specific user schemas - add more properties as needed

const discordUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  verified: z.boolean().refine((value) => value, {
    message: 'Verify your email with Discord first',
  }),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  banner: z.string().nullish(),
  accent_color: z.number().int().nullish(),
});

const githubUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  login: z.string(),
  avatar_url: z.string().url(),
  html_url: z.string().url(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  company: z.string().nullable(),
  blog: z.string().nullable(),
});

const googleUserSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.boolean().refine((value) => value, {
    message: 'Verify your email with Google first',
  }),
  name: z.string().optional(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().url().optional(),
});

export {
  signupSchema,
  loginSchema,
  resendVerificationEmailSchema,
  addPasswordSchema,
  oAuthTokenSchema,
  totpSchema,
  discordUserSchema,
  githubUserSchema,
  googleUserSchema,
};
