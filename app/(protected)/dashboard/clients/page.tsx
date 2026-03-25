import AddClientPopup from '@/components/Clients/addClientPopup'
import { columns } from '@/components/Clients/tableColumns';
import { DataTable } from '@/components/dataTable';
import SearchComponent from '@/components/SearchComponent';
import { fetchClients } from '@/lib/actions/clients'


const Clients = async () => {

  const data = await fetchClients();
  console.log(data)

  return (
    <div className="flex flex-col flex-1 space-y-6 min-h-0">

      {/* Header */}
      <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
        <h1 className="font-semibold text-lg">Clients</h1>
        <AddClientPopup />
      </section>

      {/* Content */}
      <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0 flex flex-col space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Client Records</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all your clients
          </p>
        </div>

        {/* Search */}
        <div className="max-w-60">
          <SearchComponent placeholder="Search client by name..." />
        </div>
        {/* Table / List goes here */}
        {data?.data &&
          <DataTable data={data.data} columns={columns} />
        }
      </section>

    </div>
  )
}

export default Clients