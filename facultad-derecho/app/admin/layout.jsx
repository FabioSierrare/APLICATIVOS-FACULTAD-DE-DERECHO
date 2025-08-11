"use client";
import Aside from "@/components/Aside";

import { usePathname } from "next/navigation";
import ComponentLink from "@/components/ComponentLink";
export default function LayoutAdmin({children}) {
  const pathname = usePathname();

  return (
    <div className="flex justify-between">
      <Aside>
        <ComponentLink
          label="CALENDARIO CONSULTORIO"
          href="/admin"
          isActive={pathname === "/admin"}
        />
        <ComponentLink
          label="LISTA DE CALENDARIOS"
          href="/admin/calendarios-creados"
          isActive={pathname === "/admin/calendarios-creados"}
        />
      </Aside>
      {children}
    </div>
  );
}
