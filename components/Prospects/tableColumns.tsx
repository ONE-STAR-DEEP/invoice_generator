"use client"

import { ProspectData } from "@/lib/types/dataTypes"
import { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react";

export const columns: ColumnDef<ProspectData>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "company",
    header: "Company",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "visiting_date",
    header: "Visiting Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("visiting_date"))
      return <span>{date.toLocaleDateString()}</span>
    },
  },
  {
    accessorKey: "id",
    header: "Action",
    cell: ({ row }) => {
      const id = row.getValue("id");

      return (
        // <ViewInvoices id={Number(id)} />
        <Eye onClick={() => window.open(row.original.visiting_card, "_blank")} size={16} className="hover: cursor-pointer" />
      );
    },
  }
]