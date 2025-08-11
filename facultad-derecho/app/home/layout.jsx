"use client";
import Aside from "@/components/Aside";

import { usePathname } from "next/navigation";
import ComponentLink from "@/components/ComponentLink";

export default function HomeLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <Aside>
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
      </Aside>
      {children}
    </div>
  );
}
