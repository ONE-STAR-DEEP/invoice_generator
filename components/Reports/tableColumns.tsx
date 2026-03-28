"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ClientReport } from "@/lib/actions/invoice";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<ClientReport>[] = [
  {
    accessorKey: "client_name",
    header: "Client",
  },

  // ✅ TOTAL AMOUNT (Sortable)
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1"
      >
        Total Amount <ArrowUpDown size={14} />
      </button>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId) ?? 0);
      const b = Number(rowB.getValue(columnId) ?? 0);
      return a - b;
    },
    cell: ({ row }) => (
      <span className="font-semibold">
        ₹{Number(row.getValue("total_amount")).toLocaleString()}
      </span>
    ),
  },

  // ✅ PAID AMOUNT (Sortable)
  {
    accessorKey: "paid_amount",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Paid <ArrowUpDown size={14} />
      </button>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId) ?? 0);
      const b = Number(rowB.getValue(columnId) ?? 0);
      return a - b;
    },
    cell: ({ row }) => (
      <span className="text-green-600 font-medium">
        ₹{Number(row.getValue("paid_amount")).toLocaleString()}
      </span>
    ),
  },

  // ✅ PENDING AMOUNT (Sortable)
  {
    accessorKey: "pending_amount",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pending <ArrowUpDown size={14} />
      </button>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId) ?? 0);
      const b = Number(rowB.getValue(columnId) ?? 0);
      return a - b;
    },
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
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Paid <ArrowUpDown size={14} />
      </button>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId) ?? 0);
      const b = Number(rowB.getValue(columnId) ?? 0);
      return a - b;
    },
    cell: ({ row }) => (
      <span className="text-green-600">
        {Number(row.getValue("paid_invoices"))}
      </span>
    ),
  },

  {
    accessorKey: "pending_invoices",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Pending <ArrowUpDown size={14} />
      </button>
    ),
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId) ?? 0);
      const b = Number(rowB.getValue(columnId) ?? 0);
      return a - b;
    },
    cell: ({ row }) => (
      <span className="text-red-500">
        {Number(row.getValue("pending_invoices"))}
      </span>
    ),
  },
];