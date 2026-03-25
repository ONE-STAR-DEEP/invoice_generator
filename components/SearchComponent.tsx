"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const SearchComponent = (
    { placeholder } : { placeholder: string }
) => {

    const router = useRouter()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(searchParams.get("search") || "")
    const [debouncedValue, setDebouncedValue] = useState(search)

    // debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(search)
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    // update url after debounce
    useEffect(() => {

        const params = new URLSearchParams(searchParams.toString())

        if (debouncedValue) {
            params.set("search", debouncedValue)
        } else {
            params.delete("search")
        }

        router.push(`?${params.toString()}`)

    }, [debouncedValue, router])

    return (
        <Input
            type="text"
            placeholder={placeholder}
            className="bg-white border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    )
}

export default SearchComponent