"use server"

import db from "../dbPool";
import { getCurrentUserSafe } from "../sessionCheck";
import { FetchedAdjustment, PurchaseAdjustment } from "../types/dataTypes";

const allowedRoles = ["admin", "accounts"];

export const itemInsert = async (data: PurchaseAdjustment) => {
    try {

        console.log(data)
        if( (data.cgst_amount || data.sgst_amount) && (data.igst_amount) ){
            alert("Cannot fill all CGST, SGST and IGST together");
            return {
                success: false,
                message: "You can enter CGST and SGST together, or IGST separately — not all three."
            }
        }

        const {
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
        } = data;

        const [result] = await db.execute(
            `
            INSERT INTO purchase_adjustments (
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
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                bill_date,
                bill_no || null,
                item_name,
                hsn_code || null,
                supplier_gstin.toUpperCase(),
                taxable_amount,
                cgst_amount || 0,
                sgst_amount || 0,
                igst_amount || 0,
                total_amount
            ]
        );

        return {
            success: true,
            message: "Item added",
        };
    } catch (error) {
        console.error("Insert Item Error:", error);

        return {
            success: false,
            message: "Failed to insert Item",
        };
    }
};


export const fetchAllItems = async (
    page: number = 1,
    limit: number = 20,
    search?: string
) => {
    const conn = await db.getConnection();

    try {
        const offset = (page - 1) * limit;

        const searchTerm = search ? `%${search}%` : `%`;

        const safeLimit = Math.min(50, Number(limit) || 10);
        const safeOffset = Math.max(0, Number(offset) || 0);

        let where = `
      WHERE (
      item_name LIKE ?
      )
    `;

        const params: any[] = [searchTerm];

        const [rows]: any = await conn.execute(
            `
            SELECT 
            id,
            bill_date,
            bill_no,
            item_name,
            hsn_code,
            supplier_gstin,
            taxable_amount,
           cgst_amount,
            sgst_amount,
            igst_amount,
            total_amount,
            created_at

            FROM purchase_adjustments
            
            ${where}

            ORDER BY created_at DESC
            LIMIT ${safeLimit} OFFSET ${safeOffset}
        `,
            params
        );

        const [countResult]: any = await conn.execute(`
      SELECT COUNT(*) as total FROM purchase_adjustments
    `);

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        const formattedRows = rows.map((row: any) => ({
            ...row,
            amount: Number(row.amount),
        }));

        return {
            success: true,
            data: formattedRows as FetchedAdjustment[],
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

export const deleteItem = async (itemId: number) => {
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

    await conn.query(
      "DELETE FROM purchase_adjustments WHERE id = ?",
      [itemId]
    );

    return {
      success: true,
      message: "Item deleted",
    };
  } catch (error) {
    console.error("Error deleting item:", error);

    return { success: false, message: "Delete failed" };
  } finally {
    conn.release();
  }
};