const ListaCalendarios = ({ calendarios }) => {
  return (
    <div className="min-h-screen bg-[#F2F2F2] p-6 md:p-12 font-arial">
      {/* Contenido principal */}
      <main className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[#553285] text-2xl md:text-3xl font-bold">Calendarios Creados</h2>
          <button className="bg-[#553285] hover:bg-[#6A3BAF] text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Nuevo Calendario
          </button>
        </div>

        {/* Tabla de calendarios */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#553285]">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Semestre
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Rango de Fechas
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Día Conciliación
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Consultorios
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calendarios.map((calendario, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F2F2F2]'}>
                      <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                    {calendario.trimestre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                    {calendario.inicio} - {calendario.fin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                    {calendario.diaConciliacion || 'No asignado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {calendario.consultorios.map((c, i) => (
                        <span key={i} className="bg-[#553285] text-white text-xs px-2 py-1 rounded">
                          {c.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#0047BB] hover:text-[#003399] mr-4">
                      Ver
                    </button>
                    <button className="text-[#38A233] hover:text-[#2D8229] mr-4">
                      Editar
                    </button>
                    <button className="text-[#E4002B] hover:text-[#C00024]">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-8">
          <div className="text-[#666666]">
            Mostrando 1 a {calendarios.length} de {calendarios.length} resultados
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-[#553285] text-[#553285] rounded hover:bg-[#553285] hover:text-white transition-colors">
              Anterior
            </button>
            <button className="px-4 py-2 bg-[#553285] text-white rounded">
              1
            </button>
            <button className="px-4 py-2 border border-[#553285] text-[#553285] rounded hover:bg-[#553285] hover:text-white transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="mt-12 text-center text-[#666666] text-sm">
        <p>© {new Date().getFullYear()} Facultad de Derecho - Universidad Católica</p>
        <p className="mt-2">Sistema de Gestión Académica</p>
      </footer>
    </div>
  );
};

// Datos de ejemplo
const calendariosEjemplo = [
  {
    nombre: "Calendario Primer Trimestre 2024",
    descripcion: "Turnos de consultoría jurídica",
    trimestre: "Q1 (Ene-Mar)",
    inicio: "15/01/2024",
    fin: "20/03/2024",
    diaConciliacion: "Miércoles",
    consultorios: [
      { nombre: "Consultorio 1", turnos: 4 },
      { nombre: "Consultorio 2", turnos: 4 }
    ]
  },
  {
    nombre: "Calendario Conciliaciones Mayo",
    descripcion: "Exclusivo para conciliaciones",
    trimestre: "Q2 (Abr-Jun)",
    inicio: "02/05/2024",
    fin: "30/05/2024",
    diaConciliacion: "Viernes",
    consultorios: [
      { nombre: "Consultorio 3", turnos: 6 },
      { nombre: "Consultorio 4", turnos: 6 }
    ]
  }
];

export default function App() {
  return <ListaCalendarios calendarios={calendariosEjemplo} />;
}