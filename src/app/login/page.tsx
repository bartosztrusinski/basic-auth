export default function LoginPage() {
  return (
    <form className='flex flex-col gap-2'>
      <input type='email' name='email' placeholder='Email' />
      <input type='password' name='password' placeholder='*****' />
      <button>Login</button>
    </form>
  );
}
