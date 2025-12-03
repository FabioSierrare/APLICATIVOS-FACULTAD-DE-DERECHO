"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Definición de la estructura del menú para mantener el código limpio
  const menuItems = [
    {
      title: "Calendario",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      subLinks: [
        { name: "Ver calendario", href: "/calendario" },
        { name: "Crear calendario", href: "/calendario/crear" },
      ],
    },
    {
      title: "Usuario",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      subLinks: [
        { name: "Agregar listado de estudiante", href: "/usuarios/listado" },
        { name: "Agregar Estudiante", href: "/usuarios/agregar" },
        { name: "Información de estudiantes", href: "/usuarios/info" },
      ],
    },
    {
      title: "Turnos",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      subLinks: [
        { name: "Ver turnos", href: "/turnos" },
        { name: "Crear Turnos", href: "/turnos/crear" },
        { name: "Cambiar turno", href: "/turnos/cambiar" },
        { name: "Notificar turnos", href: "/turnos/notificar" },
      ],
    },
  ];

  return (
    // Usamos valores arbitrarios de Tailwind ([#hex]) para los colores específicos
    <nav className="bg-[#553285] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo o Título del Dashboard */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-white font-semibold text-sm flex items-center gap-2"
            >
              {/* LOGO AJUSTADO */}
              <div className="w-15 h-15">
                <img
                  src="/img/Logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <span className="text-center text-sm">
                UNIVERSIDAD COLEGIO <br/>MAYOR DE CUNDINAMARCA
              </span>
            </Link>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            {menuItems.map((item, index) => (
              <div key={index} className="relative group">
                <button className="text-white hover:text-[#FFCE21] px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200">
                  {item.icon}
                  {item.title}
                  {/* Flecha pequeña */}
                  <svg
                    className="w-4 h-4 mt-0.5 group-hover:rotate-180 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Desktop */}
                <div className="absolute left-0 mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50 transform group-hover:translate-y-0 translate-y-2">
                  <div className="rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden bg-white">
                    <div className="py-1" role="menu">
                      {item.subLinks.map((subLink, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subLink.href}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#553285] hover:border-l-4 hover:border-[#FFCE21] transition-all"
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón Menú Móvil */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#FFCE21] focus:outline-none"
            >
              <span className="sr-only">Abrir menú</span>
              {isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil (Responsive) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#4a2b75]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === index ? null : index)
                  }
                  className="w-full text-left text-white hover:text-[#FFCE21] px-3 py-2 rounded-md text-base font-medium flex justify-between items-center"
                >
                  <span className="flex items-center gap-2">
                    {item.icon} {item.title}
                  </span>
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      activeDropdown === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Submenú Móvil */}
                {activeDropdown === index && (
                  <div className="pl-8 space-y-1 bg-[#422669] py-2">
                    {item.subLinks.map((subLink, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subLink.href}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-[#FFCE21] hover:bg-white/5"
                        onClick={() => setIsMobileMenuOpen(false)} // Cerrar menú al hacer click
                      >
                        {subLink.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
