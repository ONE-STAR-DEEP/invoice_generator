"use server"

import db from "../dbPool";
import { ClientData, ClientInput } from "../types/dataTypes";

export const insertClient = async (data: ClientInput) => {
  try {
    const {
      companyName,
      gstNumber,
      pan,
      address,
      city,
      state,
      country,
      pincode,
      email,
      phone,
      assignedPerson,
      designation,
      notes,
    } = data;

    const [result] = await db.execute(
      `
      INSERT INTO clients (
        company_name,
        gst_number,
        pan,
        address,
        city,
        state,
        country,
        pincode,
        email,
        phone,
        assigned_person,
        designation,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyName,
        gstNumber?.toUpperCase() || null,
        pan?.toUpperCase() || null,
        address || null,
        city || null,
        state || null,
        country || null,
        pincode || null,
        email,
        phone,
        assignedPerson || null,
        designation || null,
        notes || null,
      ]
    );

    return {
      success: true,
      message: "Client added",
    };
  } catch (error) {
    console.error("Insert Client Error:", error);

    return {
      success: false,
      message: "Failed to insert client",
    };
  }
};

export const fetchClients = async () => {
  const conn = await db.getConnection();

  try {
    const [rows]: any = await conn.execute(`
      SELECT * FROM clients
    `);

    return {
      success: true,
      data: rows as ClientData[],
    };
  } catch (error: any) {
    console.error("Error fetching clients:", error);

    return {
      success: false,
      message: error.message || "Failed to fetch clients",
    };
  } finally {
    conn.release();
  }
};