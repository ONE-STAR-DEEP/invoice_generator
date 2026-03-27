import React from 'react'

const PaymentsPage = () => {
  return (
    <div className="flex flex-col flex-1 space-y-6 min-h-0">

      <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
        <h1 className="font-semibold text-lg">Payments</h1>

      </section>

      <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0">
        <div className='h-full w-full flex items-center justify-center'>
          <p className='text-5xl font-bold'>Cooming Soon</p>
        </div>

      </section>

    </div>
  )
}

export default PaymentsPage