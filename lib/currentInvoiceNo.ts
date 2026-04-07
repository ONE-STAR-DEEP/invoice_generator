"use server"

import { getNewInvoiceNo } from "./actions/invoice";

const getFinancialYear = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1–12

    let startYear;
    let endYear;

    if (month >= 4) {
        // April or later
        startYear = year;
        endYear = year + 1;
    } else {
        // Jan–March
        startYear = year - 1;
        endYear = year;
    }

    return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
};


export const invoiceString = async () => {

    const invoiceData = await getNewInvoiceNo();

    if (!invoiceData?.success) {
        throw new Error("Failed to get invoice number");
    }
    const nextNo = invoiceData.invoiceNo;

    const paddedNo = String(nextNo).padStart(4, "0");

    const invoiceString = `TTPL/${getFinancialYear()}/${paddedNo}`;

    return invoiceString;
}