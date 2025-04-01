import { logOut } from '@/actions';

export function LogoutButton() {
  return (
    <form action={logOut}>
      <button>Log Out</button>
    </form>
  );
}
