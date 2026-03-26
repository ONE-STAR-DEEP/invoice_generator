"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserData } from "@/lib/types/dataTypes"

export const columns: ColumnDef<UserData>[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="">
        {row.getValue("email")}
      </span>
    ),
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="capitalize font-medium">
        {row.getValue("role")}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "id",
    header: "ID",
  },
]