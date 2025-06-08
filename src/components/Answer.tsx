import { useAuthStore } from "@/ZustandStore/Auth";
import { Models } from "node-appwrite";
import React from "react";

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
                body:JSON.stringify({
                    questionId: questionId,
                    authorId:user.$id,
                    answer:newAnswer
                })
            })
            console.log(response)// to see what the data was
            const data= await response.json()
            console.log(data)// to see how the data change
            if(!response.ok) throw data
            setNewAnswer(()=> "")// remove the existing answer from input to add another 

            setAnswer(prev => ({
                total:prev.total+1,
                documents:[
                    {
                        ...data,
                        author:user,
                        upvotesDocuments:{document:[],total:0},
                        downvotesDocuments:{document:[],total:0},
                        comments:{documents:[0],total:0}
                    },
                    ...prev.documents
                ]
            }))


        } catch (error: any) {
            console.log(error.message || 'error creating the answer')
        }
    }
}