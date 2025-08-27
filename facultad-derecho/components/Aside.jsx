'use client';

import { usePathname } from 'next/navigation';

export default function Aside({children}) {
  const pathname = usePathname();

  return (
    <aside className="h-screen sticky top-0 w-[250px] flex flex-col bg-primary">
     <header className='mb-5'>
      <div>
        <span>
            <img src="../img/Logo-Universidad.webp" alt="logo" />
        </span>
      </div>
      <hr className='text-white'/>
     </header>

      {children}
    </aside>
  );
}
