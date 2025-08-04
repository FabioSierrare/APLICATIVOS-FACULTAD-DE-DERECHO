export default function Login() {
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

      <form className="">
        <div className="mb-6">
          <label className="block text-tercer-text mb-2">Usuario</label>
          <input
            type="text"
            id="usuario"
            placeholder="1234567890"
            required
            className="focus:outline-none focus:border-primary w-full px-4 py-3 border-bord rounded-lg transition-colors duration-300 border hover:border-facultad-azul"
          />
        </div>

        <div className="mb-6">
          <label className="block text-tercer-text mb-2">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Ingrese su contraseña"
            required
            className="focus:outline-none focus:border-primary w-full px-4 py-3 border-bord rounded-lg transition-colors duration-300 border hover:border-facultad-azul"
          />
        </div>

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
