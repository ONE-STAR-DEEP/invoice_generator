import { DataTable } from '@/components/dataTable';
import AddInvoicePopup from '@/components/Invoice/addInvoicePopup'
import { columns } from '@/components/Invoice/tableColumn';
import SearchComponent from '@/components/SearchComponent'
import { fetchClients } from '@/lib/actions/clients';
import { fetchAllInvoices, fetchServices } from '@/lib/actions/invoice';
import { fetchCompanyData } from '@/lib/actions/users';

const InvoicePage = async () => {

    const clientData = await fetchClients();
    const servicesData = await fetchServices();
    const companyData = await fetchCompanyData();
    const allInvoices = await fetchAllInvoices();

    return (
        <div className="flex flex-col flex-1 space-y-6 min-h-0">

            {/* Header */}
            <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
                <h1 className="font-semibold text-lg">Invoice</h1>
                <AddInvoicePopup
                    ClientList={clientData?.data || []}
                    ServicesList={servicesData?.data || []}
                    companyData={companyData?.data || undefined}
                />
            </section>

            {/* Content */}
            <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0 flex flex-col space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold">Invoice Records</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and view all past Invoices
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-60">
                    <SearchComponent placeholder="Search invoice by client name..." />
                </div>
                {/* Table / List goes here */}
                {allInvoices?.data &&
                    <DataTable data={allInvoices.data} columns={columns} />
                }
            </section>

        </div>
    )
}

export default InvoicePage