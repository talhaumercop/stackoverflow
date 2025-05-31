'use client'

import QuestionForm from "@/components/questionForm"
import slugify from "@/utils/slugify"
import { createAuthStore } from "@/ZustandStore/Auth"
import { useRouter } from "next/navigation"
import { Models } from "node-appwrite"
import { useEffect } from "react"


const EditQuest=({question}:{question:Models.Document})=>{
    const user= createAuthStore((state)=> state.user)
    const router= useRouter()
    useEffect(()=>{
        if(user?.$id !== question.author){
            router.push(`/questions/${question.$id}/${slugify(question.title)}`)
        }
    },[])
    if(user?.$id!== question.author){
        return null
    }
    return(
           <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-purple-900 to-zinc-950">
        <QuestionForm question={question}/>
        </div>
    )
}
export default EditQuest