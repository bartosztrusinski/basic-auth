import { z } from 'zod';

const email = z
  .string({ message: 'Email is required' })
  .email('Please enter a correct email address')
  .min(1, 'Email is required');

const password = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[#?!@$%^&*-]/, 'Password must contain a special character');

const signupSchema = z.object({
  email,
  name: z
    .string({ message: 'Name is required' })
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be at most 16 characters long'),
  password,
});

const loginSchema = z.object({
  email,
  password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
});

const resendVerificationEmailSchema = z.object({
  email,
});

const addPasswordSchema = z
  .object({
    email,
    password,
    confirmPassword: z
      .string({ message: 'Password confirmation is required' })
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// TODO dont use hardcoded length
const twoFactorCodeSchema = z.object({
  code: z
    .string({ message: 'Code is required' })
    .min(1, 'Please enter a valid 6-digit code')
    .regex(/^\d{6}$/, 'Please enter a valid 6-digit code'),
});

// TODO dont use hardcoded length
const recoveryCodeSchema = z.object({
  code: z
    .string({ message: 'Recovery code is required' })
    .min(1, 'Please enter a valid recovery code')
    .regex(
      /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]{12}$/,
      'Please enter a valid recovery code',
    ),
});

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  scope: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
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
  twoFactorCodeSchema,
  recoveryCodeSchema,
  oAuthTokenSchema,
  discordUserSchema,
  githubUserSchema,
  googleUserSchema,
};
