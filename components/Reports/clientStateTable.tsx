"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientLocationReport } from "@/lib/types/dataTypes";

export const clientStateColumn: ColumnDef<ClientLocationReport>[] = [
  {
    accessorKey: "client_name",
    header: "Client",
  },

  // ✅ NEW: Location columns
  {
    accessorKey: "client_city",
    header: "City",
  },
  {
    accessorKey: "client_state",
    header: "State",
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
    accessorKey: "total_invoices",
    header: "Invoices",
    cell: ({ row }) => (
      <span className="font-medium">
        {Number(row.getValue("total_invoices"))}
      </span>
    ),
  },

  {
    accessorKey: "total_items",
    header: "Items",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-medium">
        {Number(row.getValue("total_items"))}
      </span>
    ),
  },
];