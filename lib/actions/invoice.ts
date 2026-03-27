"use server"

import { GST } from "../config/gst";
import db from "../dbPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { ClientLocationReport, InvoiceApiResponse, InvoiceData, InvoiceItem, InvoiceServiceRow, Service } from "../types/dataTypes";
import { RowDataPacket } from "mysql2";

interface StatsResult extends RowDataPacket {
  total_sales: number | null;
  pending_amount: number | null;
  paid_amount: number | null;
}

export interface ClientReport extends RowDataPacket {
  client_id: number;
  client_name: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  total_invoices: number;
  paid_invoices: number;
  pending_invoices: number;
}

type GroupedInvoices = {
  paid: any[];
  pending: any[];
};

const allowedRoles = ["admin", "accounts"];

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

    const session = await getCurrentUserSafe();
    const userId = session?.id;

    if (!userId || session.iss !== "thaverTechInvoiceGenerator") {
      return { success: false, message: "Unauthorized" };
    }

    if (!allowedRoles.includes(session.role)) {
      return { success: false, message: "Unauthorized" };
    }

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
        client_name,
        client_gst_no,
        client_address,
        client_phone,
        client_email,
        client_city,
        client_state,
        client_country,
        client_pincode,
        sub_total,
        igst,
        cgst,
        sgst,
        grand_total,
        pono,
        podate,
        reference,
        invoice_id
      )
      SELECT 
        c.id,
        c.company_name,
        c.gst_number,
        c.address,
        c.phone,
        c.email,
        c.city,
        c.state,
        c.country,
        c.pincode,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      FROM clients c
      WHERE c.id = ?
      `,
      [
        subTotal,
        totalIGST,
        totalCGST,
        totalSGST,
        grandTotal,
        data.PONo,
        data.PODate,
        data.reference,
        data.invoiceId,
        data.clientId, // IMPORTANT: goes at end
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

export const fetchAllInvoices = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string
) => {
  const conn = await db.getConnection();

  try {
    const offset = (page - 1) * limit;

    const searchTerm = search ? `%${search}%` : `%`;

    const safeLimit = Math.min(50, Number(limit) || 10);
    const safeOffset = Math.max(0, Number(offset) || 0);

    let where = `
      WHERE (
      i.client_name LIKE ?
      OR i.invoice_id LIKE ?
      )
    `;

    const params: any[] = [searchTerm, searchTerm];

    if (status) {
      where += ` AND i.status = ?`;
      params.push(status);
    }

    const [rows]: any = await conn.execute(
      `
  SELECT 
    i.id,
    i.invoice_id,
    i.client_id,
    i.client_name,
    i.client_gst_no,
    i.client_email,
    i.client_phone,
    i.client_city,
    i.client_state,
    i.client_country,
    i.client_pincode,
    i.sub_total,
    i.grand_total,
    i.created_at,
    i.status,

    COUNT(ii.id) AS total_items

  FROM invoice i

  LEFT JOIN invoice_items ii 
    ON ii.invoice_id = i.id

  ${where}

  GROUP BY i.id

  ORDER BY i.created_at DESC
  LIMIT ${safeLimit} OFFSET ${safeOffset}
  `,
      params
    );

    const [countResult]: any = await conn.execute(`
      SELECT COUNT(*) as total FROM invoice
    `);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: rows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
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
  limit = 10,
  search?: string
) => {
  const conn = await db.getConnection();

  try {
    const offset = (page - 1) * limit;

    const safeLimit = Math.min(50, Number(limit) || 10);
    const safeOffset = Math.max(0, Number(offset) || 0);

    const searchTerm = search ? `%${search}%` : `%`;

    let where = `
      WHERE i.status = 'pending'
      AND (
        i.client_name LIKE ?
        OR i.invoice_id LIKE ?
      )
    `;

    const params: any[] = [searchTerm, searchTerm];

    const [rows]: any = await conn.execute(
      `
      SELECT 
        i.id,
        i.invoice_id,
        i.client_id,
        i.client_name,
        i.client_gst_no,
        i.client_email,
        i.client_phone,
        i.client_city,
        i.client_state,
        i.sub_total,
        i.grand_total,
        i.created_at,
        i.status,

        COUNT(ii.id) AS total_items

      FROM invoice i

      LEFT JOIN invoice_items ii 
        ON ii.invoice_id = i.id

      ${where}

      GROUP BY i.id

      ORDER BY i.created_at ASC

      LIMIT ${safeLimit} OFFSET ${safeOffset}
      `,
      params
    );

    const [[{ total }]]: any = await conn.execute(
      `
      SELECT COUNT(DISTINCT i.id) AS total
      FROM invoice i
      LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
      ${where}
      `,
      params
    );

    return {
      success: true,
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / safeLimit),
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
      'id', i.client_id,
      'companyName', i.client_name,
      'gstNumber', i.client_gst_no,
      'email', i.client_email,
      'phone', i.client_phone,
      'address', i.client_address,
      'city', i.client_city,
      'state', i.client_state,
      'country', i.client_country,
      'pincode', i.client_pincode
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

    if (!allowedRoles.includes(session.role)) {
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

export const fetchStats = async (fy?: string) => {
  try {
    const getCurrentFY = () => {
      const now = new Date();
      const year =
        now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return `${year}-${year + 1}`;
    };

    const selectedFY = fy || getCurrentFY();

    const [startYear, endYear] = selectedFY.split("-").map(Number);

    // FY range: Apr 1 → Mar 31
    const startDate = `${startYear}-04-01`;
    const endDate = `${endYear}-04-01`;

    const [rows] = await db.query<StatsResult[]>(
      `
      SELECT 
        SUM(grand_total) AS total_sales,
        SUM(CASE WHEN status = 'pending' THEN grand_total ELSE 0 END) AS pending_amount,
        SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END) AS paid_amount
      FROM invoice
      WHERE created_at >= ? AND created_at < ?
      `,
      [startDate, endDate]
    );

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

export const fetchClientReport = async (
  page: number = 1,
  pageSize: number = 10
) => {
  const conn = await db.getConnection();

  const offset = (page - 1) * pageSize;

  try {
    // Paginated data
    const [rows] = await conn.query<ClientReport[]>(
      `
      SELECT 
        client_id,
        client_name,

        SUM(grand_total) AS total_amount,

        SUM(CASE WHEN status = 'paid' THEN grand_total ELSE 0 END) AS paid_amount,
        SUM(CASE WHEN status = 'pending' THEN grand_total ELSE 0 END) AS pending_amount,

        COUNT(*) AS total_invoices,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_invoices,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_invoices

      FROM invoice

      GROUP BY client_id, client_name

      ORDER BY total_amount DESC
      LIMIT ? OFFSET ?
      `,
      [pageSize, offset]
    );

    // Total unique clients
    const [countResult]: any = await conn.query(`
      SELECT COUNT(DISTINCT client_id) AS total
      FROM invoice
    `);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages, // ✅ explicitly returned
      },
    };
  } catch (error) {
    console.error("Error fetching client report:", error);
    return {
      success: false,
      data: [],
      pagination: null,
    };
  } finally {
    conn.release();
  }
};


export const fetchClientReportByState = async (
  state?: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const conn = await db.getConnection();

  const offset = (page - 1) * pageSize;

  try {
    let query = `
      SELECT 
        i.client_id,
        i.client_name,
        i.client_city,
        i.client_state,

        SUM(i.grand_total) AS total_amount,
        COUNT(DISTINCT i.id) AS total_invoices,
        COUNT(ii.id) AS total_items

      FROM invoice i

      LEFT JOIN invoice_items ii 
        ON ii.invoice_id = i.id
    `;

    const params: any[] = [];

    if (state) {
      query += ` WHERE i.client_state = ? `;
      params.push(state);
    }

    query += `
      GROUP BY 
        i.client_id,
        i.client_name,
        i.client_city,
        i.client_state

      ORDER BY total_amount DESC
      LIMIT ? OFFSET ?
    `;

    params.push(pageSize, offset);

    const [rows] = await conn.query(query, params);

    let countQuery = `
      SELECT COUNT(DISTINCT i.client_id) AS total
      FROM invoice i
    `;

    const countParams: any[] = [];

    if (state) {
      countQuery += ` WHERE i.client_state = ? `;
      countParams.push(state);
    }

    const [countResult]: any = await conn.query(countQuery, countParams);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: rows as ClientLocationReport[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching client report by state:", error);
    return {
      success: false,
      data: [],
      pagination: null,
    };
  } finally {
    conn.release();
  }
};