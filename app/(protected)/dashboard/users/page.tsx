import { DataTable } from '@/components/dataTable'
import SearchComponent from '@/components/SearchComponent'
import AddUserPopup from '@/components/Users/addUserPopup'
import { columns } from '@/components/Users/tableColumns'
import { fetchUserData } from '@/lib/actions/users'
import React from 'react'

const Users = async () => {

  const userData = await fetchUserData()

  return (
    <div className="flex flex-col flex-1 space-y-6 min-h-0">

      {/* Header */}
      <section className="flex items-center justify-between border px-8 py-4 rounded-2xl bg-muted/50">
        <h1 className="font-semibold text-lg">Users</h1>
        <AddUserPopup />
      </section>

      {/* Content */}
      <section className="flex-1 bg-muted/50 border border-border p-4 rounded-2xl overflow-auto min-h-0 flex flex-col space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">User Records</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all your users.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-60">
          <SearchComponent placeholder="Search user by name..." />
        </div>
        {/* Table / List goes here */}
        {userData?.data &&
          <DataTable data={userData.data} columns={columns} />
        }
      </section>

    </div>
  )
}

export default Users