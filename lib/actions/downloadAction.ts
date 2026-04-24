"use server";

import ExcelJS from "exceljs";
import db from "../dbPool";

export async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Invoices");

  // ✅ Correct query
  const [rows]: any = await db.query(`
    SELECT created_at, client_name, grand_total, invoice_id, CONCAT(client_city, ', ', client_state) AS address, cgst, sgst, igst, client_gst_no
    FROM invoice
    WHERE status = "paid"
    ORDER BY created_at
  `);

  const grouped: Record<string, any[]> = {};

  // ✅ Use created_at consistently
  rows.forEach((row: any) => {
    const d = new Date(row.created_at);

    const key = `${d.toLocaleString("default", {
      month: "long",
    })} ${d.getFullYear()}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  let currentRow = 1;

  for (const [month, data] of Object.entries(grouped)) {
    // 🟦 Month Title
    sheet.getCell(`A${currentRow}`).value = month;
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    // 🟩 Header (fixed)
    const headerRow = sheet.addRow([
      "Bill Date",
      "Invoice NO",
      "Client",
      "GST No",
      "Address",
      "Bill Amount",
      "CGST",
      "SGST",
      "IGST",
    ]);
    headerRow.font = { bold: true };
    currentRow++;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }, 
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "215B63" }, 
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    const startRow = currentRow;

    // 🧾 Data rows
    data.forEach((row: any) => {
      sheet.addRow([
        new Date(row.created_at).toISOString().split("T")[0],
        row.invoice_id,
        row.client_name,
        row.client_gst_no,
        row.address,
        Number(row.grand_total),
        Number(row.cgst),
        Number(row.sgst),
        Number(row.igst),
      ]);
      currentRow++;
    });

    const endRow = currentRow - 1;

    // 🔥 Monthly total (very useful)
    const totalRow = sheet.addRow([
      "", "", "", "",
      "Total",
      { formula: `SUM(F${startRow}:F${endRow})` },
      { formula: `SUM(G${startRow}:G${endRow})` },
      { formula: `SUM(H${startRow}:H${endRow})` },
      { formula: `SUM(I${startRow}:I${endRow})` }
    ])
    totalRow.font = { bold: true };

    totalRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" }, 
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "6E1A37" }, 
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    currentRow++;

    // ➖ spacing
    currentRow += 2;

    // 🟨 Adjustment Table
    sheet.getCell(`A${currentRow}`).value = "Adjustments (Tax Reduction)";
    sheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    sheet.addRow(["Reason", "Amount"]).font = { bold: true };
    currentRow++;

    for (let i = 0; i < 3; i++) {
      sheet.addRow(["", ""]);
      currentRow++;
    }

    currentRow += 2;
  }

  // ✅ Column widths (huge UX improvement)
  sheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 30 },
    { width: 20 },
    { width: 25 },
    { width: 15 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}