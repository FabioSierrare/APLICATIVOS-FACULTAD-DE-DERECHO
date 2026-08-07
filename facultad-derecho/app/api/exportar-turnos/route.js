import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { ZipArchive } from "archiver";
import { PassThrough } from "stream";
import { NextResponse } from "next/server";
import { obtenerSemanas } from "@/components/obtenerTurnos";

function parseFecha(fechaString) {
  if (!fechaString) return new Date("Invalid Date");
  const clean = fechaString.replace(",", "");
  return new Date(clean);
}

function formatearFechaColombia(fechaString) {
  if (!fechaString) return "";
  const fecha = parseFecha(fechaString);
  if (Number.isNaN(fecha.getTime())) return "";

  const dia = fecha.toLocaleDateString("es-CO", { day: "2-digit" });
  let mes = fecha.toLocaleDateString("es-CO", { month: "short" });
  const anio = fecha.toLocaleDateString("es-CO", { year: "numeric" });

  return `${dia}/${mes.replace(".", "")}/${anio}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data = [], asesores = [], calendario = {}, diaConciliacion } = body;

    const plantillaPath = path.join(
      process.cwd(),
      "plantillas",
      "ListaUnica.xlsx"
    );

    if (!fs.existsSync(plantillaPath)) {
      return NextResponse.json(
        { error: "❌ No se encontró la plantilla" },
        { status: 404 }
      );
    }

    const plantillaBuffer = fs.readFileSync(plantillaPath);
    const semanas = obtenerSemanas(calendario, diaConciliacion) || [];

    const turnosPorSemana = semanas.map((semana) =>
      semana.map((dia) => {
        const turnos = (data || [])
          .filter((t) => {
            const fechaTurno = parseFecha(t.fechaTurno);
            const fechaDia = new Date(dia.fecha);
            fechaTurno.setHours(0, 0, 0, 0);
            fechaDia.setHours(0, 0, 0, 0);
            return fechaTurno.getTime() === fechaDia.getTime();
          })
          .sort((a, b) => (a.jornada || "").localeCompare(b.jornada || ""));

        const asesoresDelDia = (asesores || []).filter(
          (a) => a.diaSemana?.toUpperCase() === dia.dia?.toUpperCase()
        );

        return { ...dia, turnos, asesores: asesoresDelDia };
      })
    );

    const semestre = calendario.semestre || "";
    const anio = calendario.anio || "";

    const archivosBuffer = [];
    let contador = 1;

    for (let i = 0; i < semanas.length; i++) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(plantillaBuffer);

      const sheet = workbook.worksheets[0];
      if (!sheet) {
        return NextResponse.json(
          { error: "❌ El archivo Excel no contiene hojas" },
          { status: 400 }
        );
      }

      sheet.getCell("A5").value =
        `LISTADO DE ASIGNACION DE TURNOS PARA ESTUDIANTES  PERIODO  ${anio} - ${semestre.toUpperCase()}`;
      sheet.getCell("A6").value = `SEMANA No. ${i + 1}`;

      let fila = 8;

      const aplicarEstiloBloque = (celda) => {
        celda.alignment = { vertical: "middle", horizontal: "center" };
        celda.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      };

      for (const dia of turnosPorSemana[i]) {
        const jornadasDelDia = ["AM", "PM"].filter((jornada) => {
          const turnosDeJornada = dia.turnos.filter(
            (turno) => turno.jornada?.toUpperCase() === jornada
          );
          const asesoresDeJornada = dia.asesores.filter(
            (asesor) => asesor.jornada?.toUpperCase() === jornada
          );
          return turnosDeJornada.length > 0 || asesoresDeJornada.length > 0;
        });

        if (jornadasDelDia.length === 0) continue;

        // 🔹 Calcula la suma de filas de AM y PM para el día actual
        const totalFilasDia = jornadasDelDia.reduce((acc, jornada) => {
          const tCount = dia.turnos.filter(
            (t) => t.jornada?.toUpperCase() === jornada
          ).length;
          const aCount = dia.asesores.filter(
            (a) => a.jornada?.toUpperCase() === jornada
          ).length;
          return acc + Math.max(tCount, aCount);
        }, 0);

        // 🔹 Se realiza un solo mergeCells por día si abarca más de 1 fila
        if (dia.dia && totalFilasDia > 1) {
          sheet.mergeCells(`D${fila}:D${fila + totalFilasDia - 1}`);
        }

        if (dia.dia) {
          sheet.getCell(`D${fila}`).value = dia.dia;
          sheet.getCell(`D${fila}`).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }

        for (const jornada of jornadasDelDia) {
          const turnosDeJornada = dia.turnos.filter(
            (turno) => turno.jornada?.toUpperCase() === jornada
          );
          const asesoresDeJornada = dia.asesores.filter(
            (asesor) => asesor.jornada?.toUpperCase() === jornada
          );

          if (turnosDeJornada.length === 0) continue;

          const filasNecesarias = Math.max(
            turnosDeJornada.length,
            asesoresDeJornada.length
          );

          turnosDeJornada.forEach((asignacion, index) => {
            const filaActual = fila + index;
            const asesorAsignado =
              asesoresDeJornada[index % asesoresDeJornada.length] || null;

            sheet.getCell(`A${filaActual}`).value = contador++;
            sheet.getCell(`B${filaActual}`).value = asignacion.Estudiante || "";
            sheet.getCell(`C${filaActual}`).value = asignacion.Consultorio || "";
            sheet.getCell(`E${filaActual}`).value = formatearFechaColombia(
              asignacion.fechaTurno
            );
            sheet.getCell(`F${filaActual}`).value = asignacion.jornada || "";
            sheet.getCell(`H${filaActual}`).value = asesorAsignado?.nombre || "";

            ["A", "B", "C", "D", "E", "F", "G", "H", "I"].forEach((col) => {
              aplicarEstiloBloque(sheet.getCell(`${col}${filaActual}`));
            });
          });

          fila += filasNecesarias;
        }
      }

      const excelBuffer = await workbook.xlsx.writeBuffer();
      archivosBuffer.push({
        name: `Semana${i + 1}.xlsx`,
        buffer: excelBuffer,
      });
    }

    // 📦 Creación del ZIP en memoria con ZipArchive
    const archive = new ZipArchive({ zlib: { level: 5 } });
    const passthrough = new PassThrough();
    const chunks = [];

    const zipPromise = new Promise((resolve, reject) => {
      passthrough.on("data", (chunk) => chunks.push(chunk));
      passthrough.on("end", () => resolve(Buffer.concat(chunks)));
      passthrough.on("error", reject);
      archive.on("error", reject);
    });

    archive.pipe(passthrough);

    archivosBuffer.forEach((file) => {
      archive.append(file.buffer, { name: file.name });
    });

    await archive.finalize();
    const zipBuffer = await zipPromise;

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Calendarios_${diaConciliacion}.zip"`,
      },
    });
  } catch (error) {
    console.error("❌ Error generando ZIP:", error);
    return NextResponse.json(
      { error: `No se pudo generar el archivo ZIP: ${error.message}` },
      { status: 500 }
    );
  }
}