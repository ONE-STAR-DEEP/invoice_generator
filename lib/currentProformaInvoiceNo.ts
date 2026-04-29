"use server"

import { getNewProformaInvoiceNo } from "./actions/proforma_invoice";

export const proformaInvoiceString = async () => {

    const invoiceData = await getNewProformaInvoiceNo();

    if (!invoiceData?.success) {
        throw new Error("Failed to get invoice number");
    }
    const nextNo = invoiceData.invoiceNo;

    const paddedNo = String(nextNo).padStart(4, "0");

    const invoiceString = `TTPL/PFI/${paddedNo}`;

    return invoiceString;
}