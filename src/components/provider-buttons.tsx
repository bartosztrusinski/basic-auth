import { getProviderName } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { ProviderButton } from '@/components/provider-button';

export function ProviderButtons() {
  return (
    <ul role='list' className='grid auto-cols-fr grid-flow-col gap-2'>
      {OAuthProviderEnum.options.map((provider) => (
        <li key={provider}>
          <ProviderButton provider={provider} name={getProviderName(provider)} />
        </li>
      ))}
    </ul>
  );
}
