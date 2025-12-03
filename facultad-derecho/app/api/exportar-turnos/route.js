import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { NextResponse } from "next/server";
import { obtenerSemanas } from "@/components/obtenerTurnos";

function parseFecha(fechaString) {
  const clean = fechaString.replace(",", ""); // quitar coma rara
  return new Date(clean);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { diaConciliacion = "Martes", data = [], calendario = {} } = body;
    console.log("📅 Generando turnos para:", diaConciliacion);

    // 📌 Ruta de la plantilla según el día
    const plantillaPath = path.join(
      process.cwd(),
      "plantillas",
      `${diaConciliacion}.xlsx`
    );

    if (!fs.existsSync(plantillaPath)) {
      return NextResponse.json(
        { error: "❌ No se encontró la plantilla" },
        { status: 404 }
      );
    }

    // 🔹 Organizar turnos por semanas
    const semanas = obtenerSemanas(calendario, diaConciliacion);

    // 🔹 Asociar todos los turnos por día
    const turnosPorSemana = semanas.map((semana) =>
      semana.map((dia) => {
        const turnos = data.filter((t) => {
          const fechaTurno = parseFecha(t.fechaTurno);
          const fechaDia = new Date(dia.fecha);
          fechaTurno.setHours(0, 0, 0, 0);
          fechaDia.setHours(0, 0, 0, 0);
          return fechaTurno.getTime() === fechaDia.getTime();
        });
        return { ...dia, turnos };
      })
    );

    // 📂 Carpeta temporal
    const tempDir = path.join(process.cwd(), "tempExcels");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const archivos = [];
    const historial = []; // Guardamos fila, jornada y día

    // 🔹 Mapeo de filas por día de conciliación y jornada
    const filasPorDiaConciliacion = {
      Lunes: {
        Lunes: { AM: [8, 10], PM: [12, 14] },
        Martes: { AM: [8, 10], PM: [12, 14] },
        Miércoles: { AM: [16, 18], PM: [20, 22] },
        Jueves: { AM: [24, 26], PM: [28, 30] },
        Viernes: { AM: [32, 34], PM: [36, 38] },
      },
      Martes: {
        Lunes: { AM: [8, 10], PM: [12, 14] },
        Martes: { AM: [8, 10], PM: [12, 14] },
        Miércoles: { AM: [16, 18], PM: [20, 22] },
        Jueves: { AM: [24, 26], PM: [28, 30] },
        Viernes: { AM: [32, 34], PM: [36, 38] },
      },
      Miércoles: {
        Lunes: { AM: [8, 10], PM: [12, 14] },
        Martes: { AM: [15, 17], PM: [19, 21] },
        Miércoles: { AM: [15, 17], PM: [19, 21] },
        Jueves: { AM: [24, 26], PM: [28, 30] },
        Viernes: { AM: [32, 34], PM: [36, 38] },
      },
      Jueves: {
        Lunes: { AM: [8, 10], PM: [12, 14] },
        Martes: { AM: [15, 17], PM: [19, 21] },
        Miércoles: { AM: [23, 25], PM: [27, 29] },
        Jueves: { AM: [23, 25], PM: [27, 29] },
        Viernes: { AM: [31, 33], PM: [35, 37] },
      },
      Viernes: {
        Lunes: { AM: [8, 10], PM: [12, 14] },
        Martes: { AM: [15, 17], PM: [19, 21] },
        Miércoles: { AM: [23, 25], PM: [27, 29] },
        Jueves: { AM: [31, 33], PM: [35, 37] },
        Viernes: { AM: [31, 33], PM: [35, 37] },
      },
    };

    // Seleccionar el mapa correcto según el día de conciliación
    const filasPorDiaYJornada = filasPorDiaConciliacion[diaConciliacion];

    // 🔹 Crear un Excel por semana
    for (let i = 0; i < semanas.length; i++) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const sheet = workbook.worksheets[1];
      if (!sheet) {
        return NextResponse.json(
          { error: "❌ El archivo Excel no contiene hojas" },
          { status: 400 }
        );
      }

      // Procesar cada día de la semana
      turnosPorSemana[i].forEach((dia) => {
        ["AM", "PM"].forEach((jornada) => {
          const turnos = dia.turnos.filter((t) => t.jornada === jornada);
          const rango = filasPorDiaYJornada[dia.dia]?.[jornada];
          if (!rango) return;

          let fila = rango[0];
          turnos.forEach((turno) => {
            if (fila > rango[1]) return;

            // Escribir en Excel
            sheet.getCell(`B${fila}`).value = turno.Estudiante.toUpperCase();
            sheet.getCell(`C${fila}`).value = turno.Consultorio;
            sheet.getCell(`E${fila}`).value = turno.fechaTurno.toUpperCase();
            sheet.getCell(`F${fila}`).value = turno.jornada.toUpperCase();

            // Guardar en historial
            historial.push({
              dia: dia.dia,
              jornada,
              fila,
              estudiante: turno.Estudiante,
              consultorio: turno.Consultorio,
              fechaTurno: turno.fechaTurno,
            });

            fila++;
          });
        });
      });

      const filePath = path.join(tempDir, `Semana${i + 1}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      archivos.push(filePath);
    }

    // 🔹 Guardar historial en JSON
    const historialPath = path.join(process.cwd(), "historialTurnos.json");
    fs.writeFileSync(historialPath, JSON.stringify(historial, null, 2));

    // 📦 Crear ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks = [];
    archive.on("data", (chunk) => chunks.push(chunk));
    archivos.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });
    await archive.finalize();
    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Calendarios_${diaConciliacion}.zip"`,
      },
    });
  } catch (error) {
    console.error("❌ Error generando ZIP:", error);
    return NextResponse.json(
      { error: "No se pudo generar el archivo ZIP" },
      { status: 500 }
    );
  }
}
