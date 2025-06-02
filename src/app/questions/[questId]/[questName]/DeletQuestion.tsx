'use client'

import { db, questionCollection } from "@/models/name"
import { client, databases } from "@/models/client/config"
import { useAuthStore } from "@/ZustandStore/Auth"
import { useRouter } from "next/navigation"

const DeleteQuestion = ({ questId, authorId }: { questId: string, authorId: string }) => {
    // Change this line to use useAuthStore instead of createAuthStore
    const { user, jwt } = useAuthStore()
    const router = useRouter()

    if (user?.$id === authorId) {
        const handleDelete = async () => {
            try {
                // Check for both user and JWT
                if (!user || !jwt) {
                    throw new Error('User not authenticated');
                }

                // Set the JWT for this request
                client.setJWT(jwt);

                await databases.deleteDocument(db, questionCollection, questId)
                router.push('/questions')
            } catch (error: any) {
                console.error("Delete failed:", error)
                window.alert(error?.message || 'Something went wrong while deleting the question.')
            }
        }

        return (
            <button 
                className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
                onClick={handleDelete}
            >
                🗑️
            </button>
        )
    }
    return null;
}

export default DeleteQuestion