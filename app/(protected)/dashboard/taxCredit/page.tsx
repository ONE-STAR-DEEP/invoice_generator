import { DataTable } from '@/components/dataTable';
import Filter from '@/components/Invoice/Filter';
import AddItemPopup from '@/components/item/addItemPopup';
import { columns } from '@/components/item/tableColumn';
import Pagination from '@/components/paginationComponent';
import SearchComponent from '@/components/SearchComponent'
import { fetchAllItems } from '@/lib/actions/taxCredit';

type PageProps = {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        status?: string;
    }>;
};

const InvoicePage = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 10;

    const search = params?.search

    const status = params?.status

    const allInvoices = await fetchAllItems(page, limit, search);

    return (
        <div className="flex flex-col flex-1 space-y-6 min-h-0">

            <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
                <h1 className="font-semibold text-lg">Input Tax Credit</h1>

                <div className='flex gap-2 items-center'>
                    <AddItemPopup
                        mode='new'
                    />
                </div>
            </section>

            <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0 flex flex-col space-y-6">

                <div>
                    <h1 className="text-2xl font-bold">Tax Credit Records</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and view all purchased Item
                    </p>
                </div>

                <div className='flex gap-2 flex-col md:flex-row'>
                    <div className="w-full max-w-60">
                        <SearchComponent placeholder="Search by Item name" />
                    </div>
                </div>

                {allInvoices?.data &&
                    <>
                        <DataTable data={allInvoices.data} columns={columns} />
                        <Pagination totalPages={allInvoices.pagination?.totalPages || 1} />
                    </>
                }
            </section>

        </div>
    )
}

export default InvoicePage