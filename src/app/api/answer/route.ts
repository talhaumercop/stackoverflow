import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPreferences } from "@/ZustandStore/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request:NextRequest){
    try {
        const {questionId,answer,authorId}=await request.json()
        if(!questionId || !answer || !authorId){
            return NextResponse.json({
                error:"missing required fields"
            },{status:400})
        }
        const response= await databases.createDocument(db,answerCollection,ID.unique(),{
            questionId:questionId,
            author:authorId,
            content:answer
        })
        //update the user preferences
        const prefs= await users.getPrefs<UserPreferences>(authorId)
        await users.updatePrefs(authorId, {
            reputation: Number(prefs.reputation) + 1
        })
        return NextResponse.json({
            success:true,
            message:"answer created successfully",
            data:response
        },{status:201})
    } catch (error:any) {
        return NextResponse.json({
            error:error?.message || "error creating the answer"
        },{status:500})
    }
}