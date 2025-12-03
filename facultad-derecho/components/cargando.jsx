// CalendarSkeleton.jsx
import React from 'react';

/**
 * Componente Skeleton Loader para la tabla de calendarios.
 * Simula la estructura de la tabla para una mejor UX durante la carga.
 */
const CalendarSkeleton = () => {
  // Array para generar 5 filas de esqueleto
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SKELETON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-96 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-44 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* SEARCH BAR SKELETON */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-10 bg-gray-100 rounded-lg w-full animate-pulse"></div>
        </div>

        {/* TABLE SKELETON */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* Se simulan los 6 encabezados de columna */}
                  {Array.from({ length: 6 }).map((_, index) => (
                    <th key={index} className="px-6 py-4">
                      <div className="h-3 bg-gray-100 rounded w-20 animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* Filas de esqueleto */}
                {skeletonRows.map((_, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-20 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16 animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="h-6 w-11 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="h-6 w-6 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-6 w-6 bg-gray-100 rounded-lg animate-pulse"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER SKELETON */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="h-4 bg-gray-100 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSkeleton;