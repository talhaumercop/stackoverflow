'use client'
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React from "react"

const Search=()=>{
    const router=useRouter()
    const pathname= usePathname()
    const searchParams=useSearchParams()
    const [search,setSearch]=React.useState(searchParams.get('search')|| '')

    React.useEffect(()=>{
       setSearch(()=> searchParams.get('search')||'') 
    },[searchParams])

    const fromSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        const newSearchParams=new URLSearchParams(searchParams)
        newSearchParams.set('search',search)
       router.push(`${pathname}?${newSearchParams.toString()}`);
    }
    return(
        <form className="flex w-full flex-row gap-4" onSubmit={fromSubmit}>
            <input 
            type="text" 
            placeholder="search Questions"
            value={search}
            onChange={e => setSearch(e.target.value)}
            />
            <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                Search
            </button>
        </form>
    )

}
export default Search