import 'server-only';

export type User = {
  email: string;
  name: string;
  password: string;
};

export function createUser(newUser: User) {
  const existingUser = getUserByEmail(newUser.email);

  if (existingUser) {
    throw new Error('Email already in use');
  }

  users.push(newUser);

  return newUser;
}

export function updateUser(email: User['email'], name: User['name']) {
  const currentUser = getUserByEmail(email);

  if (!currentUser) {
    throw new Error('User not found');
  }

  currentUser.name = name;

  return currentUser;
}

export function getUsers() {
  return users;
}

export function getUserByEmail(email: User['email']) {
  return users.find((user) => user.email === email);
}

const users: User[] = [
  {
    email: 'basic@auth.com',
    name: 'User123',
    password: 'password123',
  },
  {
    email: 'john@doe.com',
    name: 'John_Doe',
    password: '123',
  },
];
