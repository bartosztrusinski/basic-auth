import type z from 'zod';
import { type ZodSchema, type ZodType } from 'zod';
import { type AuthCode } from '@/auth/message';

export type ActionState<T extends ZodSchema = z.ZodAny> = ActionSuccess | ActionFailure<T>;

export type ActionDataState<T extends Record<string, unknown>, U extends ZodSchema = z.ZodAny> =
  | (ActionSuccess & { data: T })
  | ActionFailure<U>;

export type ActionSuccess = {
  isSuccess: true;
  authCode?: undefined;
  errors?: undefined;
};

export type ActionFailure<T extends ZodType = z.ZodAny> = {
  isSuccess: false;
  authCode?: AuthCode;
  errors: string | string[];
  data?: undefined;
  fields?: Partial<z.infer<T>>;
};
