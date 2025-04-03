import { type ReactNode } from 'react';

function Page({ children }: { children: ReactNode }) {
  return <div className='space-y-4'>{children}</div>;
}

function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className='text-center text-3xl font-bold'>{children}</h1>;
}

function PageDescription({ children }: { children: ReactNode }) {
  return <p className='text-pretty text-center'>{children}</p>;
}

Page.Title = PageTitle;
Page.Description = PageDescription;

export { Page };
