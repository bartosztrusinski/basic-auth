import { type RecoveryCode } from '@/data/recovery-code';

export type TwoFactorSetupState = {
  qrCode: string;
  secret: string;
  recoveryCodes: RecoveryCode['code'][];
};
