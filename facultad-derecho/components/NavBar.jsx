import { useState } from "react";

export default function NavBar({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 mb-5 z-30 border-b bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF] backdrop-blur supports-[backdrop-filter]:bg-primary/80">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="place-items-center w-12 rounded-2xl bg-white/20 text-white">
            <img src="/img/Logo.png" alt="logo" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-center text-white">
              Universidad Colegio <br /> Mayor de Cundinamarca
            </h1>
          </div>
        </div>

        {/* Links escritorio */}
        <div className="hidden md:flex items-center gap-5">{children}</div>

        {/* Botón hamburguesa móvil */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"} {/* puedes usar iconos de lucide/react o heroicons */}
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 flex flex-col gap-3 bg-gradient-to-r from-primary via-[#6A3BAF] to-[#7A5BCF]">
          {children}
        </div>
      )}
    </header>
  );
}
