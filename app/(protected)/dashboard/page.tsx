"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const stats = [
  { title: "Total Sales", value: "₹0" },
  { title: "Pending", value: "₹0" },
  { title: "Paid", value: "₹0" },
  { title: "Clients", value: "₹0" },
]

const invoices = [
  { id: "INV-001", client: "Client 1", amount: "₹5000", status: "Paid" },
  { id: "INV-002", client: "Client 2", amount: "₹5000", status: "Paid" },
  { id: "INV-003", client: "Client 3", amount: "₹5000", status: "Paid" },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <Button>
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">
              {item.title}
            </p>
            <p className="text-2xl font-semibold mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">

        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b">
          <h2 className="text-lg font-semibold">
            Recent Invoices
          </h2>

          <Input
            placeholder="Search..."
            className="w-full sm:w-64"
          />
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-150">

            {/* Header */}
            <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground px-4 py-3 border-b">
              <span>Invoice #</span>
              <span>Client</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {invoices.map((inv, i) => (
              <div
                key={i}
                className="grid grid-cols-4 px-4 py-3 text-sm border-b last:border-0"
              >
                <span>{inv.id}</span>
                <span>{inv.client}</span>
                <span>{inv.amount}</span>

                <span className="text-primary font-medium">
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}