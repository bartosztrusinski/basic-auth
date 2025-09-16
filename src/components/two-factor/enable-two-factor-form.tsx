'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { Card, CardHeader, CardDescription } from '@/components/ui/card';
import { TwoFactorInitializationForm } from './two-factor-initialization-form';
import { TwoFactorConfirmationForm } from './two-factor-confirmation-form';
import { TwoFactorRecoveryCodes } from './two-factor-recovery-codes';
import { type TwoFactorSetupState } from './types';

const twoFactorFormSteps = [
  {
    title: 'Enable Two-Factor Authentication',
    description:
      'To enhance your account security, it is recommended to enable 2FA authentication. This will require a second form of verification in addition to your password. You will need an authenticator app.',
    component: TwoFactorInitializationForm,
  },
  {
    title: 'Enable Two-Factor Authentication',
    description:
      'Scan the QR code below with your authenticator app or enter the code manually to set up two-factor authentication.',
    component: TwoFactorConfirmationForm,
  },
  {
    title: 'Two-Factor Authentication Enabled',
    description:
      'Two-Factor Authentication has been enabled! Please save your recovery codes in a safe place. You will need them to access your account if you lose access to your authenticator app.',
    component: TwoFactorRecoveryCodes,
  },
];

export function EnableTwoFactorForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<TwoFactorSetupState>({
    qrCode: '',
    secret: '',
    recoveryCodes: [],
  });
  const stepData = twoFactorFormSteps[currentStep];
  const isLastStep = currentStep === twoFactorFormSteps.length - 1;

  function goToNextStep(data: Partial<TwoFactorSetupState>) {
    setSetupData((prevData) => ({ ...prevData, ...data }));
    setCurrentStep((prevStep) => prevStep + 1);
  }

  useEffect(() => {
    return () => {
      if (isLastStep) {
        const { message } = getAuthMessage('two-factor-enabled');
        toast.success(message);
        router.refresh();
      }
    };
  }, [currentStep, isLastStep, router]);

  if (!stepData) {
    return null;
  }

  const StepComponent = stepData.component;

  return (
    <Card>
      <CardHeader>
        <h2>{stepData.title}</h2>
      </CardHeader>
      <CardDescription>{stepData.description}</CardDescription>
      <StepComponent {...setupData} onSuccess={goToNextStep} />
    </Card>
  );
}
