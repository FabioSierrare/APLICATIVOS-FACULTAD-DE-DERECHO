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

    // 📌 Ruta de la plantilla
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

    // 🔹 Mapa de filas según día y jornada
    const filasPorDiaYJornada = {
      Lunes: { AM: [8, 10], PM: [12, 14] },
      Martes: { AM: [8, 10], PM: [12, 14] },
      Miércoles: { AM: [16, 18], PM: [20, 22] },
      Jueves: { AM: [24, 26], PM: [28, 30] },
      Viernes: { AM: [32, 34], PM: [36, 38] },
    };

    // 🔹 Crear un Excel por semana
    for (let semana = 1; semana <= semanas.length; semana++) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const sheet = workbook.worksheets[1];
      if (!sheet) {
        return NextResponse.json(
          { error: "❌ El archivo Excel no contiene hojas" },
          { status: 400 }
        );
      }

      // Agregar turnos correspondientes a esta semana
      turnosPorSemana[semana - 1].forEach((dia) => {
        // Para cada turno, usamos su propia jornada y fila local
        const turnosAM = dia.turnos.filter((t) => t.jornada === "AM");
        const turnosPM = dia.turnos.filter((t) => t.jornada === "PM");

        // Función para escribir los turnos en las filas correctas
        const escribirTurnos = (turnos, jornada) => {
          const rango = filasPorDiaYJornada[dia.dia]?.[jornada];
          if (!rango) {
            console.warn(`No hay filas definidas para ${dia.dia} ${jornada}`);
            return;
          }
          let fila = rango[0]; // fila inicial local
          turnos.forEach((turno) => {
            if (fila > rango[1]) return; // no exceder fila final
            sheet.getCell(`B${fila}`).value = turno.Estudiante.toUpperCase();
            sheet.getCell(`C${fila}`).value = turno.Consultorio; // si es número, no hace falta
            sheet.getCell(`E${fila}`).value = turno.fechaTurno.toUpperCase(); // si quieres la fecha como string
            sheet.getCell(`F${fila}`).value = turno.jornada.toUpperCase();
            fila++;
          });
        };

        escribirTurnos(turnosAM, "AM");
        escribirTurnos(turnosPM, "PM");
      });

      const filePath = path.join(tempDir, `Semana${semana}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      archivos.push(filePath);
    }

    // 📦 Crear ZIP en memoria
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
