import { DataTable } from '@/components/dataTable'
import Pagination from '@/components/paginationComponent'
import { clientStateColumn } from '@/components/Reports/clientStateTable'
import StateParamSelect from '@/components/Reports/StateSelect'
import { columns } from '@/components/Reports/tableColumns'
import { fetchClientReport, fetchClientReportByState } from '@/lib/actions/invoice'

type Props = {
  searchParams: Promise<{
    state?: string
    cd_page?: string;
    csd_page?: string;
    cd_limit?: string;
    csd_limit?: string;
  }>;
};

const ReportsPage = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const state = params?.state;

  const cdPage = Number(params?.cd_page || 1);
  const csdPage = Number(params?.csd_page || 1);

  const cdLimit = Number(params?.cd_limit || 10)
  const csdLimit = Number(params?.csd_limit || 10)

  const clientData = await fetchClientReport(cdPage, cdLimit)

  const clientStateData = await fetchClientReportByState(
    state,
    csdPage,
    csdLimit
  )

  return (

    <div className="flex flex-col flex-1 space-y-6 min-h-0">

      <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
        <h1 className="font-semibold text-lg">Reports</h1>

      </section>

      <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <div className='space-y-4 border p-2 rounded-lg'>
            <h3 className='text-2xl font-bold'>Cash Records</h3>
            <DataTable data={clientData.data} columns={columns} />
            <Pagination totalPages={clientData.pagination?.totalPages || 1} paramPrefix='cd' />
          </div>

          <div className='space-y-4 border p-2 rounded-lg'>
            <div className='flex items-center justify-between'>
              <h3 className='text-2xl font-bold'>State Wise Clients</h3>
              <StateParamSelect />
            </div>
            <DataTable data={clientStateData.data} columns={clientStateColumn} />
            <Pagination totalPages={clientStateData.pagination?.totalPages || 1} paramPrefix='csd' />
          </div>
        </div>

      </section>

    </div>
  )
}

export default ReportsPage