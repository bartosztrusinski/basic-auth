import { z } from 'zod';

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

export { oAuthTokenSchema, discordUserSchema, githubUserSchema, googleUserSchema };
