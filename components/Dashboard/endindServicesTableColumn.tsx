"use client"

import { InvoiceServiceRow } from "@/lib/types/dataTypes"
import { ColumnDef } from "@tanstack/react-table"
import ViewInvoicePopup from "../Invoice/viewInvoicePopup"

export const endingServicesColumns: ColumnDef<InvoiceServiceRow>[] = [
    {
        accessorKey: "invoice_id",
        header: "Invoice ID",
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue("invoice_id")}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Service Name",
    },
    {
        accessorKey: "hsn_code",
        header: "HSN Code",
        cell: ({ row }) => (
            <span>{row.getValue("hsn_code")}</span>
        ),
    },
    {
        accessorKey: "cost",
        header: "Cost",
       
        cell: ({ row }) => (
            <span>
                {Number(row.getValue("cost")).toLocaleString()}
            </span>
        ),
    },
    {
        accessorKey: "expiry",
        header: "Expiry Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("expiry"))
            return <span>{date.toLocaleDateString()}</span>
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const invoiceId = row.original.invoiceId

            return (
                <ViewInvoicePopup id={invoiceId} />
            )
        },
    }
]