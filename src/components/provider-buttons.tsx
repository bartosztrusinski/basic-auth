import { getProviderName, type StateData } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { ProviderButton } from '@/components/provider-button';

type Props = StateData;

export function ProviderButtons({ ...stateData }: Props) {
  return (
    <ul role='list' className='grid auto-cols-fr grid-flow-col gap-2'>
      {OAuthProviderEnum.options.map((provider) => (
        <li key={provider}>
          <ProviderButton provider={provider} name={getProviderName(provider)} {...stateData} />
        </li>
      ))}
    </ul>
  );
}
