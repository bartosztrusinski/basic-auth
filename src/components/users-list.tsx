import { Protect } from '@/auth/components/protect';
import { db } from '@/db';

export async function UsersList() {
  const users = await db.getUsers();

  return (
    <Protect
      role='admin'
      fallback={<p className='text-center'>You do not have permission to view this data.</p>}
    >
      <ul className='max-h-80 space-y-3 overflow-y-auto px-2'>
        {users.map((user) => (
          <li
            key={user.id}
            className='flex flex-wrap items-center justify-between gap-3 rounded bg-zinc-800 p-3 shadow'
          >
            <div className='flex flex-col'>
              <strong>{user.name}</strong> ({user.email})
            </div>
            <div className='text-sm text-zinc-400'>{user.role}</div>
          </li>
        ))}
      </ul>
    </Protect>
  );
}
