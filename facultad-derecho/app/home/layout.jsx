"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, User, Calendar, List, ChevronRight } from "lucide-react";

export default function HomeLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detecta automáticamente qué menú está activo según la URL
  useEffect(() => {
    if (pathname === "/home") setActiveTab("registro");
    else if (pathname.startsWith("/home/turnos")) setActiveTab("mis-turnos");
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  const MenuButton = ({ id, label, icon: Icon, route }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
        router.push(route); // Navegación correcta
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-l-full
        ${
          activeTab === id
            ? "bg-secondary text-primary font-bold shadow-md translate-x-2"
            : "text-white hover:bg-white/10"
        }`}
    >
      <Icon size={20} />
      <span>{label}</span>
      {activeTab === id && <ChevronRight className="ml-auto" size={16} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary shadow-2xl transform transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col justify-between`}
      >
        <div className="p-6 text-center border-b border-white/10">
          <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-secondary">
            <span className="text-primary font-bold text-2xl">UCMC</span>
          </div>
          <h1 className="text-white font-bold text-sm leading-tight tracking-wide">
            UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA
          </h1>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-8 pl-4 space-y-2">
          <MenuButton
            id="registro"
            label="Registro de Turnos"
            icon={Calendar}
            route="/home"
          />

          <MenuButton
            id="mis-turnos"
            label="Mis Turnos"
            icon={List}
            route="/home/turnos"
          />
        </nav>

        <div className="p-5 bg-black/20 border-t border-white/10">
          <div className="flex items-center gap-3 text-white mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="p-2 bg-secondary rounded-full text-primary shrink-0">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Estudiante</p>
              <p className="text-xs text-secondary truncate">Derecho</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-red-500/80 transition-all duration-300 font-medium text-sm group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 transition-all">
        <div className="md:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-secondary">
              UC
            </div>
            <span className="font-bold text-primary">Portal Estudiante</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-primary text-white rounded-md shadow-lg"
          >
            <Menu />
          </button>
        </div>

        {children}
      </main>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        ></div>
      )}
    </div>
  );
}
