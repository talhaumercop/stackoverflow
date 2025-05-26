'use client'

import { attachmentBucket, db, questionCollection } from "@/models/name";
import { databases, storage } from "@/models/server/config";
import slugify from "@/utils/slugify";
import { createAuthStore } from "@/ZustandStore/Auth"
import { useRouter } from "next/navigation";
import { ID, Models } from "node-appwrite"
import React from "react"

export const QuestionForm = ({ question }: { question?: Models.Document }) => {
    const { user } = createAuthStore()
    const router = useRouter()
    const [tag, setTag] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [formData, setFormData] = React.useState({
        title: question?.title || "",
        content: question?.content || "",
        author: user?.$id,
        tags: new Set((question?.tags || []) as string),
        attachment: null as File | null
    })

    // create the question
    const create = async () => {
       try {
         if (!formData.title || !formData.content || !formData.author || !formData.attachment) {
            setError("Title, Content , Attachment and Author are required")
            return
        }
        const attachmentIDresponse = await storage.createFile(attachmentBucket, ID.unique(), formData.attachment as File)
        const data = {
            title: formData.title,
            content: formData.content,
            author: formData.author,
            tags: Array.from(formData.tags),
            attachmentId: attachmentIDresponse.$id
        }
        const question = await databases.createDocument(db, questionCollection, ID.unique(), data)
        return question
       } catch (error:any) {
        return setError(error.message || "Something went wrong while creating the question")
       }
    }
    // update the question
    // if question is provided, update the question
    const update = async () => {
        try {
            if(!question) {
                setError("Question not found")
                return
            }
            const attachmentId= await (async()=>{
                if(!formData.attachment) return question.attachmentId
                await storage.deleteFile(attachmentBucket,question.attachmentId)
                const createFile= await storage.createFile(attachmentBucket,ID.unique(),formData.attachment as File)
                return createFile.$id
            })
            const data={
                title: formData.title,
                content: formData.content,
                author:formData.author,
                tags: Array.from(formData.tags),
                attachmentId: attachmentId
            }
            const updatedQuestion= await databases.updateDocument(db, questionCollection, question.$id, data)
            return updatedQuestion
        } catch (error:any) {
            return setError(error.message || "Something went wrong while updating the question")
        }
    }

    // handle form submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        if(!formData.title || !formData.content || !formData.author) {
            setError("Title, Content and Author are required")
            setLoading(false)
            return
        }
        try {
            const response=question? await update() : await create()
            
            router.push(`/questions/${response?.$id}/${slugify(formData.title)}`)
        } catch (error:any) {
            setError(error.message || "Something went wrong in the form submission")
            
        }
    }
    setLoading(() => false)
    return (
        <div></div>
    )
}