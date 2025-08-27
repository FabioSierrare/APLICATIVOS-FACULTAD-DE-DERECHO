import React from "react";

export default function ComponentLink({ label, href, isActive = false, Icon }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-2 py-2 rounded-xl ${
        isActive ? "bg-white/20 text-active-text" : "text-white hover:bg-white/10"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />} {/* Icono opcional */}
      {label}
    </a>
  );
}
