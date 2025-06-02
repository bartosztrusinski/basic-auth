'use client';

import { useState } from 'react';
import { type RecoveryCode, type TwoFactorSetup } from '@/db';
import { ModalTitle, ModalDescription } from '@/components/classy-modal';
import { InitializeTwoFactorForm } from './initialize-two-factor-form';
import { TwoFactorCodeForm } from './two-factor-code-form';
import { RecoveryCodes } from './recovery-codes';

export type TwoFactorData = {
  qrCode: string;
  secret: TwoFactorSetup['secret'];
  recoveryCodes: RecoveryCode['code'][];
};

const formSteps = [
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
    Component: TwoFactorCodeForm,
  },
  {
    title: 'Two-Factor Authentication Enabled',
    description:
      'Two-Factor Authentication has been enabled! Please save your recovery codes in a safe place. You will need them to access your account if you lose access to your authenticator app.',
    Component: RecoveryCodes,
  },
];

export function EnableTwoFactorForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<TwoFactorData>({
    qrCode: '',
    secret: '',
    recoveryCodes: [],
  });
  const formStep = formSteps[currentStep];

  if (!formStep) {
    return null;
  }

  const { title, description, Component } = formStep;

  function goToNextStep(data: Partial<TwoFactorData>) {
    setData((prevData) => ({
      ...prevData,
      ...data,
    }));
    setCurrentStep((prevStep) => prevStep + 1);
  }

  return (
    <>
      <ModalTitle>
        <h2>{title}</h2>
      </ModalTitle>
      <ModalDescription>{description}</ModalDescription>
      <Component {...data} onSuccess={goToNextStep} />
    </>
  );
}
