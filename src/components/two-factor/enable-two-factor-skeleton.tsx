import { ModalContainer } from '@/components/ui/classy-modal';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { Spinner } from '@/components/ui/spinner';

export function EnableTwoFactorSkeleton() {
  return (
    <ModalContainer>
      <SkeletonBlock className='h-6 w-3/4' />
      <div className='mt-2 w-11/12 space-y-2'>
        <SkeletonBlock className='h-4' />
        <SkeletonBlock className='h-4' />
        <SkeletonBlock className='h-4' />
        <SkeletonBlock className='h-4 w-3/4' />
      </div>
      <SkeletonBlock className='w-96' />
      <button disabled className='btn'>
        <Spinner className='mx-auto' />
      </button>
    </ModalContainer>
  );
}
