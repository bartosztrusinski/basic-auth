import providerConfig, { OAuthProviderEnum } from '../oauth/providers';
import { ProviderButton } from './provider-button';

export function ProviderButtons() {
  return (
    <ul role='list' className='grid auto-cols-fr grid-flow-col gap-2'>
      {OAuthProviderEnum.options.map((provider) => (
        <li key={provider}>
          <ProviderButton provider={provider} name={providerConfig[provider].name} />
        </li>
      ))}
    </ul>
  );
}
