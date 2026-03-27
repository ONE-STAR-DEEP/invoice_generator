"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientReport } from "@/lib/actions/invoice";

export const columns: ColumnDef<ClientReport>[] = [
  {
    accessorKey: "client_name",
    header: "Client",
  },

  {
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => (
      <span className="font-semibold">
        ₹{Number(row.getValue("total_amount")).toLocaleString()}
      </span>
    ),
  },

  {
    accessorKey: "paid_amount",
    header: "Paid",
    cell: ({ row }) => (
      <span className="text-green-600 font-medium">
        ₹{Number(row.getValue("paid_amount")).toLocaleString()}
      </span>
    ),
  },

  {
    accessorKey: "pending_amount",
    header: "Pending",
    cell: ({ row }) => (
      <span className="text-red-500 font-medium">
        ₹{Number(row.getValue("pending_amount")).toLocaleString()}
      </span>
    ),
  },

  {
    accessorKey: "total_invoices",
    header: "Invoices",
  },

  {
    accessorKey: "paid_invoices",
    header: "Paid",
    cell: ({ row }) => (
      <span className="text-green-600">
        {Number(row.getValue("paid_invoices"))}
      </span>
    ),
  },

  {
    accessorKey: "pending_invoices",
    header: "Pending",
    cell: ({ row }) => (
      <span className="text-red-500">
        {Number(row.getValue("pending_invoices"))}
      </span>
    ),
  },
];