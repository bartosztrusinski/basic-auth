export const metadata = {
  title: 'About',
};

export default function AboutPage() {
  return (
    <div className='container'>
      <h1 className='title'>About</h1>
      <p className='text-center'>
        This is a public route that can be accessed by anyone. It does not require authentication.
      </p>
    </div>
  );
}
