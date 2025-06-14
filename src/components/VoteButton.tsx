import { cn } from "@/lib/utils"
import { databases } from "@/models/client/config"
import { db, votesCollection } from "@/models/name"
import { useAuthStore } from "@/ZustandStore/Auth"
import { Models, Query } from "appwrite"
import { useRouter } from "next/navigation"
import React from "react"

const VoteButton = async ({
    type,
    id,
    upvotes,
    downvotes,
    class_name
}: {
    type: 'question' | 'answer'
    id: string
    upvotes: Models.DocumentList<Models.Document>
    downvotes: Models.DocumentList<Models.Document>
    class_name?: string
}) => {
    const [votesDocument, setvotesDocument] = React.useState<Models.Document | null>()
    const [voteResult, setVoteResult] = React.useState<number>(upvotes.total = downvotes.total)

    const user = useAuthStore((state) => state.user)
    const router = useRouter()

    //checking if the user have voted already or not
    React.useEffect(() => {
        (
            async () => {
                if (user) {
                    const response = await databases.listDocuments(db, votesCollection, [
                        Query.equal('type', type),
                        Query.equal('typeId', id),
                        Query.equal('votedById', user.$id)
                    ])
                    setvotesDocument(() => response.documents[0] || null)
                }
            }
        )()
    }, [type, id, user])

    //toggle button
    const toggleUpButton = async () => {
        if (!user) router.push('/login')

        if (votesDocument === undefined) {
            console.log('no document found to toggle')
            return null
        }
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
                    voteStatus: "upvote",
                    typeId: id,
                    votedById: user?.$id,
                    type: type
                })
            })
            const data = await response.json()
            if (!response.ok) throw data

            setVoteResult(() => data.data.voteResult);
            setvotesDocument(() => data.data.document);
        } catch (error: any) {
            console.log(error?.message || 'error in togeling the button')
        }
    }

    const toggleDownButton = async () => {
        if (!user) router.push('/login')
        if (votesDocument === undefined) {
            console.log('error in downvote bcz it is undefined')
            return
        }
        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
                    voteStatus: "downvote",
                    typeId: id,
                    votedById: user?.$id,
                    type: type
                })
            })
            const data= await response.json()
            if(!response.ok) throw data
            setVoteResult(()=>data.data.voteResult)
            setvotesDocument(()=>data.data.document)
        } catch (error: any) {
            console.log(error?.message || 'error while downvote toggle')
        }
    }
    return (
        <div className={cn("flex shrink-0 flex-col items-center justify-start gap-y-4", class_name)}>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votesDocument && votesDocument.voteStatus === "upvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={toggleUpButton}
            >
                
            </button>
            <span>{voteResult}</span>
            <button
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
                    votesDocument && votesDocument.voteStatus === "downvoted"
                        ? "border-orange-500 text-orange-500"
                        : "border-white/30"
                )}
                onClick={toggleDownButton}
            >
                {/* <IconCaretDownFilled /> */}
            </button>
        </div>
    )
}

export default VoteButton