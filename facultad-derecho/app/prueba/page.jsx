"use client"
import { useState } from 'react';
import { postData } from '@/components/FetchPost';

export default function Usuarios() {
  const [FormularioLogin, setFormularioLogin] = useState({
    Correo: '',
    Contrasena: ''
  });

  const [errorMensaje, setErrorMensaje] = useState(""); // Nuevo estado para mostrar el error

  const handlerChange = (e) => {
    setFormularioLogin({
      ...FormularioLogin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje(""); // limpiar mensaje antes de enviar
    try {
      const respuesta = await postData('/api/Auth/Login', FormularioLogin);

      if (!respuesta.success && respuesta.message) {
        // Si la API devuelve un error controlado
        setErrorMensaje(respuesta.message);
        return;
      }

      console.log('Token recibido:', respuesta.Token);
    } catch (error) {
      setErrorMensaje(error.message); // mostrar error de la API
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col w-2xs p-5'>
        <input 
          type="email" 
          className='p-3 bg-white border rounded-2xl mb-4'
          name='Correo'
          value={FormularioLogin.Correo}
          onChange={handlerChange}
          placeholder='Correo'
        />
        <input 
          type="password" 
          name='Contrasena'
          className='p-3 bg-white border rounded-2xl mb-4'
          value={FormularioLogin.Contrasena}
          onChange={handlerChange}
          placeholder='Contraseña'
        />

        {/* Mensaje de error en el diseño */}
        {errorMensaje && (
          <p className="text-red-500 text-sm mb-3">{errorMensaje}</p>
        )}

        <input 
          type="submit" 
          value="Enviar" 
          className='bg-white p-2 rounded-2xl cursor-pointer'
        />
    </form>
  );
}
