"use client"
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation"; 
import { useState } from 'react';
import { postData } from '@/components/FetchPost';
import { type } from "os";
import { useAuth } from "@/components/AuthCont";

export default function Login() {
  const router = useRouter();
  const [FormularioLogin, setFormularioLogin] = useState({
    Correo: '',
    Contrasena: ''
  });

  const [errorMensaje, setErrorMensaje] = useState(""); // Nuevo estado para mostrar el error
  const { setUsuario } = useAuth();

  const handlerChange = (e) => {
    setFormularioLogin({
      ...FormularioLogin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMensaje("");

    try {
      const respuesta = await postData('/api/Auth/Login', FormularioLogin);
      if (!respuesta.token) {
        setErrorMensaje(respuesta.message || "Error desconocido");
        return;
      }

      // Guardar token en cookie para que middleware lo lea
      document.cookie = `token=${respuesta.token}; path=/;`;
      const decode = jwtDecode(respuesta.token)
      localStorage.setItem("token", respuesta.token);

      setUsuario(decode);
      // Redirigir según rol
      if (decode.Rol === "Administrador") {
        router.push("/admin");
      } else if (decode.Rol === "Estudiante") {
        router.push("/home");
      } else {
        router.push("/");
      }
    } catch (error) {
      setErrorMensaje(error.message);
    }
  }

  return (
    <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-[460px] m-auto">
      <div className="text-center mb-10">
        <img
          src="img/Logo-Universidad.webp"
          alt="Logo Estudio Jurídico"
          className="mb-6 mx-auto"
        />
        <h1 className="text-primary text-3xl font-bold mb-2" >Acceso al Sistema</h1>
        <p className="text-secundary-text font-light">Ingrese sus credenciales para continuar</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-tercer-text mb-2">Correo</label>
          <input
            type="text"
            name="Correo"
            placeholder="correo@universidadmayor.edu.co  "
            required
            className="focus:outline-none focus:border-primary w-full px-4 py-3 border-bord rounded-lg transition-colors duration-300 border hover:border-facultad-azul"
            value={FormularioLogin.Correo}
            onChange={handlerChange}
          />
        </div>

        <div className="mb-6">
          <label className="block text-tercer-text mb-2">Contraseña</label>
          <input
            type="password"
            name="Contrasena"
            value={FormularioLogin.Contrasena}
            onChange={handlerChange}
            placeholder="Ingrese su contraseña"
            required
            className="focus:outline-none focus:border-primary w-full px-4 py-3 border-bord rounded-lg transition-colors duration-300 border hover:border-facultad-azul"
          />
        </div>

        {errorMensaje}

        <button type="submit" className="bg-primary hover:bg-[#6A3BAF] text-white font-sans px-6 py-3 rounded-lg text-base border-none cursor-pointer w-full font-bold transition-colors duration-300 mt-4">
          Iniciar Sesión
        </button>
      </form>

      <div className="text-center mt-8 text-secundary-text">
        <p>
          ¿Problemas para ingresar? <a className="text-primary" href="#">Contacte al administrador</a>
        </p>
        <p>© 2023 Estudio Jurídico. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
