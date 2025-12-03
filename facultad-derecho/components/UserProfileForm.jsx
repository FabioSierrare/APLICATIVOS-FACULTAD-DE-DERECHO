"use client";

import React from "react";
import { User, Mail, Lock, FileText, ShieldCheck, Building2, Eye, EyeOff, Save, Edit2 } from "lucide-react";

export default function UserProfileForm({
  isEditing,
  userData,
  handleInputChange,
  showPassword,
  setShowPassword,
  infouser,
  toggleEdit,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-bold text-[#553285] flex items-center gap-2">
          <User className="w-5 h-5" />
          Información Personal
        </h2>
        <button 
          onClick={toggleEdit}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isEditing 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-[#FFCE21] text-[#553285] hover:bg-[#ebd575]'
          }`}
        >
          {isEditing ? (
            <><Save className="w-4 h-4" /> Guardar</>
          ) : (
            <><Edit2 className="w-4 h-4" /> Editar</>
          )}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nombre Completo</label>
          <div className={`relative flex items-center ${isEditing ? 'text-gray-900' : 'text-gray-600'}`}>
            <User className="absolute left-3 w-5 h-5 text-[#553285]/40" />
            <input
              type="text"
              name="nombre"
              disabled={!isEditing}
              value={userData.nombre || ''}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
                isEditing ? 'border-[#553285] bg-white ring-2 ring-[#553285]/10 focus:outline-none' : 'border-transparent bg-gray-50'
              }`}
            />
          </div>
        </div>

        {/* Tipo de documento */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo de Documento</label>
          {isEditing ? (
            <div className="relative flex items-center">
              <ShieldCheck className="absolute left-3 w-5 h-5 text-[#553285]/40" />
              <select
                name="tipoDocumentoId"
                value={userData.tipoDocumentoId || ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#553285] bg-white ring-2 ring-[#553285]/10 appearance-none transition-all"
              >
                <option value="">Seleccionar tipo de documento</option>
                {infouser?.tipoDocumento?.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="relative flex items-center">
              <ShieldCheck className="absolute left-3 w-5 h-5 text-[#553285]/40" />
              <input type="text" disabled value={infouser?.tipoDocumento?.find(t=>Number(t.id) === Number(userData.tipoDocumentoId))?.nombre || 'Desconocido'} className="w-full pl-10 pr-4 py-2 rounded-lg border border-transparent bg-gray-50 text-gray-600" />
            </div>
          )}
        </div>

        {/* Documento */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Número de Documento</label>
          <div className="relative flex items-center">
            <FileText className="absolute left-3 w-5 h-5 text-[#553285]/40" />
            <input
              type="text"
              name="documento"
              disabled={!isEditing}
              value={userData.documento || ''}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${
                isEditing ? 'border-[#553285] bg-white ring-2 ring-[#553285]/10' : 'border-transparent bg-gray-50 text-gray-600'
              }`}
            />
          </div>
        </div>

        {/* Consultorio */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Consultorio</label>
          {isEditing ? (
            <div className="relative flex items-center">
              <Building2 className="absolute left-3 w-5 h-5 text-[#553285]/40" />
              <select name="consultorioId" value={userData.consultorioId || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#553285] bg-white ring-2 ring-[#553285]/10 appearance-none transition-all">
                <option value="">Seleccionar consultorio</option>
                {infouser?.consultorioInfo?.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="relative flex items-center">
              <Building2 className="absolute left-3 w-5 h-5 text-[#553285]/40" />
              <input type="text" disabled value={infouser?.consultorioInfo?.find(c=>Number(c.id) === Number(userData.consultorioId))?.nombre || 'No asignado'} className="w-full pl-10 pr-4 py-2 rounded-lg border border-transparent bg-gray-50 text-gray-600" />
            </div>
          )}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-5 h-5 text-[#553285]/40" />
            <input type="email" name="correo" disabled={!isEditing} value={userData.correo || ''} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all ${isEditing ? 'border-[#553285] bg-white ring-2 ring-[#553285]/10' : 'border-transparent bg-gray-50 text-gray-600'}`} />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contraseña</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-5 h-5 text-[#553285]/40" />
            <input type={showPassword? 'text':'password'} name="contrasena" disabled={!isEditing} value={userData.contrasena || ''} onChange={handleInputChange} className={`w-full pl-10 pr-12 py-2 rounded-lg border transition-all ${isEditing ? 'border-[#553285] bg-white ring-2 ring-[#553285]/10' : 'border-transparent bg-gray-50 text-gray-600'}`} />
            {isEditing && (
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 text-[#553285]/60 hover:text-[#553285] transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
