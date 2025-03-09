export default function RegisterPage() {
  return (
    <form className='flex flex-col gap-2'>
      <input type='email' name='email' placeholder='Email' />
      <input type='password' name='password' placeholder='*****' />
      <button>Register</button>
    </form>
  );
}
