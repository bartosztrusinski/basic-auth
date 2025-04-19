import { z } from 'zod';

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  scope: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
});

const discordUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  discriminator: z.string(),
  verified: z.boolean().refine((val) => val, {
    message: 'Verify your email with Discord first',
  }),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  bot: z.boolean().optional(),
  system: z.boolean().optional(),
  mfa_enabled: z.boolean().optional(),
  banner: z.string().nullish(),
  banner_color: z.string().nullish(),
  accent_color: z.number().int().nullish(),
  locale: z.string().optional(),
  flags: z.number().int().optional(),
  premium_type: z.number().int().optional(),
  public_flags: z.number().int().optional(),
});

const githubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  email: z.string().email(),
  avatar_url: z.string().url(),
  node_id: z.string(),
  name: z.string().nullable(),
  gravatar_id: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  html_url: z.string().url(),
});

export { oAuthTokenSchema, discordUserSchema, githubUserSchema };
