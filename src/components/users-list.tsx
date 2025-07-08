import { getUsers } from '@/data/user';
import { Protect } from '@/auth/components/protect';

export async function UsersList() {
  const users = await getUsers();
  const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <Protect
      when={(user) => user.role !== 'admin'}
      fallback={<p className='text-center'>You do not have permissions to view user data</p>}
    >
      <ul className='max-h-80 space-y-3 overflow-y-auto'>
        {users.map((user) => (
          <li key={user.id} className='rounded bg-neutral-800 p-2 px-4 shadow'>
            <div className='flex items-center justify-between gap-2'>
              {user.name}
              <strong className='font-mono font-medium text-primary-500'>{user.role}</strong>
            </div>
            <span className='text-sm text-neutral-500'>
              Created on {dateFormatter.format(user.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </Protect>
  );
}
