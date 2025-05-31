import { db, questionCollection } from "@/models/name"
import { databases } from "@/models/server/config"
import EditQuestion from "../EditQuestion"
import EditQuest from "./editQuest"

const Page=async({params}:{params:{questId:string,questName:string}})=>{
    const question =await databases.getDocument(db,questionCollection,params.questId)
    if(!question){
        return null
    }
    return(
        <div>
            <EditQuest question={question}/>
        </div>
    )
}
export default Page