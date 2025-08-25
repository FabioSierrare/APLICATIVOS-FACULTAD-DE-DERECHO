"use client";
import NavBar from "@/components/NavBar";
import { usePathname } from "next/navigation";
import ComponentLink from "@/components/ComponentLink";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname(); // Esto detecta la ruta actual dinámicamente

  return (
    <div className="flex flex-col">
      <NavBar>
        <ComponentLink
          label="Nuevo calendario"
          href="/admin"
          isActive={pathname === "/admin"}
        />
        <ComponentLink
          label="Calendarios"
          href="/admin/calendarios-creados"
          isActive={pathname === "/admin/calendarios-creados"}
        />
        <ComponentLink
          label="Turnos"
          href="/admin/turnos"
          isActive={pathname === "/admin/turnos"}
        />
      </NavBar>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
