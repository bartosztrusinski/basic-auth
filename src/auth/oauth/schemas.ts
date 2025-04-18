import { z } from 'zod';

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

// TODO add more fields to the user schema
const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  global_name: z.string(),
  email: z.string().email(),
});

export { oAuthTokenSchema, discordUserSchema };
