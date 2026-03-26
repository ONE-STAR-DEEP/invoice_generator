"use server"

import { GST } from "../config/gst";
import db from "../dbPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { InvoiceApiResponse, InvoiceData, InvoiceItem, InvoiceServiceRow, Service } from "../types/dataTypes";
import { RowDataPacket } from "mysql2";

interface StatsResult extends RowDataPacket {
  total_sales: number | null;
  pending_amount: number | null;
  paid_amount: number | null;
}

type GroupedInvoices = {
  paid: any[];
  pending: any[];
};


const round = (val: number) => Math.round(val * 100) / 100;

export const fetchServices = async () => {
  const conn = await db.getConnection()

  try {
    const [rows]: any = await conn.execute(`
      SELECT * FROM services
    `)

    return {
      success: true,
      data: rows as Service[],
    }
  } catch (error) {
    console.error("Error fetching services:", error)

    return {
      success: false,
      data: [],
    }
  } finally {
    conn.release()
  }
}

export const insertInvoice = async (
  data: InvoiceData,
  items: InvoiceItem[],
  isIGST: boolean
) => {
  const conn = await db.getConnection();

  try {
    if (!items.length) {
      throw new Error("No invoice items provided");
    }

    await conn.beginTransaction();

    let subTotal = 0;
    let totalIGST = 0, totalCGST = 0, totalSGST = 0;

    const invoiceItemsValues: any[] = [];

    for (const item of items) {
      let serviceId = item.serviceId;

      if (!serviceId && item.service) {
        const [rows]: any = await conn.execute(
          `SELECT id FROM services WHERE hsn_code = ? AND name = ? LIMIT 1`,
          [item.hsn, item.service]
        );

        if (rows.length > 0) {
          serviceId = rows[0].id;
        } else {
          const [result]: any = await conn.execute(
            `INSERT INTO services (name, hsn_code) VALUES (?, ?)`,
            [item.service, item.hsn]
          );
          serviceId = result.insertId;
        }
      }

      if (!serviceId) {
        throw new Error("Service ID missing for item");
      }

      const cost = Number(item.cost);
      if (isNaN(cost)) {
        throw new Error("Invalid item cost");
      }

      let itemIGST = 0, itemCGST = 0, itemSGST = 0;

      if (isIGST) {
        itemIGST = round((cost * GST.IGST) / 100);
      } else {
        itemCGST = round((cost * GST.CGST) / 100);
        itemSGST = round((cost * GST.SGST) / 100);
      }

      subTotal += cost;
      totalIGST += itemIGST;
      totalCGST += itemCGST;
      totalSGST += itemSGST;

      invoiceItemsValues.push([
        serviceId,
        cost,
        itemIGST,
        itemCGST,
        itemSGST,
        item.expiry,
      ]);
    }

    const grandTotal = round(
      subTotal + totalIGST + totalCGST + totalSGST
    );

    const [invoiceResult]: any = await conn.execute(
      `
      INSERT INTO invoice (
        client_id,
        sub_total,
        igst,
        cgst,
        sgst,
        grand_total,
        pono,
        podate,
        reference,
        invoice_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.clientId,
        subTotal,
        totalIGST,
        totalCGST,
        totalSGST,
        grandTotal,
        data.PONo,
        data.PODate,
        data.reference,
        data.invoiceId,
      ]
    );

    const invoiceId = invoiceResult.insertId;

    const finalValues = invoiceItemsValues.map((row) => [
      invoiceId,
      ...row,
    ]);

    await conn.query(
      `
      INSERT INTO invoice_items (
        invoice_id,
        service_id,
        cost,
        igst,
        cgst,
        sgst,
        expiry
      ) VALUES ?
      `,
      [finalValues]
    );

    await conn.commit();

    return {
      success: true,
      message: "Invoice Generated",
    };

  } catch (error) {
    await conn.rollback();
    console.error(error);

    return {
      success: false,
      message: "Insert Failed",
    };
  } finally {
    conn.release();
  }
};

export const fetchAllInvoices = async () => {
  const conn = await db.getConnection();

  try {
    const [rows]: any = await conn.execute(`
    SELECT 
    i.id,
    i.invoice_id,
    i.client_id,
    i.sub_total,
    i.grand_total,
    i.created_at,
    i.status,

    c.company_name,
    c.gst_number,
    c.email,
    c.phone,
    c.city,
    c.state,

    COUNT(ii.id) AS total_items

    FROM invoice i

    LEFT JOIN clients c 
      ON c.id = i.client_id

    LEFT JOIN invoice_items ii 
      ON ii.invoice_id = i.id

    GROUP BY i.id

    ORDER BY i.created_at DESC
  `);

    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Fetch failed",
    };
  } finally {
    conn.release();
  }
};

export const fetchPendingInvoices = async (
  page = 1,
  limit = 10
) => {
  const conn = await db.getConnection();

  try {
    const offset = (page - 1) * limit;

    const [rows]: any = await conn.execute(
      `
      SELECT 
        i.id,
        i.invoice_id,
        i.client_id,
        i.sub_total,
        i.grand_total,
        i.created_at,
        i.status,

        c.company_name,
        c.gst_number,
        c.email,
        c.phone,
        c.city,
        c.state,

        COUNT(ii.id) AS total_items

      FROM invoice i
      LEFT JOIN clients c ON c.id = i.client_id
      LEFT JOIN invoice_items ii ON ii.invoice_id = i.id

      WHERE i.status = 'pending'

      GROUP BY i.id
      ORDER BY i.created_at ASC

      LIMIT ${limit} OFFSET ${offset}
      `
    );

    const [[{ total }]]: any = await conn.execute(`
      SELECT COUNT(*) AS total
      FROM invoice
      WHERE status = 'pending'
    `);

    return {
      success: true,
      data: rows,
      page,
      limit,
      total, 
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Fetch failed",
    };
  } finally {
    conn.release();
  }
};

export const fetchServicesByExpiry = async (
  page = 1,
  limit = 10
) => {
  const conn = await db.getConnection();

  try {
    const offset = (page - 1) * limit;

    const [rows] = await conn.execute(
      `
      SELECT 
        ii.id,
        i.invoice_id,
        i.id AS invoiceId,
        ii.service_id,
        ii.cost,
        ii.expiry,
        ii.status,

        s.name,
        s.hsn_code

      FROM invoice_items ii

      JOIN services s ON s.id = ii.service_id
      JOIN invoice i ON i.id = ii.invoice_id

      WHERE ii.expiry IS NOT NULL
        AND ii.expiry BETWEEN UTC_TIMESTAMP() 
        AND DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY)

      ORDER BY ii.expiry ASC

      LIMIT ${limit} OFFSET ${offset}
      `);

    const [[{ total }]]: any = await conn.execute(`
      SELECT COUNT(*) AS total
      FROM invoice_items ii
      WHERE ii.expiry IS NOT NULL
        AND ii.expiry BETWEEN UTC_TIMESTAMP() 
        AND DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 DAY)
    `);

    return {
      success: true,
      data: rows as InvoiceServiceRow[],
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching services by expiry:", error);

    return {
      success: false,
      message: "Failed to fetch services",
    };
  } finally {
    conn.release();
  }
};

export const fetchInvoiceById = async (invoiceId: number) => {
  const conn = await db.getConnection();

  try {

    const [invoiceRows]: any = await conn.execute(
      `
      SELECT JSON_OBJECT(
  'id', i.id,
  'invoiceId', i.invoice_id,
  'subTotal', i.sub_total,
  'igst', i.igst,
  'cgst', i.cgst,
  'sgst', i.sgst,
  'poNo', i.pono,
  'poDate', i.podate,
  'reference', i.reference,
  'status', i.status,
  'grandTotal', i.grand_total,
  'createdAt', i.created_at,

  'client', JSON_OBJECT(
    'id', c.id,
    'companyName', c.company_name,
    'gstNumber', c.gst_number,
    'email', c.email,
    'phone', c.phone,
    'address', c.address,
    'city', c.city,
    'state', c.state,
    'pincode', c.pincode
  ),

  'items', (
    SELECT JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', ii.id,
        'serviceId', s.id,
        'service', s.name,
        'hsn', s.hsn_code,
        'cost', ii.cost,
        'igst', ii.igst,
        'cgst', ii.cgst,
        'sgst', ii.sgst,
        'expiry', ii.expiry
      )
    )
    FROM invoice_items ii
    LEFT JOIN services s ON s.id = ii.service_id
    WHERE ii.invoice_id = i.id
  )

) AS invoice

FROM invoice i
LEFT JOIN clients c ON c.id = i.client_id
WHERE i.id = ?;
      `,
      [invoiceId]
    );


    return {
      success: true,
      data: invoiceRows[0] as InvoiceApiResponse
    };

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Fetch failed",
    };
  } finally {
    conn.release();
  }
};

export const updateStatus = async (invoiceId: number) => {
  try {
    const session = await getCurrentUserSafe();
    const userId = session?.id;

    if (!userId || session.iss !== "thaverTechInvoiceGenerator") {
      return { success: false, message: "Unauthorized" };
    }

    const [result] = await db.query(
      "UPDATE invoice SET status = ? WHERE id = ?",
      ["paid", invoiceId]
    );

    return {
      success: true,
      message: "Invoice marked as paid",
    };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, message: "Something went wrong" };
  }
};

export const fetchStats = async () => {
  try {
    const [rows] = await db.query<StatsResult[]>(`
      SELECT 
        SUM(grand_total) AS total_sales,
        SUM(CASE WHEN status = 'pending' THEN grand_total ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END) AS paid_amount
      FROM invoice
    `);

    return {
      totalSales: rows[0]?.total_sales ?? 0,
      pendingAmount: rows[0]?.pending_amount ?? 0,
      paidAmount: rows[0]?.paid_amount ?? 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalSales: 0,
      pendingAmount: 0,
      paidAmount: 0,
    };
  }
};