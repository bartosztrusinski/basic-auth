import { getProviderName, type StateData } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { OAuthLoginButton } from './oauth-login-button';

type Props = StateData;

export function OAuthLoginButtons({ ...stateData }: Props) {
  return (
    <ul role='list' className='grid auto-cols-fr grid-flow-col gap-2'>
      {OAuthProviderEnum.options.map((provider) => (
        <li key={provider}>
          <OAuthLoginButton provider={provider} name={getProviderName(provider)} {...stateData} />
        </li>
      ))}
    </ul>
  );
}
