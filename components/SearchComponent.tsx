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

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(search)
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {

        const params = new URLSearchParams(searchParams.toString())

        if (debouncedValue) {
            params.set("search", debouncedValue)
        } else {
            params.delete("search")
        }

        router.push(`?${params.toString()}`, { scroll: false })

    }, [debouncedValue, router])

    return (
        <Input
            type="text"
            placeholder={placeholder}
            className="bg-white border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
    )
}

export default SearchComponent