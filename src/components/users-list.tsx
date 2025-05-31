import { db } from '@/db';
import { Protect } from '@/auth/components/protect';

export async function UsersList() {
  const users = await db.getUsers();

  return (
    <Protect
      when={(user) => user.role !== 'admin'}
      fallback={<p className='text-center'>You do not have permission to view this data</p>}
    >
      <ul className='max-h-80 space-y-3 overflow-y-auto'>
        {users.map((user) => (
          <li key={user.id} className='rounded bg-neutral-800 p-2 px-4 shadow'>
            <div className='flex items-center justify-between gap-2'>
              {user.name}
              <strong className='font-mono font-medium text-primary-500'>{user.role}</strong>
            </div>
            <span className='text-sm'>{user.email}</span>
          </li>
        ))}
      </ul>
    </Protect>
  );
}
