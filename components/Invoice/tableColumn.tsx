"use client"

import { Invoice } from "@/lib/types/dataTypes"
import { ColumnDef } from "@tanstack/react-table"
import ViewInvoicePopup from "./viewInvoicePopup"

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "invoice_id",
        header: "Invoice ID",
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue("invoice_id")}</span>
        ),
    },
    {
        accessorKey: "client_id",
        header: "Client ID",
    },
    {
        accessorKey: "company_name",
        header: "Company Name",
    },
    {
        accessorKey: "gst_number",
        header: "GST No",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "sub_total",
        header: "Subtotal",
        cell: ({ row }) => (
            <span>₹ {Number(row.getValue("sub_total")).toLocaleString()}</span>
        ),
    },
    {
        accessorKey: "grand_total",
        header: "Total",
        cell: ({ row }) => (
            <span className="font-semibold text-green-600">
                ₹ {Number(row.getValue("grand_total")).toLocaleString()}
            </span>
        ),
    },
    {
        accessorKey: "total_items",
        header: () => (
            <div className="text-center w-full">Total Items</div>
        ),
        cell: ({ row }) => (
            <div className="text-center font-semibold w-full">
                {Number(row.getValue("total_items")).toLocaleString()}
            </div>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Purchase Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"))
            return <span>{date.toLocaleDateString()}</span>
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const invoiceId = row.original.id

            return (
                <ViewInvoicePopup id={invoiceId} />
            )
        },
    }
]