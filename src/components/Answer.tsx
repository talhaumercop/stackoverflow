import { useAuthStore } from "@/ZustandStore/Auth";
import { Models } from "node-appwrite";
import React from "react";
import RTE, { MarkDownPreview } from "./RTE";
import { avatars } from "@/models/client/config";
import slugify from "@/utils/slugify";
import Link from "next/link";
import VoteButton from "./VoteButton";

const Answer = (
    { answers: _answers, questionId }
        :
        { answers: Models.DocumentList<Models.Document>, questionId: string }
) => {
    const [answer, setAnswer] = React.useState(_answers)
    const [newAnswer, setNewAnswer] = React.useState("")

    const user = useAuthStore(state => state.user)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!user || !newAnswer) return null
        try {
            const response = await fetch('/api/answer', {
                method: 'POST',
                body: JSON.stringify({
                    questionId: questionId,
                    authorId: user.$id,
                    answer: newAnswer
                })
            })
            console.log(response)// to see what the data was
            const data = await response.json()
            console.log(data)// to see how the data change
            if (!response.ok) throw data
            setNewAnswer(() => "")// remove the existing answer from input to add another 

            setAnswer(prev => ({
                total: prev.total + 1,
                documents: [
                    {
                        ...data,
                        author: user,
                        upvotesDocuments: { document: [], total: 0 },
                        downvotesDocuments: { document: [], total: 0 },
                        comments: { documents: [0], total: 0 }
                    },
                    ...prev.documents
                ]
            }))
        } catch (error: any) {
            console.log(error.message || 'error creating the answer')
        }
    }

    const deleteAnswer = async (answerId: string) => {
        try {
            const response = await fetch('/api/answer', {
                method: 'DELETE',
                body: JSON.stringify({
                    answerId: answerId
                })
            })
            const data = await response.json()
            if (!response.ok) throw data
            setAnswer((prev) => ({
                total: prev.total - 1,
                documents: prev.documents.filter(answer => answer.$id !== answerId)
            }
            ))

        } catch (error: any) {
            console.log(error?.message || 'ERROR DELETING THE ANSWER')
        }
    }

    return (
        <>
            <h2 className="mb-4 text-xl">{answer.total} Answers</h2>
            {answer.documents.map(ans => (
                <div key={ans.$id} className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <VoteButton
                            type="answer"
                            id={ans.$id}
                            upvotes={ans.upvotesDocuments}
                            downvotes={ans.downvotesDocuments}
                        />
                        {user?.$id === ans.authorId ? (
                            <button
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
                                onClick={() => deleteAnswer(ans.$id)}
                            >
                              🗑️
                            </button>
                        ) : null}
                    </div>
                    <div className="w-full overflow-auto">
                        <MarkDownPreview className="rounded-xl p-4" source={ans.content} />
                        <div className="mt-4 flex items-center justify-end gap-1">
                            <picture>
                                <img
                                    src={avatars.getInitials(ans.author.name, 36, 36)}//maybe.href
                                    alt={ans.author.name}
                                    className="rounded-lg"
                                />
                            </picture>
                            <div className="block leading-tight">
                                <Link
                                    href={`/users/${ans.author.$id}/${slugify(ans.author.name)}`}
                                    className="text-orange-500 hover:text-orange-600"
                                >
                                    {ans.author.name}
                                </Link>
                                <p>
                                    <strong>{ans.author.reputation}</strong>
                                </p>
                            </div>
                        </div>
                        {/* <Comments
                            comments={ans.comments}
                            className="mt-4"
                            type="answer"
                            typeId={ans.$id}
                        /> */}
                        <hr className="my-4 border-white/40" />
                    </div>
                </div>
            ))}
            <hr className="my-4 border-white/40" />
            <form onSubmit={handleSubmit} className="space-y-2">
                <h2 className="mb-4 text-xl">Your Answer</h2>
                <RTE value={newAnswer} onChange={value => setNewAnswer(() => value || "")} />
                <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
                    Post Your Answer
                </button>
            </form>
        </>
    )
}
export default Answer