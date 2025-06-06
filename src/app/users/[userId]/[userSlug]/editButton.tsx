'use client'
import { useAuthStore } from "@/ZustandStore/Auth"
import Link from "next/link"
import { useParams } from "next/navigation"

const EditButton=()=>{
    const user=useAuthStore(state=> state.user)
    const {userId,userSlug}=useParams()
    if(user?.$id!==userId){
        return null
    }
    return(
        <Link
            href={`/users/${userId}/${userSlug}/edit`}
            className="mt-10 bg-blue-600 rounded-lg text-amber-50 font-bold border border-neutral-200 px-6 py-2 dark:border-white/[0.2]"
        >
            <span>Edit</span>
            <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </Link>
    )

}
export default EditButton