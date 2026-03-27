"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PaginationProps = {
  totalPages: number
  totalItems?: number
  paramPrefix?: string
}

const Pagination = ({
  totalPages,
  totalItems,
  paramPrefix = "",
}: PaginationProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageKey = paramPrefix ? `${paramPrefix}_page` : "page"
  const limitKey = paramPrefix ? `${paramPrefix}_limit` : "limit"

  const page = Number(searchParams.get(pageKey) || 1)
  const limit = Number(searchParams.get(limitKey) || 10)

  const updateParams = (newPage: number, newLimit = limit) => {
    const params = new URLSearchParams(searchParams.toString())

    const safePage = Math.max(1, Math.min(newPage, totalPages))

    params.set(pageKey, String(safePage))
    params.set(limitKey, String(newLimit))

    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col items-center justify-between md:flex-row gap-4 mt-4">
      
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
        {totalItems !== undefined && (
          <span> • {totalItems} records</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => updateParams(page - 1)}
        >
          Prev
        </Button>

        <Input
          type="number"
          min={1}
          max={totalPages}
          value={page}
          onChange={(e) => updateParams(Number(e.target.value))}
          className="w-16 text-center"
        />

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => updateParams(page + 1)}
        >
          Next
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows per page</span>

        <Select
          value={String(limit)}
          onValueChange={(value) => updateParams(1, Number(value))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default Pagination