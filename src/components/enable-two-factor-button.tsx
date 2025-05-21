'use client';

import { useActionState, useEffect, useState } from 'react';
import { initiateTwoFactorAuth } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';
import { EnableTwoFactorForm } from '@/components/enable-two-factor-form';
import { getAuthMessage } from '@/auth/message';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Data = {
  qrCode: string;
  secret: string;
  recoveryCodes: string[];
};

const steps = [
  {
    title: 'Enable Two-Factor Authentication',
    description:
      'To enhance your account security, we recommend enabling two-factor authentication. This will require a second form of verification in addition to your password. You will need an authenticator app to generate the verification codes.',
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

export function EnableTwoFactorButton() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Data>({
    qrCode: '',
    secret: '',
    recoveryCodes: [],
  });
  const stepData = steps[currentStep];

  if (!stepData) {
    return null;
  }

  function handleClose() {
    if (currentStep === steps.length - 1) {
      const { message } = getAuthMessage('two-factor-enabled');
      toast.success(message);
      router.refresh();
    }

    setCurrentStep(0);
  }

  function goToNextStep(data: Partial<Data>) {
    setData((prevData) => ({
      ...prevData,
      ...data,
    }));
    setCurrentStep((prevStep) => prevStep + 1);
  }

  return (
    <ClassyDialog
      trigger={
        <button className='w-full rounded border border-zinc-500 p-2'>
          Enable Two-Factor Authentication
        </button>
      }
      onClose={handleClose}
      shouldCloseOnBackdropClick={false}
      heading={stepData.title}
      description={stepData.description}
    >
      {(closeDialog) => (
        <stepData.Component {...data} onSuccess={goToNextStep} onClose={closeDialog} />
      )}
    </ClassyDialog>
  );
}

type InitializeTwoFactorFormProps = {
  onSuccess?: (data: Partial<Data>) => void;
};

function InitializeTwoFactorForm({ onSuccess }: InitializeTwoFactorFormProps) {
  const [state, action, isPending] = useActionState(initiateTwoFactorAuth, {
    isSuccess: false,
  });

  useEffect(() => {
    if (state.isSuccess) {
      const { qrCode, secret } = state;
      onSuccess?.({ qrCode, secret });
    }
  }, [state, onSuccess]);

  return (
    <form action={action}>
      <button disabled={isPending} className='w-full rounded border border-zinc-500 p-2'>
        {isPending ? 'Initiating...' : 'Continue'}
      </button>
    </form>
  );
}

type RecoveryCodesProps = {
  recoveryCodes: string[];
  onClose?: () => void;
};

function RecoveryCodes({ recoveryCodes, onClose }: RecoveryCodesProps) {
  return (
    <div className='flex flex-col items-center gap-4'>
      <code className='break-all rounded bg-zinc-800 px-3 py-1.5'>
        {recoveryCodes.map((code) => (
          <div key={code} className='mb-2'>
            {code}
          </div>
        ))}
      </code>
      <button className='w-full rounded border border-zinc-500 p-2' onClick={onClose}>
        I have saved my recovery codes
      </button>
    </div>
  );
}
