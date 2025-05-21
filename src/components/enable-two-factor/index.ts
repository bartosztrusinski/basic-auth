import { type TwoFactorSetup, type RecoveryCode } from '@/db';
import { EnableTwoFactorButton } from './enable-two-factor-button';
import { EnableTwoFactorForm } from './enable-two-factor-form';
import { InitializeTwoFactorForm } from './initialize-two-factor-form';
import { RecoveryCodes } from './recovery-codes';

export type TwoFactorData = {
  qrCode: string;
  secret: TwoFactorSetup['secret'];
  recoveryCodes: RecoveryCode['code'][];
};

export const steps = [
  {
    title: 'Enable Two-Factor Authentication',
    description:
      'To enhance your account security, it is recommended to enable 2FA authentication. This will require a second form of verification in addition to your password. You will need an authenticator app.',
    Component: InitializeTwoFactorForm,
  },
  {
    title: 'Enable Two-Factor Authentication',
    description:
      'Scan the QR code below with your authenticator app or enter the code manually to set up two-factor authentication.',
    Component: EnableTwoFactorForm,
  },
  {
    title: 'Two-Factor Authentication Enabled',
    description:
      'Two-Factor Authentication has been enabled! Please save your recovery codes in a safe place. You will need them to access your account if you lose access to your authenticator app.',
    Component: RecoveryCodes,
  },
];

export { EnableTwoFactorButton };
