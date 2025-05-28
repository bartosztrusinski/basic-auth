'use client';

import { type ReactNode } from 'react';
import Link, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';

type Props = LinkProps & {
  children: ReactNode;
  className?: string;
};

export function NavLink({ children, className, ...props }: Props) {
  const pathname = usePathname();
  const isActive = pathname === props.href;

  return (
    <Link
      {...props}
      className={`link hover:text-primary-500 text-inherit hover:no-underline ${isActive ? 'text-primary-500' : ''} ${className}`}
    >
      {children}
    </Link>
  );
}
