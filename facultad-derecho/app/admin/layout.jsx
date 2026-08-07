"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar/Sidebar";
import { Menu } from "lucide-react";

export default function LayoutAdmin({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // 1. Eliminar token de localStorage
    localStorage.removeItem("token");

    // 2. Eliminar cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // 3. Redirigir al login
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar pasándole el control del menú móvil */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* Contenido principal con min-w-0 para evitar desbordamiento flexbox */}
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 md:pl-72 transition-all duration-300">
        {/* Header móvil para abrir el Sidebar en pantallas pequeñas */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center text-white font-bold text-xs">
              UC
            </div>
            <span className="font-bold text-slate-800 text-sm">
              Portal Administrativo
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-purple-800 text-white rounded-xl hover:bg-purple-900 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}