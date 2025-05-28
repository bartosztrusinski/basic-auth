'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthMessage } from '@/auth/message';
import { ClassyDialog } from '@/components/classy-dialog';
import { steps, type TwoFactorData } from '@/components/enable-two-factor';

export function EnableTwoFactorButton() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<TwoFactorData>({
    qrCode: '',
    secret: '',
    recoveryCodes: [],
  });
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!step) {
    return null;
  }

  function handleClose() {
    if (isLastStep) {
      const { message } = getAuthMessage('two-factor-enabled');
      toast.success(message);
      router.refresh();
    }

    setCurrentStep(0);
  }

  function goToNextStep(data: Partial<TwoFactorData>) {
    setData((prevData) => ({
      ...prevData,
      ...data,
    }));
    setCurrentStep((prevStep) => prevStep + 1);
  }

  return (
    <ClassyDialog
      trigger={<button className='btn'>Enable Two-Factor Authentication</button>}
      onClose={handleClose}
      shouldCloseOnBackdropClick={false}
      heading={step.title}
      description={step.description}
    >
      {(closeDialog) => <step.Component {...data} onSuccess={goToNextStep} onClose={closeDialog} />}
    </ClassyDialog>
  );
}
