export type User = {
  email: string;
  name: string;
  password: string;
};

export const users: User[] = [
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
