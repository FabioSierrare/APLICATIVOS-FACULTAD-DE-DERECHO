"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Send, Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface LoadingProcessingProps {
  onComplete?: () => void; // Callback para cuando termine todo el proceso
  autoFinish?: boolean; // Si se cierra automáticamente o espera al padre
  waitForStep?: number; // Paso en el que se detiene hasta que el padre lo avance
}

export default function LoadingProcessingPage({
  onComplete,
  autoFinish = true,
  waitForStep = -1,
}: LoadingProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Subiendo el archivo",
      description: "Se está subiendo el archivo y validando su formato...",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: 2,
      title: "Enviando al servidor.",
      description: "El archivo se envía desde el navegador al servidor.",
      icon: Send,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      id: 3,
      title: "La inteligencia artificial está procesando el archivo",
      description:
        "La IA está revisando campos, correos y formatos para preparar la vista previa...",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  // Progreso automático de pasos
  useEffect(() => {
    if (!autoFinish) return;

    const timer1 = setTimeout(() => setCurrentStep(1), 2200);
    const timer2 = setTimeout(() => setCurrentStep(2), 4500);
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [autoFinish, onComplete]);

  useEffect(() => {
    if (waitForStep >= 0 && currentStep < waitForStep) {
      setCurrentStep(waitForStep);
    }
  }, [currentStep, waitForStep]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-8">
        {/* ================= ICONO CENTRAL ANIMADO ================= */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Anillo exterior de carga giratorio */}
          <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-purple-600 animate-spin" />

          {/* Icono dinámico según el paso actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-16 h-16 rounded-2xl ${steps[currentStep].bgColor} ${steps[currentStep].color} flex items-center justify-center shadow-inner`}
            >
              {React.createElement(steps[currentStep].icon, {
                className: "w-8 h-8",
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ================= TEXTO PRINCIPAL Y MENSAJES ================= */}
        <div className="space-y-2 min-h-[90px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {steps[currentStep].title}
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ================= BARRA DE PASOS / PROGRESS TRACKER ================= */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {steps.map((step, index) => {
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all duration-300 ${
                  isCurrent
                    ? `${step.bgColor} ${step.borderColor} font-semibold text-slate-900`
                    : isCompleted
                      ? "bg-slate-50 border-slate-200 text-slate-500"
                      : "bg-white border-transparent text-slate-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2
                      className={`w-4 h-4 ${step.color} animate-spin flex-shrink-0`}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                  )}
                  <span>{step.title}</span>
                </div>

                {isCompleted && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    Listo
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensaje tranquilizador en la parte inferior */}
        <p className="text-[11px] text-slate-400 font-medium">
          Por favor, no cierres ni recargues esta ventana. El proceso puede
          tardar unos segundos o minutos según el tamaño del archivo.
        </p>
      </div>
    </div>
  );
}
