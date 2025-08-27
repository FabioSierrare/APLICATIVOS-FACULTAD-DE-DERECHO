"use client";
import Aside from "@/components/Aside";

import { usePathname } from "next/navigation";
import ComponentLink from "@/components/ComponentLink";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // tu estilo de botón
import { LogOut } from "lucide-react"; // ícono opcional

export default function HomeLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const handleLogout = () => {
    // 1. Eliminar token de localStorage
    localStorage.removeItem("token");

    // 2. Eliminar cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // 3. Redirigir al login
    router.push("/");
  };
  return (
    <div className="flex min-h-screen">
      <Aside>
        <div className="flex flex-col justify-between h-screen">
          <div>
            <ComponentLink
              label="Turnos consultorio juridico"
              href="/home"
              isActive={pathname === "/home"}
            />
            <ComponentLink
              label="Mis turnos"
              href="/home/turnos"
              isActive={pathname === "/home/turnos"}
            />
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2 mb-3"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </Aside>
      {children}
    </div>
  );
}
