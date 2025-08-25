export default function TurnoCard({ fecha, jornada }) {
  const fechaObj = new Date(fecha);

  const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mx-auto my-4 transition hover:shadow-xl border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-[#553285] border-b-2 border-[#553285] pb-2">
        Información del Turno
      </h2>
      <div className="space-y-3">
        <p className="text-gray-700">
          <span className="font-semibold text-[#333333]">Fecha:</span> {fecha}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-[#333333]">Jornada:</span> 
          <span className="ml-2 px-3 py-1 bg-[#553285] text-white text-sm rounded-full inline-block">
            {jornada}
          </span>
        </p>
        <p className="text-gray-700">
          <span className=" text-[#553285] font-medium">{fechaFormateada}</span>
        </p>
      </div>
    </div>
  );
}