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
        accessorKey: "client_name",
        header: "Client Name",
    },
    {
    id: "gst_or_tax",
    header: "GST/TAX No",
    accessorFn: (row) => row.client_gst_no || row.tax_number,
    cell: ({ row }) => (
      <p className="text-xs font-mono">
        { row.original.client_gst_no && <span className="text-blue-700 font-semibold">{row.original.client_gst_no}</span> }
        { row.original.tax_number && <span className="text-green-700 font-semibold">{row.original.tax_number}</span> }
        { !row.original.client_gst_no && !row.original.tax_number && <span>-</span> }
      </p>
    ),
  },
    {
        accessorKey: "sub_total",
        header: "Subtotal",
        cell: ({ row }) => (
            <span>{row.original.currency === "INR" ? "₹" : "$"} {Number(row.getValue("sub_total")).toLocaleString()}</span>
        ),
    },
    {
        accessorKey: "grand_total",
        header: "Total",
        cell: ({ row }) => {
            const amount = Number(row.getValue("grand_total"));
            const status = row.original.status;

            let color = "text-gray-600";

            if (status === "paid") color = "text-green-600";
            else if (status === "pending") color = "text-orange-500";
            else if (status === "overdue") color = "text-red-600";

            return (
                <span className={`font-semibold ${color}`}>
                    {row.original.currency === "INR" ? "₹" : "$"}  {amount.toLocaleString()}
                </span>
            );
        },
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const amount = Number(row.getValue("status"));
            const status = row.original.status;

            let color = "text-gray-600";

            if (status === "paid") color = "text-green-600";
            else if (status === "pending") color = "text-orange-500";
            else if (status === "overdue") color = "text-red-600";

            return (
                <span className={`font-semibold ${color}`}>
                    {row.original.status}
                </span>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Invoice Date",
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