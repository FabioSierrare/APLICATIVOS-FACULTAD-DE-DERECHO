"use client";
import NavBar from "@/components/NavBar";
import { usePathname } from "next/navigation";
import ComponentLink from "@/components/ComponentLink";
import { PlusCircle, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // tu estilo de botón
import { LogOut } from "lucide-react"; // ícono opcional

export default function LayoutAdmin({ children }) {
  const router = useRouter();
  const pathname = usePathname(); // Esto detecta la ruta actual dinámicamente
    const handleLogout = () => {
    // 1. Eliminar token de localStorage
    localStorage.removeItem("token");

    // 2. Eliminar cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // 3. Redirigir al login
    router.push("/");
  };

  return (
    <div className="flex flex-col">
      <NavBar>
        <ComponentLink
          label="Nuevo calendario"
          href="/admin"
          isActive={pathname === "/admin"}
          Icon={PlusCircle}
        />
        <ComponentLink
          label="Calendarios"
          href="/admin/calendarios-creados"
          isActive={pathname === "/admin/calendarios-creados"}
          Icon={Calendar}
        />
        <ComponentLink
          label="Turnos"
          href="/admin/turnos"
          isActive={pathname === "/admin/turnos"}
          Icon={Clock}
        />
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </NavBar>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
