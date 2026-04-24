import { fetchPendingInvoices, fetchServices, fetchServicesByExpiry, fetchStats } from "@/lib/actions/invoice"
import { DataTable } from "@/components/dataTable"
import { columns } from "@/components/Dashboard/pendingTableColumn"
import { endingServicesColumns } from "@/components/Dashboard/endindServicesTableColumn"
import AddInvoicePopup from "@/components/Invoice/addInvoicePopup"
import { CircleCheckBig, Clock, TrendingUp, Users } from "lucide-react"
import Pagination from "@/components/paginationComponent"
import SearchComponent from "@/components/SearchComponent"
import FinancialYearSelect from "@/components/Dashboard/FinancialYearSelector"
import { fetchClients } from "@/lib/actions/clients"
import { fetchCompanyData } from "@/lib/actions/users"
import { invoiceString } from "@/lib/currentInvoiceNo"

const today = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    invoice_page?: string
    invoice_limit?: string
    service_page?: string
    service_limit?: string
    search?: string
    fy?: string
  }>
}) {
  const params = await searchParams

  const invoicePage = Number(params.invoice_page) || 1
  const invoiceLimit = Number(params.invoice_limit) || 10

  const servicePage = Number(params.service_page) || 1
  const serviceLimit = Number(params.service_limit) || 10

  const search = params.search;

  const fy = params.fy

  const statData = await fetchStats(fy)

  const clientData = await fetchClients();
  const servicesData = await fetchServices();
  const companyData = await fetchCompanyData();

  const invoiceData = await fetchPendingInvoices(
    invoicePage,
    invoiceLimit,
    search
  )

  const expServices = await fetchServicesByExpiry(
    servicePage,
    serviceLimit
  )

  const invoiceNo = await invoiceString();


  return (
    <div className="flex flex-col gap-6 p-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-linear-to-r from-primary to-secondary text-primary-foreground rounded-2xl p-6 shadow-md">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome to Thaver Tech Invoice Generator 👋
          </h1>
          <p className="text-sm text-primary-foreground mt-1">
            Manage invoices, track services, and monitor payments — all in one place.
          </p>
          <p className="text-sm text-primary-foreground mt-2">
            {today}
          </p>
        </div>

        <AddInvoicePopup
          mode="new"
          ClientList={clientData?.data || []}
          ServicesList={servicesData?.data || []}
          companyData={companyData?.data || undefined}
          invoiceNo={invoiceNo}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div
          className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm"
        >
          <p className="flex justify-between text-sm text-muted-foreground">
            Total Sales <TrendingUp className="text-orange-500" size={20} />
          </p>
          <p className="text-2xl font-semibold ">
            ₹{statData.totalSales}
          </p>
        </div>

        <div
          className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm"
        >
          <p className="flex justify-between  text-sm text-muted-foreground">
            Pending Amount <Clock className="text-emerald-500" size={20} />
          </p>
          <p className="text-2xl font-semibold mt-2">
            ₹{statData.pendingAmount}
          </p>
        </div>

        <div
          className="rounded-xl border bg-card text-card-foreground p-5 shadow-sm"
        >
          <p className="flex justify-between text-sm text-muted-foreground">
            Paid Amount <CircleCheckBig className="text-green-700" size={20} />
          </p>
          <p className="text-2xl font-semibold mt-2">
            ₹{statData.paidAmount}
          </p>
        </div>

        <FinancialYearSelect />

      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b">
          <h2 className="text-lg font-semibold">
            Pending Invoices
          </h2>

          <div className="max-w-60 w-full">
            <SearchComponent placeholder="Search by Client name/Invoice ID..." />
          </div>
        </div>

        <div className="p-4">
          <DataTable data={invoiceData.data ?? []} columns={columns} />
          <Pagination
            totalPages={invoiceData.totalPages ?? 0}
            totalItems={invoiceData.total}
            paramPrefix="invoice"
          />
        </div>

      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">

        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b">
          <h2 className="text-lg font-semibold">
            Upcoming Ending Services
          </h2>
        </div>


        {/* Table */}

        <div className="p-4">
          <DataTable data={expServices.data ?? []} columns={endingServicesColumns} />
          <Pagination
            totalPages={expServices.totalPages ?? 0}
            totalItems={expServices.total}
            paramPrefix="service"
          />
        </div>

      </div>


    </div>
  )
}