import Link from 'next/link';
import Image from 'next/image';

export default function NotFoundPage() {
  return (
    <div className='container flex flex-col items-center'>
      <h1 className='title'>
        <Image src='/logo.png' alt='App logo' width={48} height={48} className='inline-block' />
        <span className='align-middle'>Basic Auth</span>
      </h1>
      <p className='text-neutral-200'>Could not find requested resource</p>
      <Link href='/' className='btn w-fit'>
        Return Home
      </Link>
    </div>
  );
}
