export default function Login() {
  return (
    <div className="bg-white p-12 rounded-2xl shadow-2xl max-w-[460px] m-auto">
      <div className="text-center mb-10">
        <img
          src="img/Logo-Universidad.webp"
          alt="Logo Estudio Jurídico"
          className="mb-6 mx-auto"
        />
        <h1 className="text-[#553285] text-3xl font-bold mb-2">Acceso al Sistema</h1>
        <p className="text-[#666666] font-light">Ingrese sus credenciales para continuar</p>
      </div>

      <form className="">
        <div className="mb-6">
          <label for="email" className="block text-[#333333] mb-2">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@estudiojuridico.com"
            required
            className="focus:outline-none focus:border-[#553285] w-full px-4 py-3 border-[#dddddd] rounded-lg transition-colors duration-300 border hover:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label for="password" className="block text-[#333333] mb-2">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Ingrese su contraseña"
            required
            className="focus:outline-none focus:border-[#553285] w-full px-4 py-3 border-[#dddddd] rounded-lg transition-colors duration-300 border hover:border-blue-500"
          />
        </div>

        <button type="submit" className="bg-[#553285] hover:bg-[#6A3BAF] text-white font-sans px-6 py-3 rounded-lg text-base border-none cursor-pointer w-full font-bold transition-colors duration-300 mt-4">
          Iniciar Sesión
        </button>
      </form>

      <div className="text-center mt-8 text-[#666666]">
        <p>
          ¿Problemas para ingresar? <a className="text-[#553285]" href="#">Contacte al administrador</a>
        </p>
        <p>© 2023 Estudio Jurídico. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
