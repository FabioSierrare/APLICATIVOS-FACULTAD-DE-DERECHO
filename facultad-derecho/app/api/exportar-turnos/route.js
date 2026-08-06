import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import archiver from "archiver";
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

  mes = mes.replace(".", ""); // 👈 quita el punto

  return `${dia}/${mes}/${anio}`;
}

/**
 * 🎯 Función para asignar estudiantes y asesores automáticamente
 */
function asignarTurnosAutomaticamente(estudiantes, asesores) {
  const asignaciones = [];
  const totalEstudiantes = estudiantes.length;
  const totalAsesores = asesores.length;

  // Determinar cuántos estudiantes por asesor
  const estudiantesPorAsesor = Math.ceil(totalEstudiantes / totalAsesores);

  let indexEstudiante = 0;

  // Recorrer asesores y asignar estudiantes
  for (let i = 0; i < Math.max(totalEstudiantes, totalAsesores); i++) {
    const estudiante = estudiantes[indexEstudiante] || null;
    const asesor = asesores[i % totalAsesores] || null; // Cicla asesores si hay más estudiantes

    asignaciones.push({
      estudiante,
      asesor,
      indice: i,
    });

    indexEstudiante++;

    // Si ya no hay más estudiantes, detener
    if (indexEstudiante >= totalEstudiantes) break;
  }

  return asignaciones;
}

/**
 * 🔢 Calcular cuántas filas se necesitan realmente
 */
function calcularFilasNecesarias(turnos, asesores) {
  return Math.max(turnos.length, asesores.length);
}

/**
 * 📊 Expandir filas si es necesario
 */
async function expandirFilasEnExcel(
  sheet,
  filaInicio,
  filaFin,
  filasNecesarias,
) {
  const filasDisponibles = filaFin - filaInicio + 1;

  if (filasNecesarias > filasDisponibles) {
    const filasAdicionales = filasNecesarias - filasDisponibles;

    // Duplicar formato de la última fila
    const filaModelo = sheet.getRow(filaFin);

    for (let i = 1; i <= filasAdicionales; i++) {
      const nuevaFila = filaFin + i;
      const row = sheet.getRow(nuevaFila);

      // Copiar estilos de la fila modelo
      row.height = filaModelo.height;

      ["A", "B", "C", "D", "E", "F", "G", "H"].forEach((col) => {
        const celdaModelo = filaModelo.getCell(col);
        const celdaNueva = row.getCell(col);

        celdaNueva.style = { ...celdaModelo.style };
        celdaNueva.border = { ...celdaModelo.border };
      });
    }

    return filaFin + filasAdicionales;
  }

  return filaFin;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data = [], asesores = [], calendario = {}, diaConciliacion } = body;

    const plantillaPath = path.join(
      process.cwd(),
      "plantillas",
      `ListaUnica.xlsx`,
    );

    if (!fs.existsSync(plantillaPath)) {
      return NextResponse.json(
        { error: "❌ No se encontró la plantilla" },
        { status: 404 },
      );
    }

    const semanas = obtenerSemanas(calendario, diaConciliacion);

    // 🔹 Asociar turnos por día
    const turnosPorSemana = semanas.map((semana) =>
      semana.map((dia) => {
        const turnos = data.filter((t) => {
          const fechaTurno = parseFecha(t.fechaTurno);
          const fechaDia = new Date(dia.fecha);

          fechaTurno.setHours(0, 0, 0, 0);
          fechaDia.setHours(0, 0, 0, 0);

          return fechaTurno.getTime() === fechaDia.getTime();
        }).sort((a, b) => a.jornada.localeCompare(b.jornada));

        const asesoresDelDia = asesores.filter(
          (a) => a.diaSemana.toUpperCase() === dia.dia.toUpperCase(),
        );

        return { ...dia, turnos, asesores: asesoresDelDia };
      }),
    );

    const semestre = calendario.semestre || "";
    const anio = calendario.anio || "";

    const tempDir = path.join(process.cwd(), "tempExcels");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const archivos = [];
    const historial = [];

    console.log(turnosPorSemana)
    let turnoindex = 1;
    // 🔹 Crear un Excel por semana
    let contador = 1
    for (let i = 0; i < semanas.length; i++) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(plantillaPath);

      const sheet = workbook.worksheets[0];
      if (!sheet) {
        return NextResponse.json(
          { error: "❌ El archivo Excel no contiene hojas" },
          { status: 400 },
        );
      }

      sheet.getCell("A5").value =
        `LISTADO DE ASIGNACION DE TURNOS PARA ESTUDIANTES  PERIODO  ${anio} - ${semestre.toUpperCase()}`;

      sheet.getCell("A6").value = `SEMANA No. ${i + 1}`;

      let fila = 8;
      let filafinal = 8;
      // 🎯 Procesar cada día de la semana
      for (const dia of turnosPorSemana[i]) {
        const jornadasDelDia = ["AM", "PM"].filter((jornada) => {
          const turnosDeJornada = dia.turnos.filter(
            (turno) => turno.jornada?.toUpperCase() === jornada,
          );
          let day = dia.dia
          const asesoresDeJornada = dia.asesores.filter(
            (asesor) => asesor.jornada?.toUpperCase() === jornada,
          );

          return turnosDeJornada.length > 0 || asesoresDeJornada.length > 0;
        });

        let day = "primer"

        for (const jornada of jornadasDelDia) {
          const turnosDeJornada = dia.turnos.filter(
            (turno) => turno.jornada?.toUpperCase() === jornada,
          );
          const asesoresDeJornada = dia.asesores.filter(
            (asesor) => asesor.jornada?.toUpperCase() === jornada,
          );

          if (turnosDeJornada.length === 0) continue;

          const filasNecesarias = Math.max(
            turnosDeJornada.length,
            asesoresDeJornada.length,
          );

          const totalFilasBloque = Math.max(
            turnosDeJornada.length,
            asesoresDeJornada.length,
          );

          const numfil = Math.max(dia.turnos.length, dia.asesores.length,)

          if (dia.dia !== day) {
            sheet.mergeCells(`D${fila}:D${fila + numfil - 1}`);
            sheet.getCell(`D${fila}`).value = dia.dia;
            sheet.getCell(`D${fila}`).alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }

          const aplicarEstiloBloque = (celda) => {
            celda.alignment = { vertical: "middle", horizontal: "center" };
            celda.border = {
              top: { style: "thin", color: { argb: "FF000000" } },
              left: { style: "thin", color: { argb: "FF000000" } },
              bottom: { style: "thin", color: { argb: "FF000000" } },
              right: { style: "thin", color: { argb: "FF000000" } },
            };
          };

          ["A", "B", "C", "D", "E", "F", "G", "H", "I"].forEach((col) => {
            aplicarEstiloBloque(sheet.getCell(`${col}${fila}`));
          });

          turnosDeJornada.forEach((asignacion, index) => {
            const filaActual = fila + index;
            const asesorAsignado =
              asesoresDeJornada[index % asesoresDeJornada.length] || null;

            sheet.getCell(`A${filaActual}`).value = contador;
            contador++;

            sheet.getCell(`B${filaActual}`).value = asignacion.Estudiante;
            sheet.getCell(`C${filaActual}`).value = asignacion.Consultorio;
            sheet.getCell(`E${filaActual}`).value = formatearFechaColombia(
              asignacion.fechaTurno,
            );
            sheet.getCell(`F${filaActual}`).value = asignacion.jornada;

            if (asesorAsignado) {
              sheet.getCell(`H${filaActual}`).value = asesorAsignado.nombre;
            } else {
              sheet.getCell(`H${filaActual}`).value = "";
            }

            ["A", "B", "C", "D", "E", "F", "G", "H", "I"].forEach((col) => {
              aplicarEstiloBloque(sheet.getCell(`${col}${filaActual}`));
            });

            historial.push({
              semana: i + 1,
              dia: dia.dia,
              jornada,
              fila: filaActual,
              estudiante: asignacion.Estudiante || null,
              asesor: asesorAsignado?.nombre || null,
              consultorio: asignacion.Consultorio || null,
              fechaTurno: asignacion.fechaTurno || null,
            });

            turnoindex++;
          });

          fila += filasNecesarias;
        }
      }

      const filePath = path.join(tempDir, `Semana${i + 1}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      archivos.push(filePath);
    }

    // 🔹 Guardar historial en JSON
    const historialPath = path.join(process.cwd(), "historialTurnos.json");
    fs.writeFileSync(historialPath, JSON.stringify(historial, null, 2));

    // 📦 Crear ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });
    const output = new PassThrough();
    const chunks = [];

    archive.on("error", (error) => {
      throw error;
    });

    output.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    archive.pipe(output);
    archivos.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    await new Promise((resolve, reject) => {
      output.on("finish", resolve);
      output.on("error", reject);
      archive.finalize();
    });

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
      { status: 500 },
    );
  }
}
