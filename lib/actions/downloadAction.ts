"use server";

import ExcelJS from "exceljs";
import db from "../dbPool";

export async function generateExcel(
  startingMonth: number,
  startingYear: number,
  endingMonth: number,
  endingYear: number,

) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Invoices");

  const startDate = new Date(startingYear, startingMonth - 1, 1);

  const endDate = new Date(endingYear, endingMonth, 0);
  // last day of ending month

  // ✅ Query
  const [invoices]: any = await db.query(`
    SELECT invoice_date, client_name, sub_total, grand_total, invoice_id, CONCAT(client_city, ', ', client_state) AS address, cgst, sgst, igst, client_gst_no
    FROM invoice
    WHERE status = "paid"
    AND client_gst_no IS NOT NULL
    AND invoice_date BETWEEN ? AND ?
    ORDER BY invoice_date
  `, [startDate, endDate]
  );

  const grouped: Record<string, any[]> = {};

  // ✅ Use created_at consistently
  invoices.forEach((row: any) => {
    const d = new Date(row.invoice_date);

    const key = `${d.toLocaleString("default", {
      month: "long",
    })} ${d.getFullYear()}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(row);
  });

  let currentRow = 5;

  for (const [month, data] of Object.entries(grouped)) {

    // 🟦 Month Title
    sheet.getCell(`C${currentRow}`).value = month;
    sheet.getCell(`C${currentRow}`).font = { bold: true, size: 20 };
    currentRow++;

    // 🟩 Header (fixed)
    const headerRow = sheet.addRow([
      "",
      "",
      "Bill Date",
      "Invoice NO",
      "Client",
      "GST No",
      "Address",
      "Taxable Total",
      "CGST",
      "SGST",
      "IGST",
      "Bill Amount",
    ]);
    headerRow.font = { bold: true };
    currentRow++;

    headerRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) return;
      cell.font = {
        bold: true,
        color: { argb: "EEEEEE" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F6F5F" },
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

    data.forEach((row: any) => {
      sheet.addRow([
        "",
        "",
        new Date(row.invoice_date).toISOString().split("T")[0],
        row.invoice_id,
        row.client_name,
        row.client_gst_no,
        row.address,
        Number(row.sub_total),
        Number(row.cgst),
        Number(row.sgst),
        Number(row.igst),
        Number(row.grand_total),
      ]);
      currentRow++;
    });

    const endRow = currentRow - 1;

    const invoiceTotals = data.reduce((acc, row) => {
      acc.taxable += parseFloat(row.sub_total) || 0;
      acc.cgst += parseFloat(row.cgst) || 0;
      acc.sgst += parseFloat(row.sgst) || 0;
      acc.igst += parseFloat(row.igst) || 0;
      acc.total += parseFloat(row.grand_total) || 0;
      return acc;
    }, {
      taxable: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    });

    // 🔥 Monthly total (very useful)
    const totalRow = sheet.addRow([
      "", "", "", "", "", "",
      "Total",
      invoiceTotals.taxable,
      invoiceTotals.cgst,
      invoiceTotals.sgst,
      invoiceTotals.igst,
      invoiceTotals.total
    ]);
    totalRow.font = { bold: true };

    totalRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) return;
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "30364F" },
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


    const monthDate = new Date(data[0].invoice_date);

    const [items]: any = await db.query(
      `
      SELECT 
      bill_date,
      bill_no,
      item_name,
      hsn_code,
      supplier_gstin,
      taxable_amount,
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_amount
      FROM purchase_adjustments
      WHERE MONTH(bill_date) = ? 
      AND YEAR(bill_date) = ?
      ORDER BY bill_date
      `,
      [monthDate.getMonth() + 1, monthDate.getFullYear()]
    );

    const hasItems = items.length > 0;

    // 🟨 Adjustment Title
    sheet.getCell(`C${currentRow}`).value = "Adjustments (Tax Reduction)";
    sheet.getCell(`C${currentRow}`).font = { bold: true, size: 12 };
    currentRow++;

    // 🟩 Header
    const adjHeader = sheet.addRow([
      "",
      "",
      "Bill Date",
      "Bill No",
      "Item",
      "HSN",
      "Supplier GSTIN",
      "Taxable Amount",
      "CGST",
      "SGST",
      "IGST",
      "Total Amount",
    ]);

    adjHeader.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) return;
      cell.font = { bold: true, color: { argb: "30364F" } };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F0F0DB" }, // different color from invoice
      };

      cell.alignment = { vertical: "middle", horizontal: "center" };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    currentRow++;

    const adjStartRow = currentRow;

    // 🧾 Data rows
    items.forEach((item: any) => {
      sheet.addRow([
        "",
        "",
        new Date(item.bill_date).toISOString().split("T")[0],
        item.bill_no,
        item.item_name,
        item.hsn_code,
        item.supplier_gstin,
        Number(item.taxable_amount),
        Number(item.cgst_amount),
        Number(item.sgst_amount),
        Number(item.igst_amount),
        Number(item.total_amount),
      ]);
      currentRow++;
    });

    const adjEndRow = currentRow - 1;

    // 🔥 Total Row
    const adjTotalRow = sheet.addRow([
      "", "", "", "", "", "", "Total",
      hasItems ? { formula: `SUM(H${adjStartRow}:H${adjEndRow})` } : 0,
      hasItems ? { formula: `SUM(I${adjStartRow}:I${adjEndRow})` } : 0,
      hasItems ? { formula: `SUM(J${adjStartRow}:J${adjEndRow})` } : 0,
      hasItems ? { formula: `SUM(K${adjStartRow}:K${adjEndRow})` } : 0,
      hasItems ? { formula: `SUM(L${adjStartRow}:L${adjEndRow})` } : 0
    ]);

    adjTotalRow.eachCell((cell, colNumber) => {
      if (colNumber === 1 || colNumber === 2) return;
      cell.font = { bold: true, color: { argb: "30364F" } };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "EEEEEE" },
      };

      cell.alignment = { vertical: "middle", horizontal: "right" };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 🧾 GST Summary
    sheet.getCell(`C${currentRow}`).value = "GST Calculation";
    sheet.getCell(`C${currentRow}`).font = { bold: true, size: 13 };
    currentRow++;

    // Output GST
    sheet.addRow([
      "", "", "", "", "", "",
      "Output GST",
      "",
      { formula: `N(I${endRow + 1})` },
      { formula: `N(J${endRow + 1})` },
      { formula: `N(K${endRow + 1})` }
    ]);

    currentRow++;

    const adjTotalRowIndex = adjTotalRow.number; // after adding total row
    // Input GST
    sheet.addRow([
      "", "", "", "", "", "",
      "Input GST (ITC)",
      "",
      hasItems ? { formula: `N(I${adjTotalRowIndex})` } : 0,
      hasItems ? { formula: `N(J${adjTotalRowIndex})` } : 0,
      hasItems ? { formula: `N(K${adjTotalRowIndex})` } : 0,
    ]);

    currentRow++;

    // Net GST
    const netRow = sheet.addRow([
      "", "", "", "", "", "",
      "Net GST",
      "",
      { formula: `N(I${endRow + 1}) - N(I${adjEndRow + 1})` },
      { formula: `N(J${endRow + 1}) - N(J${adjEndRow + 1})` },
      { formula: `N(K${endRow + 1}) - N(K${adjEndRow + 1})` }
    ]);

    currentRow++;

    // ==============================
    // ✅ Layer 1: Direct Set-off
    // ==============================
    const directRow = sheet.addRow([
      "", "", "", "", "", "",
      "After Direct Set-off",
      "",
      { formula: `MAX(0, I${netRow.number})` },
      { formula: `MAX(0, J${netRow.number})` },
      { formula: `MAX(0, K${netRow.number})` }
    ]);

    currentRow++;

    // ==============================
    // ✅ Layer 2: IGST Adjustment
    // ==============================
    const finalRow = sheet.addRow([
      "", "", "", "", "", "",
      "Final GST Payable",
      "",

      // CGST
      {
        formula: `
      MAX(0,
        I${directRow.number}
        - MAX(0, -K${netRow.number})
      )
    `
      },

      // SGST
      {
        formula: `
      MAX(0,
        J${directRow.number}
        - MAX(0,
          MAX(0, -K${netRow.number}) - I${directRow.number}
        )
      )
    `
      },

      // IGST
      {
        formula: `MAX(0, K${netRow.number})`
      }
    ]);

    finalRow.font = { bold: true };

    sheet.addRow([
      "", "", "", "", "", "",
      "Remaining ITC (Carry Forward)",
      "",
      0, // CGST (rare / usually 0)
      0, // SGST (rare / usually 0)
      {
        formula: `
      MAX(0,
        MAX(0, -K${netRow.number})
        - I${directRow.number}
        - J${directRow.number}
      )
    `
      }
    ]);

    currentRow += 5;
  }

  // ✅ Column widths (huge UX improvement)
  sheet.columns = [
    { width: 15 },
    { width: 15 },
    { width: 20 },
    { width: 20 },
    { width: 30 },
    { width: 20 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  workbook.calcProperties.fullCalcOnLoad = true;

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}