"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Check, AlertTriangle, AlertCircle, X } from "lucide-react";
import { AlertModalProps } from "@/Model/AlertModalProps";

export default function AlertModal({
  isOpen,
  title = "Información",
  message,
  buttonText = "Aceptar",
  type = "info",
  onAccept,
}: AlertModalProps) {
  const handleClose = () => {
    onAccept?.();
  };

  // Cierra la alerta al presionar la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onAccept]);

  // Configuración de variantes de estilo según el tipo de alerta
  const stylesConfig = {
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      btnBg: "bg-blue-900 hover:bg-blue-950 text-white",
    },
    success: {
      icon: Check,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      btnBg: "bg-primary hover:bg-primary/90 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      btnBg: "bg-amber-500 hover:bg-amber-600 text-slate-900",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
    },
  };

  const currentStyle = stylesConfig[type] || stylesConfig.info;
  const IconComponent = currentStyle.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro traslúcido (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Caja del Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10 space-y-5 text-center"
          >
            {/* Botón de cerrar (X) en la esquina */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icono Principal */}
            <div
              className={`w-14 h-14 mx-auto rounded-2xl ${currentStyle.bgColor} border ${currentStyle.borderColor} ${currentStyle.iconColor} flex items-center justify-center shadow-inner`}
            >
              <IconComponent className="w-7 h-7" />
            </div>

            {/* Título y Mensaje */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Botón Aceptar */}
            <div className="pt-2">
              <button
                onClick={handleClose}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors shadow-sm ${currentStyle.btnBg}`}
              >
                {buttonText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
