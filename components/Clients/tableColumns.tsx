"use client"

import { ClientData } from "@/lib/types/dataTypes"
import { ColumnDef } from "@tanstack/react-table"
import ViewInvoices from "./ViewInvoices";

export const columns: ColumnDef<ClientData>[] = [
  {
    accessorKey: "company_name",
    header: "Company",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorFn: (row) => `${row.city}, ${row.state}`,
    id: "location",
    header: "Location",
  },
  {
    accessorKey: "gst_number",
    header: "GST",
    cell: ({ row }) => (
      <span className="text-xs font-mono">
        {row.getValue("gst_number")}
      </span>
    ),
  },
  {
    accessorKey: "assigned_person",
    header: "Assigned Person",
  },
  {
  accessorKey: "id",
  header: "Action",
  cell: ({ row }) => {
    const id = row.getValue("id");

    return (
      <ViewInvoices id={Number(id)}/>
    );
  },
}
]