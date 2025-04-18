import { z } from 'zod';

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

const discordUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  discriminator: z.string(),
  global_name: z.string().nullable(),
  avatar: z.string().nullable(),
  bot: z.boolean().optional(),
  system: z.boolean().optional(),
  mfa_enabled: z.boolean().optional(),
  banner: z.string().nullish(),
  accent_color: z.number().int().nullish(),
  locale: z.string().optional(),
  verified: z.boolean().optional(),
  flags: z.number().int().optional(),
  premium_type: z.number().int().optional(),
  public_flags: z.number().int().optional(),
});

export { oAuthTokenSchema, discordUserSchema };
