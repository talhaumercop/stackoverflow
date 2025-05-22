'use client'
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAuthStore } from "@/ZustandStore/Auth";

const layout=({children}:{children:React.ReactNode})=>{
    const {session}= createAuthStore()
    const router= useRouter()

    useEffect(()=>{
        if(session){
            router.push("/")
        }
    },[session,router])
    if(session){
        return null
    }
    return (
        <div>
            {children}
        </div>
    )
}
export default layout;