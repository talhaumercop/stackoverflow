'use client'

import { attachmentBucket, db, questionCollection } from "@/models/name";
import { databases, storage } from "@/models/server/config";
import slugify from "@/utils/slugify";
import { createAuthStore } from "@/ZustandStore/Auth"
import { useRouter } from "next/navigation";
import { ID, Models } from "node-appwrite"
import React from "react"
import RTE from "./RTE";
import { ConfettiButton } from "./magicui/confetti";

const QuestionForm = ({ question }: { question?: Models.Document }) => {
    const user = createAuthStore((state) => state.user)
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
    React.useEffect(() => {
        if (user?.$id) {
          setFormData(prev => ({
            ...prev,
            author: user.$id
          }));
        }
      }, [user]);
      
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
            const attachmentId = await (async () => {
                if (!formData.attachment) return question.attachmentId;
                await storage.deleteFile(attachmentBucket, question.attachmentId);
                const createFile = await storage.createFile(attachmentBucket, ID.unique(), formData.attachment as File);
                return createFile.$id;
              })();
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
    React.useEffect(() => {
        setLoading(false)
      }, [])
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto p-6 bg-black/20 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">
            {question ? "Update Question" : "Ask a Question"}
        </h1>
        
        {error && (
            <p className="text-red-400 bg-red-900/50 p-3 rounded-lg border border-red-700">
                {error}
            </p>
        )}
        
        <div className="space-y-1">
            <label htmlFor="title" className="text-gray-300 text-sm font-medium">Title</label>
            <input
                type="text"
                id="title"
                placeholder="What's your question about?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
            />
        </div>
        
        <div className="space-y-1">
            <label htmlFor="content" className="text-gray-300 text-sm font-medium">
                What are your problems? (Describe in detail)
            </label>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
                <RTE
                    value={formData.content}
                    onChange={value => setFormData(prev => ({ ...prev, content: value || "" }))}
                    className="bg-gray-800 text-white"
                />
            </div>
        </div>
        
        <div className="space-y-1">
            <label className="text-gray-300 text-sm font-medium">Attachment (optional)</label>
            <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                    <div className="p-3 bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                        <span className="text-gray-400">
                            {formData.attachment ? formData.attachment.name : "Click to upload image"}
                        </span>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setFormData({ ...formData, attachment: e.target.files[0] })
                            }
                        }}
                        className="hidden"
                    />
                </label>
                {formData.attachment && (
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, attachment: null })}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove attachment"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
        
        <div className="space-y-2">
            <label htmlFor="tag" className="text-gray-300 text-sm font-medium">Tags</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    id="tag"
                    placeholder="Add a tag (e.g. javascript, react)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                    type="button"
                    onClick={() => {
                        if (tag.trim()) {
                            setFormData((prev) => ({
                                ...prev,
                                tags: new Set(prev.tags).add(tag.trim())
                            }))
                            setTag("")
                        }
                    }}
                >
                   ADD
                </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
                {Array.from(formData.tags).map((t, index) => (
                    <span key={index} className="flex items-center gap-1 bg-gray-800 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {t}
                        <button
                            type="button"
                            onClick={() => {
                                const newTags = new Set(formData.tags)
                                newTags.delete(t)
                                setFormData({ ...formData, tags: newTags })
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                        >
                            &times;
                        </button>
                    </span>
                ))}
            </div>
        </div>
        
        <button
            type="submit"
            className={`mt-4 p-3 rounded-lg font-medium text-white transition-colors ${loading ? 'bg-green-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
            disabled={loading}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                </span>
            ) : question ? "Update Question" : "Ask Question"}
        </button>
    </form>
    )
}
export default QuestionForm;