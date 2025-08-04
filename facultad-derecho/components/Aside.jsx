'use client';

import { usePathname } from 'next/navigation';
import ComponentLink from './ComponentLink';

export default function Aside() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-[250px] px-[14px] py-[10px] bg-primary">
     <header className='mb-5'>
      <div>
        <span>
            <img src="./img/Logo-Universidad.webp" alt="logo" />
        </span>
      </div>
      <hr className='text-white'/>
     </header>
       <ComponentLink
        label="Turnos consultorio juridico"
        href="/home"
        isActive={pathname === "/home"}
      />
      <ComponentLink
        label="Mis turnos"
        href="/turnos"
        isActive={pathname === "/turnos"}
      />
    </aside>
  );
}
