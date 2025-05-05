import { z } from 'zod';
import { UserRoles } from '@/db';

const editProfileSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  role: z.enum(UserRoles, {
    message: `Role must be one of the following: ${UserRoles.join(', ')}`,
    required_error: 'Role is required',
  }),
});

export { editProfileSchema };
