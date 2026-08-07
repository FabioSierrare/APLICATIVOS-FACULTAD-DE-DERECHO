"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  User,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  LayoutDashboard,
  X,
  ExternalLink,
  Headphones
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter();
  const pathname = usePathname();

  // Control de submenús abiertos
  const [openSubmenus, setOpenSubmenus] = useState({
    calendario: false,
    usuarios: false,
    turnos: false,
  });

  // Expandir automáticamente el submenú correspondiente si la ruta coincide
  useEffect(() => {
    if (pathname.startsWith("/admin/calendarios") || pathname.startsWith("/home/calendario")) {
      setOpenSubmenus((prev) => ({ ...prev, calendario: true }));
    } else if (pathname.startsWith("/admin/usuarios") || pathname.startsWith("/home/usuarios")) {
      setOpenSubmenus((prev) => ({ ...prev, usuarios: true }));
    } else if (pathname.startsWith("/admin/turnos") || pathname.startsWith("/home/turnos")) {
      setOpenSubmenus((prev) => ({ ...prev, turnos: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  type SubItem = { label: string; route: string };
  type MenuItem = {
    id: string;
    label: string;
    icon?: any;
    route?: string;
    subItems?: SubItem[];
  };

  const menuSections: MenuItem[] = [
    {
      id: "calendario",
      label: "Calendarios",
      icon: Calendar,
      subItems: [
        { label: "Ver calendarios", route: "/admin/calendarios-creados" },
        { label: "Crear calendario", route: "/admin/" },
        { label: "Bloquear días", route: "/admin/bloqueo-dias" },
        { label: "Asignación de asesores", route: "/admin/asesores-calendario" },
        { label: "Horarios de turnos", route: "/admin/horario" },
      ],
    },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      subItems: [
        { label: "Gestión de usuarios", route: "/admin/usuarios/informacion" },
        { label: "Registrar estudiante", route: "/admin/usuarios/registro-estudiante" },
        { label: "Carga masiva de estudiantes", route: "/admin/usuarios" },
        { label: "Registrar asesor", route: "/admin/usuarios/registro-asesores" },
      ],
    },
    {
      id: "turnos",
      label: "Turnos",
      icon: Clock,
      subItems: [
        { label: "Listado de turnos", route: "/admin/turnos" },
        { label: "Agendar turno", route: "/admin/turnos/crear"},
        { label: "Reagendamiento y cambios", route: "/admin/turnos/cambio-turno" },
        { label: "Notificaciones de turnos", route: "/admin/turnos/notificar" },
      ],
    },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-primary shadow-2xl transform transition-transform duration-300 ease-in-out
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 flex flex-col justify-between overflow-y-auto`}
      >
        <div>
          {/* Header del Sidebar */}
          <div className="p-6 text-center border-b border-white/10 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden absolute right-4 top-4 text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-lg border-4 border-secondary">
              <img src="/img/Logo.png" alt="Logo Universidad" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-white font-bold text-xs leading-tight tracking-wide uppercase">
              Universidad Colegio Mayor de Cundinamarca
            </h1>
          </div>

          {/* Menú Principal */}
          <div className="px-4 pt-6 pb-2">
            <p className="text-[10px] font-semibold text-white/40 tracking-wider uppercase px-3 mb-2">
              Menú Principal
            </p>
            <nav className="space-y-1">
              {menuSections.map((item) => {
                const Icon = item.icon;
                const hasSubItems = Boolean(item.subItems);
                const isSubOpen = openSubmenus[item.id];
                const isActive = item.route ? pathname === item.route : false;

                return (
                  <div key={item.id} className="space-y-1">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                          ${
                            isSubOpen
                              ? "bg-white/10 text-white font-semibold"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isSubOpen ? "text-secondary" : ""} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isSubOpen ? "rotate-180 text-secondary" : "text-white/50"
                          }`}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          router.push(item.route);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                          ${
                            isActive
                              ? "bg-secondary text-primary font-bold shadow-md"
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    )}

                    {/* Desplegable de submenús */}
                    {hasSubItems && isSubOpen && (
                      <div className="pl-9 pr-2 py-1 space-y-1 border-l-2 border-white/10 ml-5 my-1">
                        {item.subItems.map((sub, index) => {
                          const isSubActive = pathname === sub.route;
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setIsOpen(false);
                                router.push(sub.route);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors block truncate
                                ${
                                  isSubActive
                                    ? "bg-secondary/20 text-secondary font-bold"
                                    : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer del Sidebar con Card de Soporte e Info de Usuario */}
        <div className="p-4 space-y-4">
          {/* Card de Soporte 
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white">
            <div className="p-2 bg-secondary/20 text-secondary w-fit rounded-xl mb-3">
              <Headphones size={20} />
            </div>
            <p className="text-xs font-bold mb-1">¿Necesitas ayuda?</p>
            <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
              Consulta la guía o contacta al soporte del sistema.
            </p>
            <button
              onClick={() => window.open("/guia", "_blank")}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-xs font-semibold text-white"
            >
              Ver guía
              <ExternalLink size={14} />
            </button>
          </div>
          */}

          {/* Información del Usuario y Logout */}
          <div className="bg-black/20 border border-white/10 rounded-2xl p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-full text-primary shrink-0">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Administrador</p>
                <p className="text-[10px] text-secondary truncate">Consultorio Jurídico</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/70 hover:text-white hover:bg-red-500/80 transition-all duration-200 font-medium text-xs group"
            >
              <LogOut
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}