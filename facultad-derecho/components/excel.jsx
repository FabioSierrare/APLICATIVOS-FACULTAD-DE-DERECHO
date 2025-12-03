import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

async function exportToExcel(data, filename = "Turnos.xlsx") {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Turnos");

  // 1. Encabezados
  worksheet.columns = [
    { header: "Nombre", key: "Nombre", width: 25 },
    { header: "Documento", key: "Documento", width: 20 },
    { header: "Consultorio", key: "Consultorio", width: 25 },
    { header: "Fecha", key: "Fecha", width: 20 },
    { header: "Jornada", key: "Jornada", width: 15 },
  ];

  // 2. Agregar filas desde el array
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // 3. Estilo en encabezados
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" }, // azul encabezado
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 4. Generar el archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
}
